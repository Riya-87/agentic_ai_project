from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, JSON, Boolean, DateTime, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True, nullable=False)
    organization = Column(String(255), index=True, nullable=False)
    description = Column(Text, nullable=False)
    summary = Column(Text, default="")
    category = Column(String(100), index=True, nullable=False)  # Internship, Job, Hackathon, Scholarship, Research Fellowship, Competition, Grant, Conference, Student Program, Workshop, Open Source
    domain = Column(String(100), index=True, default="General")  # Machine Learning, Web Development, Cloud, Data Science, etc.
    
    eligibility = Column(Text, default="Open to all enrolled university students.")
    deadline = Column(DateTime, index=True, nullable=True)
    start_date = Column(DateTime, nullable=True)
    location = Column(String(150), default="Global")
    mode = Column(String(50), default="Online")  # Online, Offline, Hybrid
    cost = Column(String(50), default="Free")  # Free, Paid ($XX)
    is_free = Column(Boolean, default=True)
    stipend_or_prize = Column(String(150), default="Certificates & Recognition")
    
    required_skills = Column(JSON, default=list)  # ["Python", "FastAPI", "React", "AI/ML"]
    preferred_skills = Column(JSON, default=list) # ["PyTorch", "LangChain"]
    degree_requirements = Column(JSON, default=list) # ["B.Tech", "B.E", "B.Sc", "M.Tech"]
    academic_year_requirements = Column(JSON, default=list) # ["1st Year", "2nd Year", "3rd Year", "4th Year"]
    experience_requirements = Column(JSON, default=list) # ["0-1 years", "Student / Entry Level"]
    tags = Column(JSON, default=list)  # ["AI", "Open Source", "Global", "Summer 2026"]
    
    # Official Canonical & Multi-Source Tracking
    official_url = Column(String(500), nullable=False)
    source_name = Column(String(150), default="Official Portal")
    source_url = Column(String(500), default="")
    source_type = Column(String(50), default="public_platform") # "official_portal", "job_board", "hackathon_platform", "university_domain", "government_portal"
    sources = Column(JSON, default=list) # [{"source_name": "LinkedIn", "source_url": "...", "source_type": "job_board", "last_checked": "..."}]
    source_count = Column(Integer, default=1)
    
    # Verification & Freshness
    verification_status = Column(String(50), default="PUBLIC SOURCE") # "VERIFIED", "PUBLIC SOURCE", "UNVERIFIED", "EXPIRED"
    first_discovered_at = Column(DateTime, default=datetime.utcnow)
    last_checked_at = Column(DateTime, default=datetime.utcnow)
    last_verified_at = Column(DateTime, default=datetime.utcnow)
    
    raw_content = Column(Text, default="")
    status = Column(String(50), default="active")  # active, expired, upcoming
    is_demo = Column(Boolean, default=False)
    is_live = Column(Boolean, default=True)
    search_run_id = Column(String(100), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    skills_rel = relationship("OpportunitySkill", back_populates="opportunity", cascade="all, delete-orphan")
    matches = relationship("UserMatch", back_populates="opportunity", cascade="all, delete-orphan")
    saved_by = relationship("SavedOpportunity", back_populates="opportunity", cascade="all, delete-orphan")
    deadlines = relationship("DeadlineTracker", back_populates="opportunity", cascade="all, delete-orphan")
