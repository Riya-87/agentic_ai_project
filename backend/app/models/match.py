from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, JSON, Float, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserMatch(Base):
    __tablename__ = "user_matches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    
    overall_match = Column(Float, default=0.0)  # e.g., 91.0 (%)
    skill_match = Column(Float, default=0.0)    # e.g., 95.0 (%)
    education_match = Column(Float, default=0.0) # e.g., 85.0 (%)
    experience_match = Column(Float, default=0.0) # e.g., 75.0 (%)
    location_match = Column(Float, default=0.0) # e.g., 90.0 (%)
    interest_match = Column(Float, default=0.0) # e.g., 90.0 (%)
    eligibility_match = Column(Float, default=0.0) # e.g., 100.0 (%)
    eligibility_status = Column(String(50), default="likely eligible") # "eligible", "likely eligible", "eligibility unclear", "not eligible"
    deadline_urgency = Column(Float, default=0.0) # e.g., 80.0 (%)
    
    matched_skills = Column(JSON, default=list)  # ["Python", "React"]
    missing_skills = Column(JSON, default=list)  # ["Docker", "Rust"]
    
    explanation = Column(Text, default="")
    missing_requirements = Column(Text, default="")
    
    rank_score = Column(Float, default=0.0)  # Weighted ranking score
    calculated_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('user_id', 'opportunity_id', name='uq_user_opportunity_match'),
    )

    # Relationships
    user = relationship("User", back_populates="matches")
    opportunity = relationship("Opportunity", back_populates="matches")
