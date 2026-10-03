from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class OpportunitySkill(Base):
    __tablename__ = "opportunity_skills"

    id = Column(Integer, primary_key=True, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String(100), index=True, nullable=False)
    importance = Column(Float, default=1.0)  # Weight / relevance score 0.0 - 1.0

    # Relationships
    opportunity = relationship("Opportunity", back_populates="skills_rel")
