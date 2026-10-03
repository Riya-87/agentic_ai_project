from typing import List, Dict, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.api.v1.auth import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.profile import StudentProfile
from app.models.opportunity import Opportunity
from app.models.match import UserMatch
from app.models.saved_opportunity import SavedOpportunity
from app.schemas.analytics import (
    DashboardAnalyticsOut,
    CategoryDistribution,
    MatchDistribution,
    ApplicationFunnel,
    AIInsightItem,
    DeadlineTimelineItem
)

router = APIRouter(prefix="/analytics", tags=["Dashboard Analytics"])

@router.get("/dashboard", response_model=DashboardAnalyticsOut)
def get_dashboard_analytics(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id if current_user else 1
    total_opps = db.query(Opportunity).filter(Opportunity.status == "active").count()
    
    # Matches
    user_matches = db.query(UserMatch).filter(UserMatch.user_id == user_id).all()
    match_map = {m.opportunity_id: m for m in user_matches}
    high_match_count = sum(1 for m in user_matches if m.overall_match >= 80.0)
    recommended_count = max(high_match_count, sum(1 for m in user_matches if m.overall_match >= 75.0))

    # Deadlines & Closing Soon
    now = datetime.utcnow()
    seven_days = now + timedelta(days=7)
    
    all_active_opps = db.query(Opportunity).filter(Opportunity.status == "active").all()
    
    closing_soon_count = 0
    upcoming_deadlines_count = 0
    timeline_items: List[DeadlineTimelineItem] = []

    # Sort opportunities with deadlines
    deadline_opps = [o for o in all_active_opps if o.deadline and o.deadline >= now - timedelta(days=1)]
    deadline_opps.sort(key=lambda x: x.deadline)

    for opp in deadline_opps:
        upcoming_deadlines_count += 1
        days_left = (opp.deadline.replace(tzinfo=None) - now).days
        
        if 0 <= days_left <= 7:
            closing_soon_count += 1

        match_val = match_map[opp.id].overall_match if opp.id in match_map else 80.0

        # Determine tag and urgency
        if days_left <= 0:
            timeline_tag = "TODAY"
            urgency_level = "critical"
            color = "rose"
        elif days_left == 1:
            timeline_tag = "TOMORROW"
            urgency_level = "critical"
            color = "rose"
        elif days_left <= 3:
            timeline_tag = f"IN {days_left} DAYS"
            urgency_level = "critical"
            color = "rose"
        elif days_left <= 5:
            timeline_tag = opp.deadline.strftime("%b %d").upper()
            urgency_level = "urgent"
            color = "amber"
        elif days_left <= 14:
            timeline_tag = opp.deadline.strftime("%b %d").upper()
            urgency_level = "upcoming"
            color = "yellow"
        else:
            timeline_tag = opp.deadline.strftime("%b %d").upper()
            urgency_level = "later"
            color = "emerald"

        if len(timeline_items) < 6:
            timeline_items.append(DeadlineTimelineItem(
                id=opp.id,
                title=opp.title,
                organization=opp.organization,
                category=opp.category,
                timeline_tag=timeline_tag,
                exact_date=opp.deadline,
                days_left=max(0, days_left),
                urgency_level=urgency_level,
                color=color,
                match_score=match_val
            ))

    # Saved & Applied
    saved_items = db.query(SavedOpportunity).filter(SavedOpportunity.user_id == user_id).all()
    saved_count = sum(1 for s in saved_items if s.status == "saved" or s.status == "in_progress")
    applied_count = sum(1 for s in saved_items if s.status == "applied")

    # Profile strength
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
    strength = profile.profile_strength if profile else 50
    user_skills = profile.skills if profile and profile.skills else ["Python", "Machine Learning"]

    # Category distribution
    cat_counts = db.query(
        Opportunity.category, func.count(Opportunity.id)
    ).filter(Opportunity.status == "active").group_by(Opportunity.category).all()

    category_distribution = []
    for cat, cnt in cat_counts:
        pct = (cnt / total_opps * 100.0) if total_opps > 0 else 0.0
        category_distribution.append(CategoryDistribution(
            category=cat,
            count=cnt,
            percentage=round(pct, 1)
        ))

    # Match distribution
    m_90 = sum(1 for m in user_matches if m.overall_match >= 90.0)
    m_75 = sum(1 for m in user_matches if 75.0 <= m.overall_match < 90.0)
    m_50 = sum(1 for m in user_matches if 50.0 <= m.overall_match < 75.0)
    m_low = sum(1 for m in user_matches if m.overall_match < 50.0)

    match_distribution = [
        MatchDistribution(tier="90%+ Match", count=m_90),
        MatchDistribution(tier="75-89% Match", count=m_75),
        MatchDistribution(tier="50-74% Match", count=m_50),
        MatchDistribution(tier="<50% Match", count=m_low),
    ]

    application_funnel = ApplicationFunnel(
        discovered=total_opps,
        matched_high=high_match_count,
        saved=saved_count,
        applied=applied_count
    )

    # Dynamic AI Insights Generation
    ai_insights: List[AIInsightItem] = []
    
    # Insight 1: Closing soon high match
    high_match_closing = [
        opp for opp in deadline_opps
        if (opp.deadline.replace(tzinfo=None) - now).days <= 7
        and opp.id in match_map and match_map[opp.id].overall_match >= 80.0
    ]
    if high_match_closing:
        ai_insights.append(AIInsightItem(
            id="insight-closing-urgent",
            type="deadline_alert",
            icon="clock",
            text=f"You have {len(high_match_closing)} high-match opportunity closing within 7 days ({high_match_closing[0].title}).",
            action_label="View Deadlines",
            action_target="deadlines"
        ))
    else:
        ai_insights.append(AIInsightItem(
            id="insight-closing-general",
            type="deadline_alert",
            icon="clock",
            text=f"{closing_soon_count} academic opportunities have deadlines closing this week.",
            action_label="Review Schedule",
            action_target="deadlines"
        ))

    # Insight 2: Strongest matching skill
    top_skill = user_skills[0] if user_skills else "Python"
    ai_insights.append(AIInsightItem(
        id="insight-skill-strength",
        type="skill_strength",
        icon="sparkles",
        text=f"Your strongest matching skill is '{top_skill}', unlocking over {min(total_opps, 8)} top-tier programs.",
        action_label="Explore Hub",
        action_target="opportunities"
    ))

    # Insight 3: Missing skill suggestion
    missing_skill_pool = ["Docker", "Kubernetes", "TypeScript", "AWS", "PyTorch", "GraphQL"]
    user_skills_lower = [s.lower() for s in user_skills]
    suggested = next((s for s in missing_skill_pool if s.lower() not in user_skills_lower), "Docker")
    ai_insights.append(AIInsightItem(
        id="insight-skill-boost",
        type="skill_opportunity",
        icon="zap",
        text=f"Adding '{suggested}' to your profile may improve matches for several research & industry fellowships.",
        action_label="Update Skills",
        action_target="profile"
    ))

    return DashboardAnalyticsOut(
        total_opportunities=total_opps,
        recommended_count=recommended_count,
        high_match_count=high_match_count,
        closing_soon_count=closing_soon_count,
        upcoming_deadlines_count=upcoming_deadlines_count,
        saved_count=saved_count,
        applied_count=applied_count,
        profile_strength=strength,
        ai_insights=ai_insights,
        deadline_timeline=timeline_items,
        category_distribution=category_distribution,
        match_distribution=match_distribution,
        application_funnel=application_funnel
    )

