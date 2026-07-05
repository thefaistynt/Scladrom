from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import validates

from app.core.database import Base


class Slot(Base):
    __tablename__ = "slots"

    id = Column(Integer, primary_key=True, index=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    capacity = Column(Integer, nullable=False, default=1)
    available_spots = Column(Integer, nullable=False, default=1)
    instructor_name = Column(String(255), nullable=False)
    format_name = Column(String(100), nullable=False)
    zone_name = Column(String(100), nullable=True)
    price = Column(Integer, nullable=True, default=0)
    status = Column(String(50), nullable=False, default="scheduled")

    @validates("capacity")
    def validate_capacity(self, key, value):
        if value <= 0:
            raise ValueError("capacity must be greater than 0")
        return value

    @validates("available_spots")
    def validate_available_spots(self, key, value):
        if value < 0:
            raise ValueError("available_spots cannot be negative")
        if self.capacity is not None and value > self.capacity:
            raise ValueError("available_spots cannot exceed capacity")
        return value

    @validates("status")
    def validate_status(self, key, value):
        allowed = {"scheduled", "cancelled", "cancelled_by_gym"}
        if value not in allowed:
            raise ValueError("invalid slot status")
        return value
