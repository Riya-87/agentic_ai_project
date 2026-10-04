import logging
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.auth import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.profile import StudentProfile
from app.schemas.profile import StudentProfileOut
from app.services.resume_service import resume_service

logger = logging.getLogger("api.resume")

router = APIRouter(prefix="/resume", tags=["Resume Analysis"])

class TextResumeInput(BaseModel):
    text: str
    apply_to_profile: bool = True

@router.post("/upload")
async def upload_resume_pdf(
    file: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Accepts a student's resume PDF, extracts clean text using pypdf,
    runs structured career & skills extraction with Groq / Gemini,
    updates the student's profile attributes, and triggers automatic 6-factor re-matching.
    """
    user_id = current_user.id if current_user else 1

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are currently supported for resume analysis."
        )

    try:
        pdf_bytes = await file.read()
        if len(pdf_bytes) == 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded PDF file is empty.")

        # Extract text via pypdf
        extracted_text = resume_service.extract_text_from_pdf(pdf_bytes)
        
        # Parse structured profile attributes
        parsed_data = resume_service.parse_resume_content(extracted_text)

        # Update profile and trigger re-matching
        updated_profile = resume_service.apply_parsed_to_profile(
            db=db,
            user_id=user_id,
            parsed_data=parsed_data,
            filename=file.filename,
            raw_text=extracted_text
        )

        return {
            "status": "success",
            "message": "Resume successfully analyzed and profile updated.",
            "filename": file.filename,
            "parsed_data": parsed_data,
            "profile": StudentProfileOut.model_validate(updated_profile)
        }
    except Exception as e:
        logger.error(f"Error analyzing uploaded resume: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Resume analysis failed: {str(e)}")

@router.post("/parse-text")
def parse_resume_text(
    payload: TextResumeInput,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyzes raw text resume / CV content, extracts structured attributes,
    and optionally updates the user's profile.
    """
    user_id = current_user.id if current_user else 1

    if not payload.text or len(payload.text.strip()) < 20:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Resume text must be at least 20 characters.")

    try:
        parsed_data = resume_service.parse_resume_content(payload.text)
        updated_profile = None
        if payload.apply_to_profile:
            updated_profile = resume_service.apply_parsed_to_profile(
                db=db,
                user_id=user_id,
                parsed_data=parsed_data,
                filename="pasted_text_resume.txt",
                raw_text=payload.text
            )

        return {
            "status": "success",
            "parsed_data": parsed_data,
            "profile": StudentProfileOut.model_validate(updated_profile) if updated_profile else None
        }
    except Exception as e:
        logger.error(f"Error parsing resume text: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/status")
def get_resume_status(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the current resume upload and summary status for the user.
    """
    user_id = current_user.id if current_user else 1
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()

    has_resume = bool(profile and (profile.resume_filename or profile.resume_text))
    return {
        "has_resume": has_resume,
        "resume_filename": profile.resume_filename if profile else None,
        "resume_summary": profile.resume_summary if profile else "",
        "profile_strength": profile.profile_strength if profile else 0,
        "projects_count": len(profile.projects or []) if profile else 0,
        "experience_count": len(profile.experience or []) if profile else 0,
        "skills_count": len(profile.skills or []) if profile else 0
    }
