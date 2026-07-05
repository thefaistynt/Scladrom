from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.booking import Booking
from app.models.client import Client
from app.models.slot import Slot
from app.schemas.booking import BookingCreate, BookingRead
from app.services.notifications import dispatch_notification

router = APIRouter()


def _sync_booking_status(booking: Booking, db: Session) -> None:
    if not booking.slot_id:
        return

    slot = db.query(Slot).filter(Slot.id == booking.slot_id).first()
    if not slot:
        return

    if booking.status in {"confirmed", "pending"} and slot.status == "cancelled_by_gym":
        booking.status = "cancelled_by_gym"
    elif booking.status in {"confirmed", "pending"} and slot.status == "cancelled":
        booking.status = "cancelled"


def _booking_to_read(booking: Booking) -> BookingRead:
    return BookingRead(
        id=booking.id,
        client_id=booking.client_id,
        slot_id=booking.slot_id,
        status=booking.status,
        booked_at=booking.booked_at,
        rental_option=getattr(booking, "rental_option", "none"),
        training_amount=getattr(booking, "training_amount", 0),
        rental_amount=getattr(booking, "rental_amount", 0),
        total_amount=getattr(booking, "total_amount", 0),
        slot={"id": booking.slot_id} if booking.slot_id else None,
    )


@router.post("", response_model=BookingRead, status_code=status.HTTP_201_CREATED)
def create_booking(payload: BookingCreate, db: Session = Depends(get_db)) -> BookingRead:
    slot = db.query(Slot).filter(Slot.id == payload.slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="slot not found")
    if slot.status in {"cancelled_by_gym", "cancelled"}:
        raise HTTPException(status_code=410, detail="slot is cancelled")
    if payload.seats_count < 1:
        raise HTTPException(status_code=422, detail="seats_count must be at least 1")
    if slot.available_spots < payload.seats_count:
        raise HTTPException(status_code=409, detail="slot is full")
    if not payload.offer_accepted:
        raise HTTPException(status_code=400, detail="offer must be accepted")

    client = db.query(Client).order_by(Client.id).first()
    if client and client.experience_level == "beginner" and str(slot.format_name).lower() not in {"beginner"}:
        raise HTTPException(status_code=409, detail="slot format is not suitable for this client")

    training_amount = (slot.price or 0) * payload.seats_count
    rental_amount = 1000 * payload.seats_count if payload.rental_option == "full" else 0
    total_amount = training_amount + rental_amount

    booking = Booking(
        client_id=client.id if client else 1,
        slot_id=slot.id,
        status="confirmed",
        booked_at=datetime.utcnow(),
        rental_option=payload.rental_option,
        training_amount=training_amount,
        rental_amount=rental_amount,
        total_amount=total_amount,
    )

    slot.available_spots -= payload.seats_count
    db.add(booking)
    db.commit()
    db.refresh(booking)
    dispatch_notification("booking_confirmed", db, booking.client_id, booking)
    return _booking_to_read(booking)


@router.get("", response_model=list[BookingRead])
def list_bookings(db: Session = Depends(get_db)) -> list[BookingRead]:
    bookings = db.query(Booking).filter(Booking.client_id == 1).all()
    for booking in bookings:
        _sync_booking_status(booking, db)
    return [_booking_to_read(booking) for booking in bookings]


@router.get("/{booking_id}", response_model=BookingRead)
def get_booking(booking_id: int, db: Session = Depends(get_db)) -> BookingRead:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="booking not found")

    _sync_booking_status(booking, db)
    return _booking_to_read(booking)


@router.delete("/{booking_id}", status_code=status.HTTP_200_OK)
def cancel_booking(booking_id: int, db: Session = Depends(get_db)) -> dict[str, str]:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="booking not found")
    _sync_booking_status(booking, db)

    if booking.slot and booking.slot.status == "cancelled_by_gym":
        booking.status = "cancelled_by_gym"
        db.commit()
        dispatch_notification("slot_cancelled", db, booking.client_id, booking)
        return {"status": "cancelled_by_gym"}

    if booking.status in {"cancelled", "cancelled_by_gym"}:
        raise HTTPException(status_code=409, detail="booking already cancelled")

    if booking.slot and booking.slot.start_time - datetime.utcnow() < timedelta(hours=24):
        raise HTTPException(status_code=409, detail="cancellation is not allowed within 24 hours")

    booking.status = "cancelled"
    if booking.slot:
        booking.slot.available_spots += 1
    db.commit()
    dispatch_notification("booking_cancelled", db, booking.client_id, booking)
    return {"status": "cancelled"}
