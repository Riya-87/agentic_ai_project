from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from app.schemas.opportunity import OpportunityOut

class MatchReason(BaseModel):
    type: str  # "positive", "caution", "neutral"
    text: str

class MatchingBreakdown(BaseModel):
    overall_match: float  # 0 to 100
    skill_match: float    # 0 to 100
    eligibility_match: float # 0 to 100
    interest_match: float # 0 to 100
    academic_year_match: float = 100.0 # 0 to 100
    deadline_urgency: float # 0 to 100
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    match_reasons: List[MatchReason] = []
    explanation: str
    missing_requirements: Optional[str] = ""


class UserMatchOut(MatchingBreakdown):
    id: int
    user_id: int
    opportunity_id: int
    rank_score: float
    calculated_at: datetime

    class Config:
        from_attributes = True

class MatchedOpportunityOut(BaseModel):
    opportunity: OpportunityOut
    match: MatchingBreakdown
    rank_score: float
    is_saved: bool = False
    saved_status: Optional[str] = None  # "saved", "in_progress", "applied"

class ReMatchResponse(BaseModel):
    status: str
    total_matched: int
    top_matches_count: int
    message: str
