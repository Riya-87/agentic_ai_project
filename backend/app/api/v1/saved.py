from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.auth import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.opportunity import Opportunity
from app.models.saved_opportunity import SavedOpportunity
from app.schemas.saved_opportunity import SavedOpportunityOut, SavedOpportunityCreate, SavedOpportunityUpdate

router = APIRouter(prefix="/saved", tags=["Saved & Tracked Applications"])

@router.get("", response_model=List[SavedOpportunityOut])
def get_saved_opportunities(
    status_filter: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id if current_user else 1
    query = db.query(SavedOpportunity).filter(SavedOpportunity.user_id == user_id)
    if status_filter:
        query = query.filter(SavedOpportunity.status.ilike(status_filter))
    
    saved_list = query.order_by(SavedOpportunity.updated_at.desc()).all()
    return [SavedOpportunityOut.model_validate(s) for s in saved_list]

@router.post("", response_model=SavedOpportunityOut, status_code=status.HTTP_201_CREATED)
def save_or_update_opportunity(
    saved_in: SavedOpportunityCreate,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id if current_user else 1
    opp = db.query(Opportunity).filter(Opportunity.id == saved_in.opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    status_normalized = saved_in.status.upper()
    existing = db.query(SavedOpportunity).filter(
        SavedOpportunity.user_id == user_id,
        SavedOpportunity.opportunity_id == saved_in.opportunity_id
    ).first()

    now_iso = datetime.utcnow().isoformat()

    if existing:
        old_status = existing.status
        existing.status = status_normalized
        existing.notes = saved_in.notes or existing.notes
        if status_normalized == "APPLIED" and not existing.applied_at:
            existing.applied_at = datetime.utcnow()
        
        # Append to stage history
        history = list(existing.stage_history or [])
        if old_status != status_normalized or not history:
            history.append({
                "stage": status_normalized,
                "timestamp": now_iso,
                "notes": saved_in.notes or f"Transitioned to {status_normalized}"
            })
            existing.stage_history = history

        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return SavedOpportunityOut.model_validate(existing)

    initial_history = [{
        "stage": status_normalized,
        "timestamp": now_iso,
        "notes": saved_in.notes or f"Marked as {status_normalized}"
    }]

    new_saved = SavedOpportunity(
        user_id=user_id,
        opportunity_id=saved_in.opportunity_id,
        status=status_normalized,
        notes=saved_in.notes or "",
        applied_at=datetime.utcnow() if status_normalized == "APPLIED" else None,
        stage_history=initial_history
    )
    db.add(new_saved)
    db.commit()
    db.refresh(new_saved)
    return SavedOpportunityOut.model_validate(new_saved)

@router.put("/{opportunity_id}", response_model=SavedOpportunityOut)
def update_saved_status(
    opportunity_id: int,
    update_in: SavedOpportunityUpdate,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id if current_user else 1
    existing = db.query(SavedOpportunity).filter(
        SavedOpportunity.user_id == user_id,
        SavedOpportunity.opportunity_id == opportunity_id
    ).first()

    if not existing:
        raise HTTPException(status_code=404, detail="Saved opportunity entry not found")

    now_iso = datetime.utcnow().isoformat()

    if update_in.status is not None:
        status_normalized = update_in.status.upper()
        old_status = existing.status
        existing.status = status_normalized
        if status_normalized == "APPLIED" and not existing.applied_at:
            existing.applied_at = datetime.utcnow()
        
        history = list(existing.stage_history or [])
        if old_status != status_normalized:
            history.append({
                "stage": status_normalized,
                "timestamp": now_iso,
                "notes": update_in.notes or f"Transitioned to {status_normalized}"
            })
            existing.stage_history = history

    if update_in.notes is not None:
        existing.notes = update_in.notes
    if update_in.applied_at is not None:
        existing.applied_at = update_in.applied_at

    existing.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(existing)
    return SavedOpportunityOut.model_validate(existing)

@router.delete("/{opportunity_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_saved_opportunity(
    opportunity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(SavedOpportunity).filter(
        SavedOpportunity.user_id == current_user.id,
        SavedOpportunity.opportunity_id == opportunity_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
    return None
