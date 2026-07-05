from sqlalchemy import Column, Integer, String

from app.core.database import Base


class TrainingFormat(Base):
    __tablename__ = "training_formats"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    level = Column(String(50), nullable=False)
    description = Column(String, nullable=True)
