from datetime import datetime

from pydantic import BaseModel


class SlotRead(BaseModel):
    id: int
    start_time: datetime
    end_time: datetime
    capacity: int
    available_spots: int
    instructor_name: str
    format_name: str
    zone_name: str | None = None
    price: int | None = None
    status: str

    class Config:
        from_attributes = True
