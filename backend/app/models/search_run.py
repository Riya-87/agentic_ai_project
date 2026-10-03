from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class SearchRun(Base):
    __tablename__ = "search_runs"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(String(100), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    query_prompt = Column(String(500), default="Autonomous Student Profile Sync")
    status = Column(String(50), default="running")  # "running", "completed", "failed"
    
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    sources_searched = Column(Integer, default=0)
    queries_executed = Column(Integer, default=0)
    candidates_discovered = Column(Integer, default=0)
    valid_opportunities = Column(Integer, default=0)
    duplicates_removed = Column(Integer, default=0)
    profile_matches = Column(Integer, default=0)
    high_matches = Column(Integer, default=0)
    deadlines_within_7_days = Column(Integer, default=0)
    
    sources_list = Column(JSON, default=list)  # [{"name": "LinkedIn", "status": "success", "count": 12}, ...]
    executed_queries = Column(JSON, default=list)  # [{"query": "...", "candidates": 8, "source": "..."}, ...]
    logs = Column(JSON, default=list)  # [{"timestamp": "...", "agent": "...", "message": "..."}, ...]
    summary_report = Column(Text, default="")
    error_details = Column(Text, default="")

    # Relationship
    user = relationship("User", backref="search_runs")
