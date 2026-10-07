"""
Users router — user creation and profile retrieval.

Endpoints
---------
POST /users                  — create a new user
GET  /users/{user_id}/profile — retrieve a user's profile
"""

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.database_models import User, UserProfile
from backend.schemas.user import UserCreate

logger = logging.getLogger(__name__)

router = APIRouter()


# ---------------------------------------------------------------------------
# Create user
# ---------------------------------------------------------------------------

@router.post("/users", status_code=201)
def create_user(body: UserCreate, db: Session = Depends(get_db)) -> dict[str, Any]:
    """
    Create a new user record.

    Returns only username and id — no PII beyond what the schema defines
    (Requirement 12.5).
    """
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(username=body.username, email=body.email)
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"id": user.id, "username": user.username}


# ---------------------------------------------------------------------------
# Get user profile
# ---------------------------------------------------------------------------

@router.get("/users/{user_id}/profile")
def get_user_profile(user_id: int, db: Session = Depends(get_db)) -> dict[str, Any]:
    """
    Return the profile for the given user (Requirement 12.5).

    Raises HTTP 404 if the user or profile does not exist.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return {
        "user_id": profile.user_id,
        "education": profile.education,
        "course": profile.course,
        "specialization": profile.specialization,
    }
