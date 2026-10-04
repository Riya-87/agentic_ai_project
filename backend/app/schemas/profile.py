from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class StudentProfileBase(BaseModel):
    degree: str = "Bachelor of Technology"
    branch: str = "Computer Science & Engineering"
    academic_year: str = "3rd Year"
    college: str = "National Institute of Technology"
    graduation_year: int = 2026
    
    skills: List[str] = Field(default_factory=lambda: ["Python", "Machine Learning", "FastAPI", "React", "Data Structures"])
    interests: List[str] = Field(default_factory=lambda: ["Generative AI", "Open Source", "Distributed Systems", "Cloud Computing"])
    preferred_categories: List[str] = Field(default_factory=lambda: ["Hackathon", "Internship", "Research Fellowship", "Scholarship", "Student Program"])
    
    preferred_location: str = "Global / Remote"
    mode_preference: str = "Any"  # "Online", "Offline", "Hybrid", "Any"
    
    gpa: str = "8.8 / 10.0"
    career_goals: Optional[str] = "AI Research Engineer & Full-Stack Developer"
    bio: str = "Passionate undergraduate student enthusiastic about AI, cloud systems, and building innovative software."
    resume_summary: Optional[str] = ""

    # Extended Profile Attributes
    projects: List[dict] = Field(default_factory=list)
    experience: List[dict] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    resume_filename: Optional[str] = None
    resume_text: Optional[str] = ""

class StudentProfileCreate(StudentProfileBase):
    pass

class StudentProfileUpdate(BaseModel):
    degree: Optional[str] = None
    branch: Optional[str] = None
    academic_year: Optional[str] = None
    college: Optional[str] = None
    graduation_year: Optional[int] = None
    
    skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    preferred_categories: Optional[List[str]] = None
    
    preferred_location: Optional[str] = None
    mode_preference: Optional[str] = None
    
    gpa: Optional[str] = None
    career_goals: Optional[str] = None
    bio: Optional[str] = None
    resume_summary: Optional[str] = None

    projects: Optional[List[dict]] = None
    experience: Optional[List[dict]] = None
    certifications: Optional[List[str]] = None
    resume_filename: Optional[str] = None
    resume_text: Optional[str] = None

class StudentProfileOut(StudentProfileBase):
    id: int
    user_id: int
    profile_strength: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProfileStrengthCategory(BaseModel):
    name: str
    weight: int
    score: int
    is_completed: bool
    description: str

class ProfileStrengthOut(BaseModel):
    score: int
    level: str  # "Beginner", "Intermediate", "Advanced", "All-Star"
    breakdown: List[ProfileStrengthCategory] = []
    completed_fields: List[str]
    missing_recommendations: List[str]
    suggested_skills: List[str] = []

