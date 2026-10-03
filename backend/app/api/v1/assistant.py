from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.profile import StudentProfile
from app.models.opportunity import Opportunity
from app.models.match import UserMatch
from app.schemas.assistant import AIChatRequest, AIChatResponse
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/assistant", tags=["AI Academic Copilot"])

@router.post("/chat", response_model=AIChatResponse)
def chat_with_academic_copilot(
    payload: AIChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    prof_dict = {
        "degree": profile.degree if profile else "B.Tech",
        "branch": profile.branch if profile else "Computer Science",
        "academic_year": profile.academic_year if profile else "3rd Year",
        "skills": profile.skills if profile else ["Python", "Machine Learning"],
        "interests": profile.interests if profile else ["AI", "Open Source"],
        "preferred_categories": profile.preferred_categories if profile else ["Hackathon", "Fellowship"],
        "preferred_location": profile.preferred_location if profile else "Remote",
        "mode_preference": profile.mode_preference if profile else "Any"
    }

    # Retrieve user's top matches from database
    user_matches = db.query(UserMatch).filter(
        UserMatch.user_id == current_user.id
    ).order_by(UserMatch.rank_score.desc()).limit(15).all()

    matched_opportunities = []
    for m in user_matches:
        opp = db.query(Opportunity).filter(Opportunity.id == m.opportunity_id).first()
        if opp:
            matched_opportunities.append({
                "opportunity": {
                    "id": opp.id,
                    "title": opp.title,
                    "organization": opp.organization,
                    "category": opp.category,
                    "description": opp.description,
                    "summary": opp.summary,
                    "required_skills": opp.required_skills or [],
                    "eligibility": opp.eligibility,
                    "deadline": opp.deadline,
                    "mode": opp.mode,
                    "cost": opp.cost,
                    "is_free": opp.is_free,
                    "stipend_or_prize": opp.stipend_or_prize,
                    "official_url": opp.official_url
                },
                "match": {
                    "overall_match": m.overall_match,
                    "skill_match": m.skill_match,
                    "eligibility_match": m.eligibility_match,
                    "interest_match": m.interest_match,
                    "deadline_urgency": m.deadline_urgency,
                    "explanation": m.explanation
                }
            })

    # If no matches yet, pull active catalog
    if not matched_opportunities:
        all_opps = db.query(Opportunity).filter(Opportunity.status == "active").limit(10).all()
        for opp in all_opps:
            matched_opportunities.append({
                "opportunity": {
                    "id": opp.id,
                    "title": opp.title,
                    "organization": opp.organization,
                    "category": opp.category,
                    "description": opp.description,
                    "summary": opp.summary,
                    "required_skills": opp.required_skills or [],
                    "eligibility": opp.eligibility,
                    "deadline": opp.deadline,
                    "mode": opp.mode,
                    "cost": opp.cost,
                    "is_free": opp.is_free,
                    "stipend_or_prize": opp.stipend_or_prize,
                    "official_url": opp.official_url
                },
                "match": {
                    "overall_match": 80.0,
                    "skill_match": 80.0,
                    "explanation": "Matched against college profile"
                }
            })

    history_payload = [
        {"role": msg.role, "content": msg.content} for msg in (payload.history or [])
    ]

    response = orchestrator.assistant.answer_query(
        query=payload.message,
        student_profile=prof_dict,
        matched_opportunities=matched_opportunities,
        chat_history=history_payload
    )

    return response
