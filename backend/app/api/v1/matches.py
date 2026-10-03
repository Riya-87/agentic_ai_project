from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.auth import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.opportunity import Opportunity
from app.models.match import UserMatch
from app.models.saved_opportunity import SavedOpportunity
from app.schemas.match import MatchedOpportunityOut, MatchingBreakdown, ReMatchResponse
from app.schemas.opportunity import OpportunityOut
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/matches", tags=["Matching & Recommendations"])

@router.get("/top", response_model=List[MatchedOpportunityOut])
def get_top_matches(
    limit: int = Query(6, ge=1, le=50),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id if current_user else 1
    user_matches = db.query(UserMatch).filter(
        UserMatch.user_id == user_id
    ).order_by(UserMatch.rank_score.desc()).limit(limit).all()

    # If no matches recorded yet, trigger on-the-fly fast match
    if not user_matches:
        orchestrator.match_single_student(db, user_id)
        user_matches = db.query(UserMatch).filter(
            UserMatch.user_id == user_id
        ).order_by(UserMatch.rank_score.desc()).limit(limit).all()

    saved_map = {
        s.opportunity_id: s for s in db.query(SavedOpportunity).filter(SavedOpportunity.user_id == user_id).all()
    }

    results = []
    for m in user_matches:
        opp = db.query(Opportunity).filter(Opportunity.id == m.opportunity_id).first()
        if not opp:
            continue
        saved_obj = saved_map.get(opp.id)
        results.append(MatchedOpportunityOut(
            opportunity=OpportunityOut.model_validate(opp),
            match=MatchingBreakdown(
                overall_match=m.overall_match,
                skill_match=m.skill_match,
                eligibility_match=m.eligibility_match,
                interest_match=m.interest_match,
                deadline_urgency=m.deadline_urgency,
                matched_skills=m.matched_skills or [],
                missing_skills=m.missing_skills or [],
                explanation=m.explanation or "",
                missing_requirements=m.missing_requirements or ""
            ),
            rank_score=m.rank_score,
            is_saved=saved_obj is not None,
            saved_status=saved_obj.status if saved_obj else None
        ))

    return results

@router.post("/refresh", response_model=ReMatchResponse)
def refresh_student_matches(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total = orchestrator.match_single_student(db, current_user.id)
    top_matches_count = db.query(UserMatch).filter(
        UserMatch.user_id == current_user.id,
        UserMatch.overall_match >= 80.0
    ).count()

    return ReMatchResponse(
        status="success",
        total_matched=total,
        top_matches_count=top_matches_count,
        message="Matching agent successfully recalibrated recommendations against your latest profile."
    )
