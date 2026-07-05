from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.bookings import router as bookings_router
from app.api.v1.info import router as info_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.slots import router as slots_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(slots_router, prefix="/slots", tags=["slots"])
api_router.include_router(bookings_router, prefix="/bookings", tags=["bookings"])
api_router.include_router(info_router, prefix="/info", tags=["info"])
api_router.include_router(notifications_router, prefix="/me", tags=["notifications"])
