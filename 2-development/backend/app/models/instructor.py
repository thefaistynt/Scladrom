from sqlalchemy import Boolean, Column, Integer, String

from app.core.database import Base


class Instructor(Base):
    __tablename__ = "instructors"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    specialization = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
