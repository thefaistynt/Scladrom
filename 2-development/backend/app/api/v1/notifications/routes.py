from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.client import Client
from app.models.notification_settings import NotificationSettings
from app.schemas.notification_settings import NotificationSettingsRead, NotificationSettingsWrite

router = APIRouter()


def _get_client_settings(db: Session, client_id: int | None = None) -> NotificationSettings:
    if client_id is not None:
        settings = db.query(NotificationSettings).filter(NotificationSettings.client_id == client_id).first()
        if settings:
            return settings

    settings = db.query(NotificationSettings).order_by(NotificationSettings.client_id).first()
    if not settings:
        fallback_client_id = client_id if client_id is not None else 1
        settings = NotificationSettings(client_id=fallback_client_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("/notification-settings", response_model=NotificationSettingsRead)
def get_notification_settings(db: Session = Depends(get_db)) -> NotificationSettingsRead:
    client = db.query(Client).order_by(Client.id).first()
    settings = _get_client_settings(db, client.id if client else None)
    return NotificationSettingsRead(
        enabled=settings.enabled,
        reminderMinutesBefore=settings.reminder_minutes_before,
        cancellationNotifications=settings.cancellation_notifications,
    )


@router.put("/notification-settings", response_model=NotificationSettingsRead)
def update_notification_settings(payload: NotificationSettingsWrite, db: Session = Depends(get_db)) -> NotificationSettingsRead:
    client = db.query(Client).order_by(Client.id).first()
    settings = _get_client_settings(db, client.id if client else None)
    settings.enabled = payload.enabled
    settings.reminder_minutes_before = payload.reminderMinutesBefore
    settings.cancellation_notifications = payload.cancellationNotifications
    db.commit()
    db.refresh(settings)
    return NotificationSettingsRead(
        enabled=settings.enabled,
        reminderMinutesBefore=settings.reminder_minutes_before,
        cancellationNotifications=settings.cancellation_notifications,
    )
