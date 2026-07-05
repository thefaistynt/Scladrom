from datetime import datetime

from pydantic import BaseModel


class BookingCreate(BaseModel):
    slot_id: int
    seats_count: int = 1
    rental_option: str = "none"
    offer_accepted: bool = False


class BookingRead(BaseModel):
    id: int
    client_id: int
    slot_id: int
    status: str
    booked_at: datetime
    rental_option: str
    training_amount: int
    rental_amount: int
    total_amount: int
    slot: dict | None = None

    class Config:
        from_attributes = True
