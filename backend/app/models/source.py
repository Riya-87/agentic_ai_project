from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.core.database import Base

class TrustedSource(Base):
    __tablename__ = "trusted_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    url = Column(String(500), nullable=False)
    type = Column(String(50), default="rss")  # "rss", "api", "web_portal"
    category_focus = Column(String(100), default="All")  # "Hackathons", "Research", "Scholarships", "All"
    is_active = Column(Boolean, default=True)
    last_fetched_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
