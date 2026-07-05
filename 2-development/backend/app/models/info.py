from sqlalchemy import Column, Integer, String

from app.core.database import Base


class InfoPage(Base):
    __tablename__ = "info_pages"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(String, nullable=False)
