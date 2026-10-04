import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.auth import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.opportunity import Opportunity
from app.models.profile import StudentProfile
from app.agents.opportunity_agent import opportunity_agent
from app.agents.matching_agent import matching_agent

logger = logging.getLogger("api.agent")

router = APIRouter(prefix="/agent", tags=["Opportunity Agent"])

class AgentChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User prompt or conversational refinement")
    session_id: Optional[str] = Field(None, description="Optional conversational session ID for state preservation across turns")

class AgentCompareRequest(BaseModel):
    opportunity_ids: List[int] = Field(..., min_items=2, max_items=4)

class AgentExplainRequest(BaseModel):
    opportunity_id: int

@router.post("/chat")
def chat_with_opportunity_agent(
    payload: AgentChatRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Multi-turn Conversational Opportunity Agent endpoint.
    Maintains memory across conversation turns, accumulates filter constraints,
    queries and scores opportunities via 6-Factor matching engine,
    and returns grounded recommendations with dynamic action chips.
    """
    user_id = current_user.id if current_user else 1
    try:
        response = opportunity_agent.process_turn(
            db=db,
            user_id=user_id,
            user_message=payload.message,
            session_id=payload.session_id
        )
        return response
    except Exception as e:
        logger.error(f"Error in opportunity agent chat: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent processing failed: {str(e)}"
        )

@router.post("/compare")
def compare_opportunities(
    payload: AgentCompareRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns a detailed side-by-side comparison of 2 to 4 opportunities for the student.
    """
    user_id = current_user.id if current_user else 1
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
    student_dict = opportunity_agent._profile_to_dict(profile)

    opps = db.query(Opportunity).filter(Opportunity.id.in_(payload.opportunity_ids)).all()
    if not opps:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No opportunities found for the given IDs.")

    comparison = opportunity_agent._generate_comparison(opps, student_dict)
    return comparison

@router.post("/explain")
def explain_opportunity_match(
    payload: AgentExplainRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns a transparent 6-factor match breakdown and personalized application strategy.
    """
    user_id = current_user.id if current_user else 1
    opp = db.query(Opportunity).filter(Opportunity.id == payload.opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found.")

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
    student_dict = opportunity_agent._profile_to_dict(profile)

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
    match_result = matching_agent.calculate_match(student_dict, opp_dict)

    explanation = opportunity_agent._generate_explanation(
        opp=opp,
        match_data={
            "overall_match": match_result.overall_match,
            "skill_match": match_result.skill_match,
            "education_match": match_result.education_match,
            "experience_match": match_result.experience_match,
            "location_match": match_result.location_match,
            "interest_match": match_result.interest_match,
            "eligibility_match": match_result.eligibility_match,
            "eligibility_status": match_result.eligibility_status,
            "explanation": match_result.explanation
        },
        student_dict=student_dict
    )
    return explanation

@router.post("/reset-session")
def reset_agent_session(session_id: str):
    """Resets memory and active filter constraints for a session."""
    opportunity_agent.reset_session(session_id)
    return {"status": "success", "session_id": session_id, "message": "Session memory reset."}
