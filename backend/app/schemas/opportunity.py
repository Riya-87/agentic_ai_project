from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel

class OpportunityBase(BaseModel):
    title: str
    organization: str
    description: str
    summary: Optional[str] = ""
    category: str
    
    eligibility: Optional[str] = "Open to all students"
    deadline: Optional[datetime] = None
    start_date: Optional[datetime] = None
    location: Optional[str] = "Global"
    mode: Optional[str] = "Online"
    cost: Optional[str] = "Free"
    is_free: Optional[bool] = True
    stipend_or_prize: Optional[str] = "Certificates & Recognition"
    
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    degree_requirements: List[str] = []
    academic_year_requirements: List[str] = []
    tags: List[str] = []
    
    official_url: str
    source_name: Optional[str] = "Official Portal"
    source_url: Optional[str] = ""
    source_type: Optional[str] = "public_platform"
    sources: List[Dict[str, Any]] = []
    source_count: Optional[int] = 1
    
    verification_status: Optional[str] = "PUBLIC SOURCE" # "VERIFIED", "PUBLIC SOURCE", "UNVERIFIED", "EXPIRED"
    is_live: Optional[bool] = True
    is_demo: Optional[bool] = False
    status: Optional[str] = "active"

class OpportunityCreate(OpportunityBase):
    raw_content: Optional[str] = ""
    search_run_id: Optional[str] = None

class OpportunityUpdate(BaseModel):
    title: Optional[str] = None
    organization: Optional[str] = None
    description: Optional[str] = None
    summary: Optional[str] = None
    category: Optional[str] = None
    eligibility: Optional[str] = None
    deadline: Optional[datetime] = None
    location: Optional[str] = None
    mode: Optional[str] = None
    cost: Optional[str] = None
    is_free: Optional[bool] = None
    stipend_or_prize: Optional[str] = None
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    official_url: Optional[str] = None
    verification_status: Optional[str] = None
    status: Optional[str] = None

class OpportunityOut(OpportunityBase):
    id: int
    first_discovered_at: Optional[datetime] = None
    last_checked_at: Optional[datetime] = None
    last_verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class OpportunityFilter(BaseModel):
    category: Optional[str] = None
    mode: Optional[str] = None
    is_free: Optional[bool] = None
    search: Optional[str] = None
    source: Optional[str] = None # "LinkedIn", "Internshala", "Devpost", "MLH", "Kaggle", "Unstop", etc.
    verification_status: Optional[str] = None # "VERIFIED", "PUBLIC SOURCE", "UNVERIFIED", "EXPIRED"
    data_source_type: Optional[str] = "all" # "all", "live", "demo"
    min_match: Optional[float] = None
    urgency: Optional[str] = None
    sort_by: Optional[str] = "match"  # "match", "deadline", "created", "popularity", "verification"
    page: int = 1
    page_size: int = 50
