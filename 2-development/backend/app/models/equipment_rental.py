from sqlalchemy import Boolean, Column, ForeignKey, Integer, Numeric
from sqlalchemy.orm import relationship

from app.core.database import Base


class EquipmentRental(Base):
    __tablename__ = "equipment_rentals"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False, unique=True)
    use_rental = Column(Boolean, nullable=False, default=False)
    rental_price = Column(Numeric(10, 2), nullable=False, default=0)

    booking = relationship("Booking")
