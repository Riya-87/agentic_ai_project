from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.schemas.opportunity import OpportunityOut

class SavedOpportunityBase(BaseModel):
    opportunity_id: int
    status: str = "saved"  # "saved", "in_progress", "applied", "archived"
    notes: Optional[str] = ""

class SavedOpportunityCreate(SavedOpportunityBase):
    pass

class SavedOpportunityUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    applied_at: Optional[datetime] = None

class SavedOpportunityOut(SavedOpportunityBase):
    id: int
    user_id: int
    applied_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    opportunity: OpportunityOut

    class Config:
        from_attributes = True
