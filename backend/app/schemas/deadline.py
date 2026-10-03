from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from app.schemas.opportunity import OpportunityOut

class DeadlineOut(BaseModel):
    id: int
    opportunity_id: int
    title: str
    due_date: datetime
    urgency_level: str  # "critical", "approaching", "upcoming", "normal"
    days_left: int
    is_active: bool
    opportunity: OpportunityOut

    class Config:
        from_attributes = True

class DeadlineCalendarEvent(BaseModel):
    id: int
    opportunity_id: int
    title: str
    organization: str
    category: str
    due_date: datetime
    days_left: int
    urgency_level: str
    is_saved: bool = False
    saved_status: Optional[str] = None
    official_url: str

class UrgencyMetrics(BaseModel):
    critical_count: int  # <= 3 days
    approaching_count: int  # <= 7 days
    upcoming_count: int  # <= 14 days
    total_active_deadlines: int
