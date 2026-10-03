from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str  # "match", "deadline", "update", "system"
    urgency: str  # "low", "medium", "high", "critical"
    is_read: bool
    related_opportunity_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationMarkReadRequest(BaseModel):
    notification_ids: Optional[list[int]] = None
    mark_all: bool = False
