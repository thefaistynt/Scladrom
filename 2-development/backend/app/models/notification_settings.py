from sqlalchemy import Boolean, Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.core.database import Base


class NotificationSettings(Base):
    __tablename__ = "notification_settings"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False, unique=True)
    enabled = Column(Boolean, nullable=False, default=True)
    reminder_minutes_before = Column(Integer, nullable=False, default=60)
    cancellation_notifications = Column(Boolean, nullable=False, default=True)

    client = relationship("Client")
