from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.opportunity import Opportunity
from app.models.saved_opportunity import SavedOpportunity
from app.schemas.saved_opportunity import SavedOpportunityOut, SavedOpportunityCreate, SavedOpportunityUpdate

router = APIRouter(prefix="/saved", tags=["Saved & Tracked Applications"])

@router.get("", response_model=List[SavedOpportunityOut])
def get_saved_opportunities(
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(SavedOpportunity).filter(SavedOpportunity.user_id == current_user.id)
    if status_filter:
        query = query.filter(SavedOpportunity.status == status_filter)
    
    saved_list = query.order_by(SavedOpportunity.updated_at.desc()).all()
    return [SavedOpportunityOut.model_validate(s) for s in saved_list]

@router.post("", response_model=SavedOpportunityOut, status_code=status.HTTP_201_CREATED)
def save_or_update_opportunity(
    saved_in: SavedOpportunityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    opp = db.query(Opportunity).filter(Opportunity.id == saved_in.opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    existing = db.query(SavedOpportunity).filter(
        SavedOpportunity.user_id == current_user.id,
        SavedOpportunity.opportunity_id == saved_in.opportunity_id
    ).first()

    if existing:
        existing.status = saved_in.status
        existing.notes = saved_in.notes or existing.notes
        if saved_in.status == "applied" and not existing.applied_at:
            existing.applied_at = datetime.utcnow()
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return SavedOpportunityOut.model_validate(existing)

    new_saved = SavedOpportunity(
        user_id=current_user.id,
        opportunity_id=saved_in.opportunity_id,
        status=saved_in.status,
        notes=saved_in.notes or "",
        applied_at=datetime.utcnow() if saved_in.status == "applied" else None
    )
    db.add(new_saved)
    db.commit()
    db.refresh(new_saved)
    return SavedOpportunityOut.model_validate(new_saved)

@router.put("/{opportunity_id}", response_model=SavedOpportunityOut)
def update_saved_status(
    opportunity_id: int,
    update_in: SavedOpportunityUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(SavedOpportunity).filter(
        SavedOpportunity.user_id == current_user.id,
        SavedOpportunity.opportunity_id == opportunity_id
    ).first()

    if not existing:
        raise HTTPException(status_code=404, detail="Saved opportunity entry not found")

    if update_in.status is not None:
        existing.status = update_in.status
        if update_in.status == "applied" and not existing.applied_at:
            existing.applied_at = datetime.utcnow()
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
