import logging
import uuid
import re
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.agents.base import BaseAgent
from app.models.opportunity import Opportunity
from app.models.match import UserMatch
from app.models.profile import StudentProfile
from app.agents.matching_agent import matching_agent
from app.agents.orchestrator import orchestrator

logger = logging.getLogger("agents.opportunity_agent")

class OpportunityAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="OpportunityDiscoveryAgent",
            role="Autonomous Academic & Career Discovery Agent with Multi-turn Memory and 6-Factor Matching"
        )
        # In-memory session store: session_id -> { "history": [...], "filters": {...}, "last_opp_ids": [...] }
        self.sessions: Dict[str, Dict[str, Any]] = {}

    def get_or_create_session(self, session_id: Optional[str]) -> Tuple[str, Dict[str, Any]]:
        if not session_id or session_id not in self.sessions:
            new_id = session_id or str(uuid.uuid4())
            self.sessions[new_id] = {
                "history": [],
                "filters": {
                    "keywords": [],
                    "category": None,
                    "mode": None,
                    "eligibility_year": None,
                    "organization": None,
                    "domain": None,
                    "has_stipend": None
                },
                "focused_opp_ids": [],
                "created_at": datetime.utcnow().isoformat()
            }
            return new_id, self.sessions[new_id]
        return session_id, self.sessions[session_id]

    def reset_session(self, session_id: str) -> None:
        if session_id in self.sessions:
            self.sessions[session_id]["history"] = []
            self.sessions[session_id]["filters"] = {
                "keywords": [],
                "category": None,
                "mode": None,
                "eligibility_year": None,
                "organization": None,
                "domain": None,
                "has_stipend": None
            }
            self.sessions[session_id]["focused_opp_ids"] = []

    def process_turn(
        self,
        db: Session,
        user_id: int,
        user_message: str,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Processes a multi-turn conversation turn:
        1. Classifies intent & updates accumulated session filters across turns.
        2. Retrieves & ranks opportunities based on 6-Factor matching engine.
        3. Formulates a grounded, empathetic, and strategic response with suggested next prompts.
        """
        sid, session_data = self.get_or_create_session(session_id)
        history = session_data["history"]
        active_filters = session_data["filters"]

        # Fetch student profile
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
        student_dict = self._profile_to_dict(profile)

        # 1. Multi-turn Intent & Filter Extraction
        intent_info = self._analyze_intent_and_refine_filters(user_message, history, active_filters, student_dict)
        
        # Merge refined filters into session
        new_filters = intent_info.get("extracted_filters", {})
        for k, v in new_filters.items():
            if v is not None:
                active_filters[k] = v

        intent = intent_info.get("intent", "SEARCH_OR_DISCOVER")

        # 2. Execute Data Action based on Intent
        opportunities, matches_map = self._retrieve_matching_opportunities(db, user_id, active_filters, student_dict)

        # If user explicitly asked for more or no results found, perform live collector discovery
        if (len(opportunities) == 0 or intent == "LIVE_WEB_SEARCH") and active_filters.get("keywords"):
            search_query = " ".join(active_filters["keywords"])
            try:
                logger.info(f"Triggering live web/ATS discovery for query: {search_query}")
                orchestrator.run_full_pipeline(db, target_user_id=user_id, custom_query=search_query)
                # Re-query
                opportunities, matches_map = self._retrieve_matching_opportunities(db, user_id, active_filters, student_dict)
            except Exception as e:
                logger.warning(f"Live collector run error: {e}")

        # Update focused IDs in session
        session_data["focused_opp_ids"] = [o.id for o in opportunities[:10]]

        # 3. Handle Special Intents (EVALUATE_BEST, EXPLAIN_FIT, COMPARE)
        specific_comparison = None
        specific_explanation = None

        if intent == "COMPARE":
            specific_comparison = self._generate_comparison(opportunities[:3], student_dict)
        elif intent == "EXPLAIN_FIT" and opportunities:
            target_opp = opportunities[0]
            specific_explanation = self._generate_explanation(target_opp, matches_map.get(target_opp.id, {}), student_dict)

        # 4. Generate Natural Language Agent Reply
        reply_text = self._synthesize_reply(
            user_message=user_message,
            intent=intent,
            active_filters=active_filters,
            opportunities=opportunities[:8],
            matches_map=matches_map,
            student_dict=student_dict,
            history=history,
            comparison=specific_comparison,
            explanation=specific_explanation
        )

        # 5. Build dynamic suggested action chips
        suggested_actions = self._generate_suggested_actions(intent, active_filters, opportunities)

        # Record in history
        history.append({"role": "user", "content": user_message})
        history.append({"role": "assistant", "content": reply_text})
        # Keep last 10 turns
        if len(history) > 20:
            session_data["history"] = history[-20:]

        # Serialize opportunities with match metadata
        serialized_opps = []
        for opp in opportunities[:12]:
            m = matches_map.get(opp.id, {})
            serialized_opps.append({
                "id": opp.id,
                "title": opp.title,
                "organization": opp.organization,
                "category": opp.category,
                "domain": opp.domain,
                "description": opp.description,
                "summary": opp.summary,
                "required_skills": opp.required_skills or [],
                "eligibility": opp.eligibility,
                "deadline": opp.deadline.isoformat() if opp.deadline else None,
                "mode": opp.mode,
                "location": opp.location,
                "cost": opp.cost,
                "is_free": opp.is_free,
                "stipend_or_prize": opp.stipend_or_prize,
                "official_url": opp.official_url,
                "source": opp.sources[0] if (getattr(opp, "sources", None) and len(opp.sources) > 0) else "Verified Academic Source",
                "match_score": m.get("overall_match", 75.0),
                "eligibility_status": m.get("eligibility_status", "likely eligible"),
                "skill_match": m.get("skill_match", 80.0),
                "education_match": m.get("education_match", 70.0),
                "match_reason": m.get("explanation", "Matches your profile skills and domain interests.")
            })

        return {
            "session_id": sid,
            "reply": reply_text,
            "intent": intent,
            "active_filters": active_filters,
            "opportunities": serialized_opps,
            "suggested_actions": suggested_actions,
            "comparison": specific_comparison,
            "explanation": specific_explanation
        }

    def _analyze_intent_and_refine_filters(
        self,
        message: str,
        history: List[Dict[str, str]],
        current_filters: Dict[str, Any],
        student_dict: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Uses Groq / LLM to parse user intent and incremental filter refinements.
        """
        msg_lower = message.lower().strip()

        # Fast heuristic shortcuts for common refinements
        heuristic_intent = None
        extracted = {}

        if any(w in msg_lower for w in ["best for me", "which one is best", "top recommendation", "recommend one"]):
            heuristic_intent = "EVALUATE_BEST"
        elif any(w in msg_lower for w in ["why is this a good match", "explain fit", "why should i apply", "explain why"]):
            heuristic_intent = "EXPLAIN_FIT"
        elif any(w in msg_lower for w in ["compare", "difference between", "versus", " vs "]):
            heuristic_intent = "COMPARE"
        elif "remote" in msg_lower or "online" in msg_lower:
            heuristic_intent = "REFINE_FILTER"
            extracted["mode"] = "Online"
        elif "in-person" in msg_lower or "offline" in msg_lower or "on-site" in msg_lower:
            heuristic_intent = "REFINE_FILTER"
            extracted["mode"] = "Offline"
        
        # Check year refinement
        for yr in ["1st year", "2nd year", "3rd year", "4th year", "freshman", "sophomore", "junior", "senior"]:
            if yr in msg_lower:
                heuristic_intent = "REFINE_FILTER"
                extracted["eligibility_year"] = yr
                break

        # Check category refinement
        for cat in ["internship", "job", "hackathon", "competition", "fellowship", "research", "scholarship"]:
            if cat in msg_lower:
                extracted["category"] = cat.capitalize() if cat != "fellowship" else "Research Fellowship"
                if not heuristic_intent:
                    heuristic_intent = "SEARCH_OR_DISCOVER"

        # If it's a new search term like "Machine Learning" or "Cybersecurity"
        if len(msg_lower.split()) <= 4 and not heuristic_intent:
            extracted["keywords"] = [w for w in msg_lower.split() if len(w) > 2]
            heuristic_intent = "SEARCH_OR_DISCOVER"

        # Invoke LLM for deeper multi-turn contextual understanding
        prompt = f"""You are the conversational intent parser for an Academic & Career Opportunity Discovery Agent.
Given the user's latest query, the recent conversational history, and current accumulated filters, classify the user's intent and extract any updated filter constraints.

CONVERSATION HISTORY:
{history[-6:]}

CURRENT ACTIVE FILTERS:
{current_filters}

USER QUERY:
"{message}"

Classify into one of these INTENTS:
- "SEARCH_OR_DISCOVER": User is searching for a new domain or topic (e.g. "Machine Learning", "Find AI hackathons").
- "REFINE_FILTER": User is narrowing down active results (e.g. "Only remote", "Only for 3rd year", "Show only internships").
- "EVALUATE_BEST": User is asking which opportunity is best suited for their profile.
- "EXPLAIN_FIT": User wants a breakdown of why a particular opportunity matches them.
- "COMPARE": User wants to compare 2 or 3 opportunities.
- "LIVE_WEB_SEARCH": User explicitly asks to crawl/scrape the live web or search external career pages.
- "GENERAL_QA": Questions about resumes, preparation, or general advice.

Return ONLY a JSON object:
{{
  "intent": "INTENT_NAME",
  "extracted_filters": {{
    "keywords": ["list", "of", "domain", "keywords"] or null,
    "category": "Internship" | "Hackathon" | "Research Fellowship" | "Scholarship" | "Competition" | null,
    "mode": "Online" | "Offline" | "Hybrid" | null,
    "eligibility_year": "1st Year" | "2nd Year" | "3rd Year" | "4th Year" | null,
    "organization": "e.g. Google, Microsoft, Meta" | null,
    "has_stipend": true | false | null
  }}
}}
"""
        fallback_res = {
            "intent": heuristic_intent or "SEARCH_OR_DISCOVER",
            "extracted_filters": extracted
        }

        try:
            res = self.call_llm_json(prompt, fallback_dict=fallback_res)
            if not res or "intent" not in res:
                return fallback_res
            # Merge heuristic extractions if LLM missed them
            if extracted:
                for k, v in extracted.items():
                    if not res.get("extracted_filters", {}).get(k):
                        res.setdefault("extracted_filters", {})[k] = v
            return res
        except Exception:
            return fallback_res

    def _retrieve_matching_opportunities(
        self,
        db: Session,
        user_id: int,
        filters: Dict[str, Any],
        student_dict: Dict[str, Any]
    ) -> Tuple[List[Opportunity], Dict[int, Dict[str, Any]]]:
        """
        Queries opportunities applying active filters, evaluates 6-Factor match scores,
        and returns them ranked by total alignment.
        """
        query = db.query(Opportunity)

        # 1. Apply category filter
        if filters.get("category"):
            cat_val = filters["category"].lower()
            query = query.filter(Opportunity.category.ilike(f"%{cat_val}%"))

        # 2. Apply mode filter
        if filters.get("mode"):
            mode_val = filters["mode"].lower()
            if "online" in mode_val or "remote" in mode_val:
                query = query.filter(or_(Opportunity.mode.ilike("%online%"), Opportunity.mode.ilike("%remote%")))
            elif "offline" in mode_val or "in-person" in mode_val:
                query = query.filter(or_(Opportunity.mode.ilike("%offline%"), Opportunity.mode.ilike("%in-person%")))

        # 3. Apply keyword search
        keywords = filters.get("keywords") or []
        if keywords:
            keyword_clauses = []
            for kw in keywords:
                term = f"%{kw}%"
                keyword_clauses.append(Opportunity.title.ilike(term))
                keyword_clauses.append(Opportunity.description.ilike(term))
                keyword_clauses.append(Opportunity.summary.ilike(term))
                keyword_clauses.append(Opportunity.organization.ilike(term))
                keyword_clauses.append(Opportunity.domain.ilike(term))
            query = query.filter(or_(*keyword_clauses))

        # 4. Apply organization filter
        if filters.get("organization"):
            org = f"%{filters['organization']}%"
            query = query.filter(Opportunity.organization.ilike(org))

        opportunities = query.all()

        # If strictly filtered query returned 0 results, fall back to broad keyword search
        if not opportunities and keywords:
            broad_query = db.query(Opportunity)
            term = f"%{keywords[0]}%"
            broad_query = broad_query.filter(or_(Opportunity.title.ilike(term), Opportunity.domain.ilike(term)))
            opportunities = broad_query.all()

        # If still empty, return top recent active opportunities
        if not opportunities:
            opportunities = db.query(Opportunity).order_by(Opportunity.created_at.desc()).limit(15).all()

        # 5. Fetch or compute 6-Factor Matches
        matches_map = {}
        for opp in opportunities:
            # Check if match is already cached in UserMatch
            um = db.query(UserMatch).filter(UserMatch.user_id == user_id, UserMatch.opportunity_id == opp.id).first()
            if um and um.overall_match is not None:
                matches_map[opp.id] = {
                    "overall_match": um.overall_match,
                    "skill_match": um.skill_match or 70.0,
                    "education_match": um.education_match or 70.0,
                    "experience_match": um.experience_match or 65.0,
                    "location_match": um.location_match or 80.0,
                    "interest_match": um.interest_match or 75.0,
                    "eligibility_match": um.eligibility_match or 80.0,
                    "eligibility_status": um.eligibility_status or "likely eligible",
                    "explanation": um.explanation or "Good overall match."
                }
            else:
                # Compute on the fly via 6-Factor engine
                opp_dict = {
                    "title": opp.title,
                    "organization": opp.organization,
                    "category": opp.category,
                    "required_skills": opp.required_skills or [],
                    "eligibility": opp.eligibility or "",
                    "experience_requirements": opp.experience_requirements or "",
                    "location": opp.location or "",
                    "mode": opp.mode or "",
                    "domain": opp.domain or ""
                }
                calc = matching_agent.calculate_match(student_dict, opp_dict)
                matches_map[opp.id] = {
                    "overall_match": calc.overall_match,
                    "skill_match": calc.skill_match,
                    "education_match": calc.education_match,
                    "experience_match": calc.experience_match,
                    "location_match": calc.location_match,
                    "interest_match": calc.interest_match,
                    "eligibility_match": calc.eligibility_match,
                    "eligibility_status": calc.eligibility_status,
                    "explanation": calc.explanation
                }

        # 6. Apply Year Eligibility filter post-computation if requested
        if filters.get("eligibility_year"):
            yr_str = str(filters["eligibility_year"]).lower()
            filtered_by_year = []
            for opp in opportunities:
                elig_text = (opp.eligibility or "").lower()
                # If explicit mention or open to all / general
                if yr_str in elig_text or "all years" in elig_text or "undergraduate" in elig_text or not elig_text:
                    filtered_by_year.append(opp)
            if filtered_by_year:
                opportunities = filtered_by_year

        # Sort opportunities by 6-Factor overall match score descending
        opportunities.sort(key=lambda o: matches_map.get(o.id, {}).get("overall_match", 0), reverse=True)

        return opportunities, matches_map

    def _synthesize_reply(
        self,
        user_message: str,
        intent: str,
        active_filters: Dict[str, Any],
        opportunities: List[Opportunity],
        matches_map: Dict[int, Dict[str, Any]],
        student_dict: Dict[str, Any],
        history: List[Dict[str, str]],
        comparison: Optional[Dict[str, Any]] = None,
        explanation: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Uses Groq / LLM to produce a concise, insightful response.
        """
        active_constraints = [f"{k}: {v}" for k, v in active_filters.items() if v]
        constraints_str = ", ".join(active_constraints) if active_constraints else "General Search"

        top_opps_summary = []
        for i, opp in enumerate(opportunities[:5], 1):
            m = matches_map.get(opp.id, {})
            score = int(m.get("overall_match", 0))
            status = m.get("eligibility_status", "likely eligible")
            skills_str = ", ".join(opp.required_skills[:3]) if opp.required_skills else "General"
            top_opps_summary.append(
                f"{i}. **{opp.title}** at *{opp.organization}* ({opp.category} | {opp.mode})\n"
                f"   - Match: **{score}%** [{status.upper()}] | Skills: {skills_str} | Deadline: {str(opp.deadline)[:10] if opp.deadline else 'Open'}"
            )

        opps_text = "\n".join(top_opps_summary) if top_opps_summary else "No matching opportunities found."

        prompt = f"""You are the Academic & Career Opportunity Discovery Agent for college students.
Respond directly, warmly, and strategically to the student's message.

STUDENT PROFILE:
- Degree & Year: {student_dict.get('academic_year')}, {student_dict.get('degree')} in {student_dict.get('branch')}
- Core Skills: {', '.join(student_dict.get('skills', [])[:6])}
- Goals: {student_dict.get('career_goals')}

ACTIVE SEARCH CONSTRAINTS: {constraints_str}
USER INTENT: {intent}
USER MESSAGE: "{user_message}"

TOP RETRIEVED OPPORTUNITIES:
{opps_text}

ADDITIONAL CONTEXT:
{f'COMPARISON: {comparison}' if comparison else ''}
{f'DEEP EXPLANATION: {explanation}' if explanation else ''}

INSTRUCTIONS:
1. Speak in a knowledgeable, encouraging tone. Address what the user specifically asked for.
2. If the user refined a filter (e.g. 'only remote' or 'only 3rd year'), acknowledge the updated filter and highlight how the current shortlist satisfies it.
3. If the user asked 'Which is best for me?', explicitly name the #1 recommended opportunity, highlight why its 6-factor score is highest, and give 2 concrete tips for applying.
4. Keep the response crisp, well-structured with markdown bolding and bullet points, within 2-4 short paragraphs.
5. End with a helpful, natural follow-up prompt.
"""
        fallback_reply = (
            f"Here are the top opportunities matching your request based on our 6-Factor AI matching engine:\n\n"
            f"{opps_text}\n\n"
            f"Would you like me to filter these by remote mode, evaluate which is the best fit for your academic year, or explain the score breakdown?"
        )

        return self.call_llm_text(prompt, fallback_text=fallback_reply)

    def _generate_comparison(self, opps: List[Opportunity], student_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Generates a structured side-by-side comparison of 2-3 opportunities."""
        if not opps:
            return {}
        items = []
        for o in opps[:3]:
            items.append({
                "id": o.id,
                "title": o.title,
                "organization": o.organization,
                "category": o.category,
                "mode": o.mode,
                "stipend": o.stipend_or_prize or "Unspecified",
                "deadline": str(o.deadline)[:10] if o.deadline else "Rolling",
                "skills": o.required_skills or []
            })
        return {
            "title": "Opportunity Comparison",
            "items": items,
            "verdict": f"If you want high prestige and research depth, {opps[0].organization} is ideal. If you want practical product experience, consider {opps[1].organization if len(opps) > 1 else opps[0].organization}."
        }

    def _generate_explanation(self, opp: Opportunity, match_data: Dict[str, Any], student_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Generates a detailed 6-factor breakdown for an opportunity."""
        return {
            "opportunity_id": opp.id,
            "title": opp.title,
            "organization": opp.organization,
            "overall_match": match_data.get("overall_match", 80),
            "eligibility_status": match_data.get("eligibility_status", "likely eligible"),
            "factors": [
                {"name": "Skill Match (35%)", "score": match_data.get("skill_match", 75), "status": "Strong overlap with your profile"},
                {"name": "Education Match (20%)", "score": match_data.get("education_match", 80), "status": f"Aligns with {student_dict.get('academic_year')}"},
                {"name": "Experience (15%)", "score": match_data.get("experience_match", 70), "status": "Good entry alignment"},
                {"name": "Location & Mode (10%)", "score": match_data.get("location_match", 90), "status": f"{opp.mode} works with your preference"},
                {"name": "Domain Interest (10%)", "score": match_data.get("interest_match", 85), "status": f"Matches {opp.domain or opp.category}"},
                {"name": "Eligibility (10%)", "score": match_data.get("eligibility_match", 80), "status": match_data.get("eligibility_status", "eligible")}
            ],
            "recommendation": match_data.get("explanation", "High alignment with your background.")
        }

    def _generate_suggested_actions(
        self,
        intent: str,
        filters: Dict[str, Any],
        opportunities: List[Opportunity]
    ) -> List[str]:
        """Provides dynamic clickable prompt chips tailored to current context."""
        actions = []
        if not filters.get("mode") or filters.get("mode") == "Any":
            actions.append("Only remote")
        
        if intent != "EVALUATE_BEST":
            actions.append("Which one is best for me?")
        
        if opportunities and intent != "EXPLAIN_FIT":
            actions.append("Why is this a good match?")

        if not filters.get("category"):
            actions.append("Show only Hackathons")
        elif filters.get("category") != "Internship":
            actions.append("Show only Internships")

        if len(actions) < 4:
            actions.append("Compare top 2 matches")

        return actions[:4]

    def _profile_to_dict(self, profile: Optional[StudentProfile]) -> Dict[str, Any]:
        if not profile:
            return {
                "degree": "B.Tech",
                "branch": "Computer Science & Engineering",
                "academic_year": "3rd Year",
                "college": "National Institute of Technology",
                "graduation_year": 2026,
                "skills": ["Python", "FastAPI", "React", "Machine Learning"],
                "interests": ["Generative AI", "Open Source", "Distributed Systems"],
                "preferred_categories": ["Internship", "Hackathon", "Fellowship"],
                "preferred_location": "Global / Remote",
                "mode_preference": "Any",
                "projects": [],
                "experience": [],
                "certifications": [],
                "career_goals": "AI Engineer & Full-Stack Developer"
            }
        return {
            "degree": profile.degree or "B.Tech",
            "branch": profile.branch or "Computer Science",
            "academic_year": profile.academic_year or "3rd Year",
            "college": profile.college or "University",
            "graduation_year": profile.graduation_year or 2026,
            "skills": profile.skills or [],
            "interests": profile.interests or [],
            "preferred_categories": profile.preferred_categories or [],
            "preferred_location": profile.preferred_location or "Remote",
            "mode_preference": profile.mode_preference or "Any",
            "projects": profile.projects or [],
            "experience": profile.experience or [],
            "certifications": profile.certifications or [],
            "career_goals": getattr(profile, "career_goals", "Software Engineer")
        }

opportunity_agent = OpportunityAgent()
