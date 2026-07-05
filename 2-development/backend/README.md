# Minimal FastAPI Backend Skeleton

This project contains a minimal backend skeleton for a client booking app with modules for auth, slots, bookings, and info.

## Structure

- app/main.py - FastAPI app entrypoint
- app/core/config.py - settings
- app/core/database.py - database bootstrap
- app/models - SQLAlchemy models
- app/schemas - Pydantic schemas
- app/api/v1 - routers by module
- tests - pytest setup and smoke tests

## Run locally

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Test

```bash
pytest
```
