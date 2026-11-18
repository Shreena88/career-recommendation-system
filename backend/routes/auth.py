"""
Authentication router — register, login, logout, and profile endpoints.

Endpoints
---------
POST /auth/register  — create a new user account
POST /auth/login     — authenticate and receive a session cookie
POST /auth/logout    — clear the session cookie
GET  /auth/me        — return the current user's profile
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from backend.config import get_settings
from backend.database import get_db
from backend.dependencies.auth import get_current_user
from backend.models.database_models import User
from backend.schemas.auth import (
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    UserProfileResponse,
)
from backend.services.auth_service import (
    create_access_token,
    hash_password,
    verify_password,
)

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter(prefix="/auth", tags=["auth"])


# ---------------------------------------------------------------------------
# Register
# ---------------------------------------------------------------------------

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(
    body: RegisterRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> AuthResponse:
    """
    Create a new user account.

    - Normalizes the email to lowercase.
    - Checks for duplicate email.
    - Hashes the password with bcrypt.
    - Creates the user in the database.
    - Sets an HttpOnly JWT cookie.
    - Returns the safe user profile (no password hash).
    """
    normalized_email = body.email.strip().lower()

    # Check for duplicate email
    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    # Create user
    user = User(
        full_name=body.full_name,
        username=normalized_email,  # Use email as username for auth users
        email=normalized_email,
        password_hash=hash_password(body.password),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Set JWT cookie
    token = create_access_token(user_id=user.id, email=user.email)
    _set_auth_cookie(response, token)

    logger.info("User registered: id=%d email=%s", user.id, user.email)

    return AuthResponse(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        is_active=user.is_active,
        message="Registration successful",
    )


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

@router.post("/login", response_model=AuthResponse)
def login(
    body: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> AuthResponse:
    """
    Authenticate a user with email and password.

    - Uses a generic error message to avoid revealing whether the email exists.
    - Verifies the password against the stored bcrypt hash.
    - Sets an HttpOnly JWT cookie on success.
    """
    normalized_email = body.email.strip().lower()

    # Intentionally generic error message for both "email not found"
    # and "wrong password" (prevents user enumeration).
    generic_error = "Invalid email or password"

    user = db.query(User).filter(User.email == normalized_email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=generic_error,
        )

    if not user.password_hash:
        # User exists but was created before auth was added (no password)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=generic_error,
        )

    if not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=generic_error,
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    # Set JWT cookie
    token = create_access_token(user_id=user.id, email=user.email)
    _set_auth_cookie(response, token)

    logger.info("User logged in: id=%d email=%s", user.id, user.email)

    return AuthResponse(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        is_active=user.is_active,
        message="Login successful",
    )


# ---------------------------------------------------------------------------
# Logout
# ---------------------------------------------------------------------------

@router.post("/logout")
def logout(response: Response) -> dict:
    """
    Clear the authentication cookie.

    Since we use stateless JWTs, "logout" simply removes the cookie from the
    browser. The token remains technically valid until it expires, but the
    browser will no longer send it.
    """
    response.delete_cookie(
        key="access_token",
        httponly=True,
        samesite="lax",
        path="/",
    )
    return {"message": "Logged out successfully"}


# ---------------------------------------------------------------------------
# Current user profile
# ---------------------------------------------------------------------------

@router.get("/me", response_model=UserProfileResponse)
def get_me(user: User = Depends(get_current_user)) -> UserProfileResponse:
    """Return the currently authenticated user's safe profile information."""
    return UserProfileResponse(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        is_active=user.is_active,
        created_at=user.created_at.isoformat() if user.created_at else "",
    )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _set_auth_cookie(response: Response, token: str) -> None:
    """
    Set the JWT as an HttpOnly cookie.

    Security settings:
    - httponly: prevents JavaScript access (XSS protection)
    - samesite=lax: prevents CSRF for GET, allows normal navigation
    - secure: should be True in production (HTTPS only)
    - max_age: matches token expiry
    """
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,  # Set to True in production with HTTPS
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
