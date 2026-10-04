from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, JSON, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    degree = Column(String(100), default="Bachelor of Technology")  # B.Tech, B.S., M.S., Ph.D., etc.
    branch = Column(String(100), default="Computer Science & Engineering")
    academic_year = Column(String(50), default="3rd Year")  # 1st Year, 2nd Year, 3rd Year, 4th Year, Graduate
    college = Column(String(200), default="National Institute of Technology")
    graduation_year = Column(Integer, default=2026)
    
    # Array of strings stored as JSON
    skills = Column(JSON, default=list)  # ["Python", "React", "Machine Learning", "Data Structures"]
    interests = Column(JSON, default=list)  # ["Generative AI", "Distributed Systems", "Robotics", "Open Source"]
    preferred_categories = Column(JSON, default=list)  # ["Hackathon", "Internship", "Research Fellowship", "Scholarship"]
    
    preferred_location = Column(String(100), default="Global / Remote")
    mode_preference = Column(String(50), default="Any")  # "Online", "Offline", "Hybrid", "Any"
    
    gpa = Column(String(20), default="8.8 / 10.0")
    career_goals = Column(String(255), default="AI Research Engineer & Full-Stack Developer")
    bio = Column(Text, default="Passionate undergraduate student enthusiastic about AI, cloud systems, and building innovative software.")
    resume_summary = Column(Text, default="")
    
    # Extended Profile Attributes for 6-Factor Matching & Resume Parser
    projects = Column(JSON, default=list)  # [{"title": "Agentic AI", "description": "...", "skills": ["Python", "FastAPI"]}]
    experience = Column(JSON, default=list)  # [{"role": "AI Intern", "organization": "...", "duration": "3 months"}]
    certifications = Column(JSON, default=list)  # ["Deep Learning Specialization", "AWS Cloud Practitioner"]
    resume_filename = Column(String(255), nullable=True)
    resume_text = Column(Text, default="")
    
    profile_strength = Column(Integer, default=70)  # 0 to 100 percentage
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="profile")

