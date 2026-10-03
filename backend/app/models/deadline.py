from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class DeadlineTracker(Base):
    __tablename__ = "deadlines"

    id = Column(Integer, primary_key=True, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    
    title = Column(String(255), nullable=False)
    due_date = Column(DateTime, nullable=False, index=True)
    urgency_level = Column(String(50), default="normal")  # "critical" (<3d), "approaching" (<7d), "upcoming" (<14d), "normal"
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    opportunity = relationship("Opportunity", back_populates="deadlines")
