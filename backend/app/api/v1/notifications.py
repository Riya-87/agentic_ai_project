from typing import List, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.notification import Notification
from app.schemas.notification import NotificationOut, NotificationMarkReadRequest

router = APIRouter(prefix="/notifications", tags=["Notifications & Alerts"])

@router.get("", response_model=List[NotificationOut])
def get_notifications(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(limit).all()
    return [NotificationOut.model_validate(n) for n in notifications]

@router.post("/read", response_model=Dict[str, str])
def mark_notifications_read(
    payload: NotificationMarkReadRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    if payload.mark_all:
        query.update({Notification.is_read: True})
    elif payload.notification_ids:
        query.filter(Notification.id.in_(payload.notification_ids)).update(
            {Notification.is_read: True}, synchronize_session=False
        )
    db.commit()
    return {"status": "success", "message": "Notifications marked as read"}

@router.get("/unread-count", response_model=Dict[str, int])
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    return {"unread_count": count}
