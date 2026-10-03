from typing import List, Dict, Optional
from datetime import datetime
from pydantic import BaseModel

class CategoryDistribution(BaseModel):
    category: str
    count: int
    percentage: float

class MatchDistribution(BaseModel):
    tier: str  # "90%+ Match", "75-89% Match", "50-74% Match", "<50% Match"
    count: int

class ApplicationFunnel(BaseModel):
    discovered: int
    matched_high: int  # >75%
    saved: int
    applied: int

class AIInsightItem(BaseModel):
    id: str
    type: str  # "deadline_alert", "skill_strength", "skill_opportunity", "category_fit"
    icon: str  # "clock", "sparkles", "zap", "trending"
    text: str
    action_label: Optional[str] = None
    action_target: Optional[str] = None

class DeadlineTimelineItem(BaseModel):
    id: int
    title: str
    organization: str
    category: str
    timeline_tag: str  # "TODAY", "OCT 5", "OCT 8", etc.
    exact_date: Optional[datetime] = None
    days_left: int
    urgency_level: str  # "critical", "urgent", "upcoming", "later"
    color: str  # "rose", "amber", "yellow", "emerald"
    match_score: float

class DashboardAnalyticsOut(BaseModel):
    total_opportunities: int
    recommended_count: int
    high_match_count: int
    closing_soon_count: int
    upcoming_deadlines_count: int
    saved_count: int
    applied_count: int
    profile_strength: int
    ai_insights: List[AIInsightItem] = []
    deadline_timeline: List[DeadlineTimelineItem] = []
    category_distribution: List[CategoryDistribution] = []
    match_distribution: List[MatchDistribution] = []
    application_funnel: ApplicationFunnel

