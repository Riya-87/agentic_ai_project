from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.opportunity import OpportunityOut

class SavedOpportunityBase(BaseModel):
    opportunity_id: int
    status: str = "SAVED"  # "SAVED", "INTERESTED", "APPLIED", "INTERVIEW", "SELECTED", "REJECTED"
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
    applied_at: Optional[datetime] = None
    stage_history: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
    opportunity: OpportunityOut

    class Config:
        from_attributes = True
