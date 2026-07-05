from datetime import date

from pydantic import BaseModel, EmailStr


class ClientCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    birth_date: date
    accepted_terms: bool


class ClientRead(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    birth_date: date
    accepted_terms: bool

    class Config:
        from_attributes = True
