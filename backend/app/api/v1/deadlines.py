from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.auth import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.opportunity import Opportunity
from app.models.deadline import DeadlineTracker
from app.models.saved_opportunity import SavedOpportunity
from app.schemas.deadline import DeadlineCalendarEvent, UrgencyMetrics

router = APIRouter(prefix="/deadlines", tags=["Deadline Center"])

@router.get("", response_model=List[DeadlineCalendarEvent])
def get_deadlines_calendar(
    saved_only: bool = False,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Opportunity).filter(
        Opportunity.status == "active",
        Opportunity.deadline != None
    )

    user_id = current_user.id if current_user else 1
    saved_map = {
        s.opportunity_id: s for s in db.query(SavedOpportunity).filter(SavedOpportunity.user_id == user_id).all()
    }

    if saved_only:
        saved_opp_ids = list(saved_map.keys())
        query = query.filter(Opportunity.id.in_(saved_opp_ids))

    opportunities = query.order_by(Opportunity.deadline.asc()).all()
    now = datetime.utcnow()

    events = []
    for opp in opportunities:
        if not opp.deadline:
            continue
        
        due = opp.deadline.replace(tzinfo=None)
        days_left = (due - now).days
        
        urgency = "critical" if days_left <= 3 else "approaching" if days_left <= 7 else "upcoming" if days_left <= 14 else "normal"
        saved_obj = saved_map.get(opp.id)

        events.append(DeadlineCalendarEvent(
            id=opp.id,
            opportunity_id=opp.id,
            title=opp.title,
            organization=opp.organization,
            category=opp.category,
            due_date=opp.deadline,
            days_left=days_left,
            urgency_level=urgency,
            is_saved=saved_obj is not None,
            saved_status=saved_obj.status if saved_obj else None,
            official_url=opp.official_url
        ))

    return events

@router.get("/metrics", response_model=UrgencyMetrics)
def get_urgency_metrics(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    now = datetime.utcnow()
    critical_threshold = now + timedelta(days=3)
    approaching_threshold = now + timedelta(days=7)
    upcoming_threshold = now + timedelta(days=14)

    critical = db.query(Opportunity).filter(
        Opportunity.status == "active",
        Opportunity.deadline != None,
        Opportunity.deadline >= now,
        Opportunity.deadline <= critical_threshold
    ).count()

    approaching = db.query(Opportunity).filter(
        Opportunity.status == "active",
        Opportunity.deadline != None,
        Opportunity.deadline > critical_threshold,
        Opportunity.deadline <= approaching_threshold
    ).count()

    upcoming = db.query(Opportunity).filter(
        Opportunity.status == "active",
        Opportunity.deadline != None,
        Opportunity.deadline > approaching_threshold,
        Opportunity.deadline <= upcoming_threshold
    ).count()

    total = db.query(Opportunity).filter(
        Opportunity.status == "active",
        Opportunity.deadline != None,
        Opportunity.deadline >= now
    ).count()

    return UrgencyMetrics(
        critical_count=critical,
        approaching_count=approaching,
        upcoming_count=upcoming,
        total_active_deadlines=total
    )
