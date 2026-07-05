from typing import Any

from sqlalchemy.orm import Session

from app.models.notification_settings import NotificationSettings


def dispatch_notification(event_type: str, db: Session, client_id: int | None, booking: Any | None = None) -> None:
    settings = None
    if client_id is not None:
        settings = db.query(NotificationSettings).filter(NotificationSettings.client_id == client_id).first()
    if not settings:
        settings = db.query(NotificationSettings).order_by(NotificationSettings.client_id).first()

    if not settings or not settings.enabled:
        return

    if event_type == "booking_confirmed":
        return
    if event_type == "booking_cancelled" and not settings.cancellation_notifications:
        return
    if event_type == "slot_cancelled" and not settings.cancellation_notifications:
        return
