from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class InstructorRating(Base):
    __tablename__ = "instructor_ratings"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False, unique=True)
    score = Column(Integer, nullable=False)
    review_text = Column(String, nullable=True)

    booking = relationship("Booking")
