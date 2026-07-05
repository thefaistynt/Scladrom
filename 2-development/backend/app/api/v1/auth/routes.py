from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password, verify_password
from app.models.client import Client
from app.schemas.auth import ClientCreate, ClientRead


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

router = APIRouter()


@router.post("/register", response_model=ClientRead, status_code=status.HTTP_201_CREATED)
def register_client(payload: ClientCreate, db: Session = Depends(get_db)) -> ClientRead:
    existing = db.query(Client).filter(Client.email == str(payload.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="email already registered")

    if not payload.accepted_terms:
        raise HTTPException(status_code=400, detail="terms must be accepted")

    if (date.today() - payload.birth_date).days < 18 * 365:
        raise HTTPException(status_code=400, detail="client must be at least 18 years old")

    client = Client(
        email=str(payload.email),
        full_name=payload.full_name,
        password_hash=hash_password(payload.password),
        birth_date=payload.birth_date,
        accepted_terms=payload.accepted_terms,
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


@router.post("/login", response_model=ClientRead)
def login_client(payload: LoginRequest, db: Session = Depends(get_db)) -> ClientRead:
    client = db.query(Client).filter(Client.email == str(payload.email)).first()
    if not client:
        raise HTTPException(status_code=401, detail="invalid credentials")

    if not verify_password(payload.password, client.password_hash):
        raise HTTPException(status_code=401, detail="invalid credentials")

    return client
