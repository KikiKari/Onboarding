import os
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field


class ContactRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    message: str = Field(min_length=10, max_length=2000)


class ContactResponse(BaseModel):
    accepted: bool
    received_at: datetime


app = FastAPI(title="Project Platform API", version="1.0.0")
origins = [origin.strip() for origin in os.getenv("CONTACT_ALLOWED_ORIGINS", "http://localhost:3000").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/contact", response_model=ContactResponse, status_code=202)
def submit_contact(_: ContactRequest) -> ContactResponse:
    return ContactResponse(accepted=True, received_at=datetime.now(timezone.utc))
