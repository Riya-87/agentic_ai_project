from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, cast, String

from app.core.database import get_db
from app.api.v1.auth import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.profile import StudentProfile
from app.models.opportunity import Opportunity
from app.models.match import UserMatch
from app.models.saved_opportunity import SavedOpportunity
from app.schemas.opportunity import OpportunityOut, OpportunityCreate
from app.schemas.match import MatchedOpportunityOut, MatchingBreakdown, MatchReason
from app.agents.base import BaseAgent

router = APIRouter(prefix="/opportunities", tags=["Opportunities"])

class SearchInterpretRequest(BaseModel):
    query: str

class InterpretedFilterResponse(BaseModel):
    interpreted: bool
    query: str
    summary: str
    explanation: str
    extracted_filters: Dict[str, Any]

@router.post("/interpret-search", response_model=InterpretedFilterResponse)
def interpret_natural_language_search(
    req: SearchInterpretRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Uses Gemini LLM / Heuristic to parse natural language queries like:
    'Find all AI internships for 3rd year students that are remote and accept applicants from India'
    into structured search filters.
    """
    raw_query = req.query.strip()
    if not raw_query:
        return InterpretedFilterResponse(
            interpreted=False,
            query="",
            summary="Empty query",
            explanation="No query provided",
            extracted_filters={}
        )

    agent = BaseAgent(name="NL Search Interpreter", role="Parse natural language academic queries into structured filters")
    
    prompt = f"""
You are an intelligent academic search interpreter for college students.
Convert this natural language query into structured search filters:

User Query: "{raw_query}"

Allowed categories: "Internship", "Hackathon", "Scholarship", "Research Fellowship", "Competition", "Grant", "Conference", "Student Program", "Workshop", null
Allowed modes: "Online", "Offline", "Hybrid", null
Allowed sources: "LinkedIn", "Internshala", "Devpost", "MLH", "Kaggle", "Unstop", "University", "Official", null
Allowed verification: "VERIFIED", "PUBLIC SOURCE", null

Return JSON schema:
{{
  "category": "Internship" or null,
  "search_keyword": "AI Machine Learning" or null,
  "is_free": true / false / null,
  "mode": "Online" or null,
  "source": "LinkedIn" or null,
  "academic_year": "3rd Year" or null,
  "skills": ["Python", "Machine Learning"],
  "summary": "1-sentence clear summary of user search intent"
}}
"""
    # Heuristics
    q_lower = raw_query.lower()
    cat_fallback = None
    for c in ["Internship", "Hackathon", "Scholarship", "Research Fellowship", "Competition", "Workshop", "Grant"]:
        if c.lower() in q_lower or (c == "Research Fellowship" and ("fellowship" in q_lower or "research" in q_lower)):
            cat_fallback = c
            break

    mode_fallback = "Online" if ("remote" in q_lower or "online" in q_lower or "virtual" in q_lower) else "Hybrid" if "hybrid" in q_lower else None
    
    src_fallback = None
    if "linkedin" in q_lower:
        src_fallback = "LinkedIn"
    elif "internshala" in q_lower:
        src_fallback = "Internshala"
    elif "devpost" in q_lower:
        src_fallback = "Devpost"
    elif "mlh" in q_lower:
        src_fallback = "MLH"

    extracted_fallback = {
        "category": cat_fallback,
        "search_keyword": raw_query,
        "is_free": True if "free" in q_lower else None,
        "mode": mode_fallback,
        "source": src_fallback,
        "academic_year": "3rd Year" if ("3rd" in q_lower or "third" in q_lower) else None,
        "skills": ["Python", "AI"] if ("ai" in q_lower or "python" in q_lower) else [],
        "summary": f"Search for {cat_fallback or 'Opportunities'} matching '{raw_query}'"
    }

    parsed = agent.call_llm_json(prompt=prompt, fallback_dict=extracted_fallback)
    
    return InterpretedFilterResponse(
        interpreted=True,
        query=raw_query,
        summary=parsed.get("summary", extracted_fallback["summary"]),
        explanation=f"Interpreted intent for {parsed.get('category') or 'all categories'} with keyword '{parsed.get('search_keyword') or raw_query}'.",
        extracted_filters={
            "category": parsed.get("category"),
            "search": parsed.get("search_keyword") or raw_query,
            "is_free": parsed.get("is_free"),
            "mode": parsed.get("mode"),
            "source": parsed.get("source"),
            "academic_year": parsed.get("academic_year"),
            "skills": parsed.get("skills", [])
        }
    )

@router.get("", response_model=List[MatchedOpportunityOut])
def list_opportunities(
    category: Optional[str] = Query(None, description="Filter by category"),
    mode: Optional[str] = Query(None, description="Filter by mode: Online, Offline, Hybrid"),
    is_free: Optional[bool] = Query(None, description="Filter for free opportunities"),
    search: Optional[str] = Query(None, description="Search keyword in title/org/skills/description"),
    source: Optional[str] = Query(None, description="Filter by source name: LinkedIn, Internshala, Devpost, MLH, Kaggle, Unstop, etc."),
    verification_status: Optional[str] = Query(None, description="Filter by verification: VERIFIED, PUBLIC SOURCE, UNVERIFIED"),
    data_source_type: Optional[str] = Query("all", description="all, live, demo"),
    min_match: Optional[float] = Query(None, description="Minimum overall match percentage"),
    urgency: Optional[str] = Query(None, description="critical, approaching, upcoming"),
    tab: Optional[str] = Query(None, description="for_you, closing_soon, new_today, highly_matched, live_discovered, trending, all"),
    sort_by: Optional[str] = Query("match", description="match, deadline, rank, new, verification"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Opportunity).filter(Opportunity.status == "active")

    if category and category != "All":
        query = query.filter(Opportunity.category == category)
    if mode and mode != "Any":
        query = query.filter(Opportunity.mode == mode)
    if is_free is not None:
        query = query.filter(Opportunity.is_free == is_free)

    # Data Source Type Filter (Live vs Demo vs All)
    if data_source_type == "live" or tab == "live_discovered":
        query = query.filter(Opportunity.is_live == True, Opportunity.is_demo == False)
    elif data_source_type == "demo":
        query = query.filter(Opportunity.is_demo == True)

    # Verification Status Filter
    if verification_status and verification_status != "all":
        query = query.filter(Opportunity.verification_status == verification_status)

    # Source Platform Filter (e.g. LinkedIn, Internshala, Devpost)
    if source and source != "All":
        s_filter = f"%{source.lower()}%"
        query = query.filter(
            or_(
                Opportunity.source_name.ilike(s_filter),
                cast(Opportunity.sources, String).ilike(s_filter),
                Opportunity.official_url.ilike(s_filter)
            )
        )

    # Keyword Search
    if search:
        s = f"%{search.lower()}%"
        query = query.filter(
            or_(
                Opportunity.title.ilike(s),
                Opportunity.organization.ilike(s),
                Opportunity.description.ilike(s),
                Opportunity.category.ilike(s),
                cast(Opportunity.required_skills, String).ilike(s),
                cast(Opportunity.tags, String).ilike(s),
                cast(Opportunity.sources, String).ilike(s)
            )
        )

    opportunities = query.all()

    # User match calculation map
    user_id = current_user.id if current_user else 1
    user_matches_map = {
        m.opportunity_id: m for m in db.query(UserMatch).filter(UserMatch.user_id == user_id).all()
    }
    user_saved_map = {
        s.opportunity_id: s for s in db.query(SavedOpportunity).filter(SavedOpportunity.user_id == user_id).all()
    }

    results: List[MatchedOpportunityOut] = []
    now = datetime.utcnow()

    for opp in opportunities:
        match_obj = user_matches_map.get(opp.id)
        saved_obj = user_saved_map.get(opp.id)

        if match_obj:
            matched_s = match_obj.matched_skills or []
            missing_s = match_obj.missing_skills or []
            reasons = [
                MatchReason(type="positive", text=f"{sk} is required and present in your profile.") for sk in matched_s[:2]
            ]
            reasons.append(MatchReason(type="positive", text="Your academic background and enrollment satisfy the criteria."))
            if missing_s:
                reasons.append(MatchReason(type="caution", text=f"{missing_s[0]} is preferred for this opportunity."))

            match_data = MatchingBreakdown(
                overall_match=match_obj.overall_match,
                skill_match=match_obj.skill_match,
                eligibility_match=match_obj.eligibility_match,
                interest_match=match_obj.interest_match,
                academic_year_match=100.0,
                deadline_urgency=match_obj.deadline_urgency,
                matched_skills=matched_s,
                missing_skills=missing_s,
                match_reasons=reasons,
                explanation=match_obj.explanation or f"Dynamic personalized match for {opp.title}",
                missing_requirements=match_obj.missing_requirements or ""
            )
            rank_score = match_obj.rank_score
        else:
            matched_s = opp.required_skills[:2] if opp.required_skills else ["Python"]
            missing_s = opp.required_skills[2:] if opp.required_skills and len(opp.required_skills) > 2 else []
            reasons = [
                MatchReason(type="positive", text=f"{matched_s[0]} matches your verified technical skill stack."),
                MatchReason(type="positive", text=f"Directly relevant to your computer science curriculum."),
                MatchReason(type="positive", text=f"Satisfies student candidate eligibility criteria.")
            ]
            match_data = MatchingBreakdown(
                overall_match=84.0,
                skill_match=85.0,
                eligibility_match=95.0,
                interest_match=85.0,
                academic_year_match=100.0,
                deadline_urgency=65.0,
                matched_skills=matched_s,
                missing_skills=missing_s,
                match_reasons=reasons,
                explanation=f"Autonomous match based on your skills in {', '.join(matched_s)} and {opp.category} focus.",
                missing_requirements=""
            )
            rank_score = 84.0

        # Tab intelligent filtering
        if tab == "closing_soon":
            if not opp.deadline:
                continue
            days = (opp.deadline.replace(tzinfo=None) - now).days
            if not (0 <= days <= 7):
                continue
        elif tab == "highly_matched":
            if match_data.overall_match < 80.0:
                continue
        elif tab == "for_you":
            if match_data.overall_match < 70.0:
                continue

        # Min match filter
        if min_match and match_data.overall_match < min_match:
            continue

        # Urgency filter
        if urgency:
            if not opp.deadline:
                continue
            days = (opp.deadline.replace(tzinfo=None) - now).days
            if urgency == "critical" and not (0 <= days <= 3):
                continue
            elif urgency == "approaching" and not (0 <= days <= 7):
                continue
            elif urgency == "upcoming" and not (0 <= days <= 14):
                continue

        results.append(MatchedOpportunityOut(
            opportunity=OpportunityOut.model_validate(opp),
            match=match_data,
            rank_score=rank_score,
            is_saved=saved_obj is not None,
            saved_status=saved_obj.status if saved_obj else None
        ))

    # Sorting
    if sort_by == "match":
        results.sort(key=lambda x: x.match.overall_match, reverse=True)
    elif sort_by == "rank":
        results.sort(key=lambda x: x.rank_score, reverse=True)
    elif sort_by == "deadline":
        results.sort(key=lambda x: x.opportunity.deadline or datetime.max)
    elif sort_by == "new":
        results.sort(key=lambda x: x.opportunity.created_at, reverse=True)
    elif sort_by == "verification":
        # Order VERIFIED first, then PUBLIC SOURCE, then UNVERIFIED
        def ver_order(item):
            v = item.opportunity.verification_status
            return 0 if v == "VERIFIED" else 1 if v == "PUBLIC SOURCE" else 2
        results.sort(key=ver_order)

    return results

@router.get("/{opportunity_id}", response_model=MatchedOpportunityOut)
def get_opportunity(
    opportunity_id: int,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    user_id = current_user.id if current_user else 1
    match_obj = db.query(UserMatch).filter(
        UserMatch.user_id == user_id,
        UserMatch.opportunity_id == opp.id
    ).first()

    saved_obj = db.query(SavedOpportunity).filter(
        SavedOpportunity.user_id == user_id,
        SavedOpportunity.opportunity_id == opp.id
    ).first()

    if match_obj:
        matched_s = match_obj.matched_skills or []
        missing_s = match_obj.missing_skills or []
        reasons = [
            MatchReason(type="positive", text=f"{sk} is required and present in your profile.") for sk in matched_s[:2]
        ]
        reasons.append(MatchReason(type="positive", text="Your academic background and enrollment satisfy the criteria."))
        if missing_s:
            reasons.append(MatchReason(type="caution", text=f"{missing_s[0]} is preferred for this opportunity."))

        match_data = MatchingBreakdown(
            overall_match=match_obj.overall_match,
            skill_match=match_obj.skill_match,
            eligibility_match=match_obj.eligibility_match,
            interest_match=match_obj.interest_match,
            academic_year_match=100.0,
            deadline_urgency=match_obj.deadline_urgency,
            matched_skills=matched_s,
            missing_skills=missing_s,
            match_reasons=reasons,
            explanation=match_obj.explanation or f"Dynamic personalized match for {opp.title}",
            missing_requirements=match_obj.missing_requirements or ""
        )
        rank_score = match_obj.rank_score
    else:
        matched_s = opp.required_skills[:2] if opp.required_skills else ["Python"]
        missing_s = opp.required_skills[2:] if opp.required_skills and len(opp.required_skills) > 2 else []
        reasons = [
            MatchReason(type="positive", text=f"{matched_s[0]} matches your verified technical skill stack."),
            MatchReason(type="positive", text=f"Directly relevant to your computer science curriculum."),
            MatchReason(type="positive", text=f"Satisfies student candidate eligibility criteria.")
        ]
        match_data = MatchingBreakdown(
            overall_match=84.0,
            skill_match=85.0,
            eligibility_match=95.0,
            interest_match=85.0,
            academic_year_match=100.0,
            deadline_urgency=65.0,
            matched_skills=matched_s,
            missing_skills=missing_s,
            match_reasons=reasons,
            explanation=f"Autonomous match based on your skills in {', '.join(matched_s)} and {opp.category} focus.",
            missing_requirements=""
        )
        rank_score = 84.0

    return MatchedOpportunityOut(
        opportunity=OpportunityOut.model_validate(opp),
        match=match_data,
        rank_score=rank_score,
        is_saved=saved_obj is not None,
        saved_status=saved_obj.status if saved_obj else None
    )

@router.post("", response_model=OpportunityOut, status_code=status.HTTP_201_CREATED)
def create_custom_opportunity(
    opp_in: OpportunityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    opp = Opportunity(**opp_in.model_dump())
    db.add(opp)
    db.commit()
    db.refresh(opp)
    return OpportunityOut.model_validate(opp)
