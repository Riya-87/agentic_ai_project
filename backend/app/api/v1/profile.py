from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.auth import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.profile import StudentProfile
from app.schemas.profile import StudentProfileOut, StudentProfileUpdate, ProfileStrengthOut, ProfileStrengthCategory

router = APIRouter()

def calculate_profile_strength(prof: StudentProfile) -> ProfileStrengthOut:
    breakdown = []
    completed = []
    missing = []
    total_score = 0

    # 1. Basic Information (20%)
    basic_score = 0
    if prof.bio and len(prof.bio.strip()) > 10:
        basic_score += 10
    if prof.resume_summary and len(prof.resume_summary.strip()) > 10:
        basic_score += 10
    elif prof.bio and len(prof.bio.strip()) > 40:
        basic_score += 10
    
    is_basic_done = basic_score >= 15
    if is_basic_done:
        completed.append("Basic Information & Bio")
    else:
        missing.append("Add a detailed bio or resume highlights to complete Basic Information (20%)")
    
    breakdown.append(ProfileStrengthCategory(
        name="Basic Information",
        weight=20,
        score=basic_score,
        is_completed=is_basic_done,
        description="Bio and portfolio background"
    ))
    total_score += basic_score

    # 2. Education (20%)
    edu_score = 0
    if prof.degree and len(prof.degree) > 2:
        edu_score += 5
    if prof.branch and len(prof.branch) > 2:
        edu_score += 5
    if prof.college and len(prof.college) > 2:
        edu_score += 5
    if prof.gpa and len(prof.gpa.strip()) > 0:
        edu_score += 5
    
    is_edu_done = edu_score >= 15
    if is_edu_done:
        completed.append("Education & Degree Credentials")
    else:
        missing.append("Verify your Degree, Branch, College and GPA (20%)")
    
    breakdown.append(ProfileStrengthCategory(
        name="Education",
        weight=20,
        score=edu_score,
        is_completed=is_edu_done,
        description="Degree, university, major & GPA"
    ))
    total_score += edu_score

    # 3. Skills (25%)
    skill_count = len(prof.skills) if prof.skills else 0
    if skill_count >= 5:
        skills_score = 25
    elif skill_count >= 3:
        skills_score = 18
    elif skill_count >= 1:
        skills_score = 10
    else:
        skills_score = 0

    is_skills_done = skills_score >= 20
    if is_skills_done:
        completed.append(f"Technical Skills ({skill_count} added)")
    else:
        missing.append(f"Add at least {max(1, 5 - skill_count)} more technical skill(s) (e.g., Python, Docker, PyTorch) (25%)")

    breakdown.append(ProfileStrengthCategory(
        name="Skills",
        weight=25,
        score=skills_score,
        is_completed=is_skills_done,
        description="Core technical competencies & frameworks"
    ))
    total_score += skills_score

    # 4. Interests (15%)
    interest_count = len(prof.interests) if prof.interests else 0
    if interest_count >= 3:
        interests_score = 15
    elif interest_count >= 2:
        interests_score = 10
    elif interest_count >= 1:
        interests_score = 5
    else:
        interests_score = 0

    is_interests_done = interests_score >= 10
    if is_interests_done:
        completed.append(f"Research Interests ({interest_count} selected)")
    else:
        missing.append("Select at least 2-3 research & domain interests (15%)")

    breakdown.append(ProfileStrengthCategory(
        name="Interests",
        weight=15,
        score=interests_score,
        is_completed=is_interests_done,
        description="Academic & research passion areas"
    ))
    total_score += interests_score

    # 5. Preferences (10%)
    pref_score = 0
    if prof.preferred_categories and len(prof.preferred_categories) >= 1:
        pref_score += 5
    if prof.preferred_location and len(prof.preferred_location) > 2:
        pref_score += 5

    is_pref_done = pref_score >= 8
    if is_pref_done:
        completed.append("Preferences & Location")
    else:
        missing.append("Configure preferred opportunity types and target locations (10%)")

    breakdown.append(ProfileStrengthCategory(
        name="Preferences",
        weight=10,
        score=pref_score,
        is_completed=is_pref_done,
        description="Target categories & working modes"
    ))
    total_score += pref_score

    # 6. Career Goals (10%)
    career_goal_val = getattr(prof, "career_goals", None) or ""
    if career_goal_val and len(career_goal_val.strip()) > 3:
        career_score = 10
        completed.append("Career Goals")
    else:
        career_score = 0
        missing.append("Define your primary Career Goals (e.g. AI Research Engineer) (10%)")

    breakdown.append(ProfileStrengthCategory(
        name="Career Goals",
        weight=10,
        score=career_score,
        is_completed=career_score >= 10,
        description="Target post-graduation roles & aspirations"
    ))
    total_score += career_score

    total_score = min(100, max(0, total_score))
    level = "All-Star" if total_score >= 85 else "Advanced" if total_score >= 70 else "Intermediate" if total_score >= 45 else "Beginner"

    suggested_skills = ["Docker", "Kubernetes", "PyTorch", "FastAPI", "Next.js", "TypeScript", "LangChain", "PostgreSQL", "AWS"]
    current_skills_lower = [s.lower() for s in (prof.skills or [])]
    filtered_suggestions = [s for s in suggested_skills if s.lower() not in current_skills_lower][:5]

    return ProfileStrengthOut(
        score=total_score,
        level=level,
        breakdown=breakdown,
        completed_fields=completed,
        missing_recommendations=missing,
        suggested_skills=filtered_suggestions
    )


@router.get("/me", response_model=StudentProfileOut)
def get_my_profile(current_user: Optional[User] = Depends(get_optional_current_user), db: Session = Depends(get_db)):
    user_id = current_user.id if current_user else 1
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
    if not profile:
        profile = StudentProfile(user_id=user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return StudentProfileOut.model_validate(profile)

@router.put("/me", response_model=StudentProfileOut)
def update_my_profile(
    profile_in: StudentProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)

    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    # Recalculate strength
    strength_info = calculate_profile_strength(profile)
    profile.profile_strength = strength_info.score

    db.commit()
    db.refresh(profile)

    # Trigger re-matching asynchronously/fast-path for this user
    try:
        orchestrator.match_single_student(db, current_user.id)
    except Exception:
        pass

    return StudentProfileOut.model_validate(profile)

@router.get("/strength", response_model=ProfileStrengthOut)
def get_strength_breakdown(current_user: Optional[User] = Depends(get_optional_current_user), db: Session = Depends(get_db)):
    user_id = current_user.id if current_user else 1
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
    if not profile:
        profile = StudentProfile(user_id=user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return calculate_profile_strength(profile)
