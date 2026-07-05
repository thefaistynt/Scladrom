from datetime import date, datetime, time, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.slot import Slot
from app.schemas.slot import SlotRead

router = APIRouter()


@router.get("", response_model=list[SlotRead])
def list_slots(
    db: Session = Depends(get_db),
    start_date: date | None = None,
    format_name: str | None = Query(default=None, alias="format"),
    instructor_name: str | None = Query(default=None, alias="instructor"),
    time_of_day: str | None = None,
    available_only: bool | None = None,
) -> list[SlotRead]:
    now = datetime.utcnow()
    future = now + timedelta(days=7)
    query = db.query(Slot).filter(Slot.start_time >= now, Slot.start_time <= future)

    if start_date:
        start_dt = datetime.combine(start_date, time.min)
        end_dt = start_dt + timedelta(days=1)
        query = query.filter(Slot.start_time >= start_dt, Slot.start_time < end_dt)

    if format_name:
        query = query.filter(Slot.format_name.ilike(format_name))

    if instructor_name:
        query = query.filter(Slot.instructor_name.ilike(instructor_name))

    if time_of_day:
        time_of_day = time_of_day.lower()
        if time_of_day == "morning":
            query = query.filter(Slot.start_time >= datetime.combine(date.today(), time(6, 0)), Slot.start_time < datetime.combine(date.today(), time(12, 0)))
        elif time_of_day == "afternoon":
            query = query.filter(Slot.start_time >= datetime.combine(date.today(), time(12, 0)), Slot.start_time < datetime.combine(date.today(), time(18, 0)))
        elif time_of_day == "evening":
            query = query.filter(Slot.start_time >= datetime.combine(date.today(), time(18, 0)))

    if available_only:
        query = query.filter(Slot.available_spots > 0)

    return query.order_by(Slot.start_time).all()


@router.get("/{slot_id}", response_model=SlotRead)
def get_slot(slot_id: int, db: Session = Depends(get_db)) -> SlotRead:
    slot = db.query(Slot).filter(Slot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="slot not found")
    return slot
