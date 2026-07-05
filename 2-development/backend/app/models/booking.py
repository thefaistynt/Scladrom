from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship, validates

from app.core.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    slot_id = Column(Integer, ForeignKey("slots.id"), nullable=False)
    status = Column(String(50), nullable=False, default="pending")
    booked_at = Column(DateTime, nullable=False)
    rental_option = Column(String(50), nullable=False, default="none")
    training_amount = Column(Integer, nullable=False, default=0)
    rental_amount = Column(Integer, nullable=False, default=0)
    total_amount = Column(Integer, nullable=False, default=0)

    client = relationship("Client")
    slot = relationship("Slot")

    @validates("status")
    def validate_status(self, key, value):
        allowed = {"pending", "confirmed", "cancelled", "cancelled_by_gym"}
        if value not in allowed:
            raise ValueError("invalid booking status")
        return value

    @validates("rental_option")
    def validate_rental_option(self, key, value):
        allowed = {"none", "full", "own"}
        if value not in allowed:
            raise ValueError("invalid rental option")
        return value
