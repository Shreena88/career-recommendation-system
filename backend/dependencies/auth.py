"""
FastAPI dependency for extracting the current authenticated user
from the JWT cookie.

Usage in route handlers
-----------------------
    from backend.dependencies.auth import get_current_user

    @router.get("/protected")
    def protected(user: User = Depends(get_current_user)):
        ...
"""

import logging

from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.database_models import User
from backend.services.auth_service import decode_access_token

logger = logging.getLogger(__name__)


def get_current_user(
    access_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
) -> User:
    """
    Validate the JWT from the ``access_token`` HttpOnly cookie and return
    the corresponding User row.

    Raises HTTP 401 if:
    - No cookie is present
    - The token is expired or invalid
    - The user no longer exists or is deactivated
    """
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    payload = decode_access_token(access_token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user_id: int | None = payload.get("user_id")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    return user


def get_optional_user(
    access_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
) -> User | None:
    """
    Like get_current_user but returns None instead of raising 401
    when no valid authentication is present. Useful for endpoints
    that work for both authenticated and anonymous users.
    """
    if not access_token:
        return None

    payload = decode_access_token(access_token)
    if payload is None:
        return None

    user_id: int | None = payload.get("user_id")
    if user_id is None:
        return None

    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        return None

    return user
