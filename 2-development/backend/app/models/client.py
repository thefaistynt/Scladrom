from sqlalchemy import Boolean, Column, Date, Integer, String
from sqlalchemy.orm import validates

from app.core.database import Base


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    birth_date = Column(Date, nullable=False)
    accepted_terms = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    experience_level = Column(String(50), nullable=False, default="experienced")

    @validates("experience_level")
    def validate_experience_level(self, key, value):
        allowed = {"beginner", "experienced"}
        if value not in allowed:
            raise ValueError("invalid experience level")
        return value
