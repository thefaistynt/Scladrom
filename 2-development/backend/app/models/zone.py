from sqlalchemy import Column, Integer, String

from app.core.database import Base


class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    max_capacity = Column(Integer, nullable=False, default=16)
