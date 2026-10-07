"""
Recommendations router — career recommendation and reference-data endpoints.

Endpoints
---------
GET  /health        — liveness + model status
POST /recommend     — generate top-5 career recommendations
GET  /careers       — list all known careers
GET  /skills        — list all known skills
GET  /interests     — list all known interests
"""

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from backend.config import get_settings
from backend.database import get_db
from backend.models.database_models import (
    Career,
    Interest,
    RecommendationHistory,
    Skill,
)
from backend.schemas.recommendation import (
    CareerRecommendation,
    RecommendationRequest,
    RecommendationResponse,
)
from utils.preprocessing import normalize_skills_list

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter()


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@router.get("/health")
def health(request: Request) -> dict[str, Any]:
    """Return service liveness and model-loaded status (Requirement 6.5)."""
    recommender = getattr(request.app.state, "recommender", None)
    model_loaded = recommender is not None and recommender._predictor._model is not None
    return {
        "status": "ok",
        "model_loaded": model_loaded,
        "version": settings.APP_VERSION,
    }


# ---------------------------------------------------------------------------
# Recommend
# ---------------------------------------------------------------------------

@router.post("/recommend", response_model=RecommendationResponse)
def recommend(
    body: RecommendationRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> RecommendationResponse:
    """
    Generate top-5 personalized career recommendations.

    - Validates request via Pydantic (Requirements 1.1–1.4).
    - Calls RecommenderService.get_recommendations() (Requirement 6.1).
    - Persists history to DB; failure is non-fatal (Requirement 8.1–8.3).
    - Returns RecommendationResponse on success, HTTP 500 on ML failure.
    """
    recommender = request.app.state.recommender

    # ML inference
    try:
        raw_results = recommender.get_recommendations(
            education=body.education,
            course=body.course,
            specialization=body.specialization,
            skills=body.skills,
            interests=body.interests,
        )
    except Exception as exc:
        logger.error("ML inference failed: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="ML inference failed") from exc

    # Build response
    recommendations = [
        CareerRecommendation(
            rank=r.rank,
            career=r.career,
            model_probability=r.model_probability,
            interest_score=r.interest_score,
            final_score=r.final_score,
            required_skills=r.required_skills,
            missing_skills=r.missing_skills,
            matching_skills=r.matching_skills,
        )
        for r in raw_results
    ]

    user_skills_normalized = normalize_skills_list(body.skills)
    response = RecommendationResponse(
        recommendations=recommendations,
        user_skills_normalized=user_skills_normalized,
        total_careers_considered=len(raw_results),
    )

    # Persist history — fire-and-forget (Requirement 8.2)
    try:
        history = RecommendationHistory(
            user_id=None,
            input_snapshot=body.model_dump(),
            recommendations_snapshot=response.model_dump(),
        )
        db.add(history)
        db.commit()
    except Exception as db_exc:
        logger.warning("Failed to persist recommendation history: %s", db_exc)
        db.rollback()

    return response


# ---------------------------------------------------------------------------
# Reference data
# ---------------------------------------------------------------------------

@router.get("/careers")
def list_careers(db: Session = Depends(get_db)) -> dict[str, Any]:
    """Return all career names from the database (Requirement 7.1)."""
    careers = db.query(Career.name).all()
    names = [row[0] for row in careers]
    return {"careers": names, "total": len(names)}


@router.get("/skills")
def list_skills(db: Session = Depends(get_db)) -> dict[str, Any]:
    """Return all canonical skill names from the database (Requirement 7.2)."""
    skills = db.query(Skill.name).all()
    names = [row[0] for row in skills]
    return {"skills": names, "total": len(names)}


@router.get("/interests")
def list_interests(db: Session = Depends(get_db)) -> dict[str, Any]:
    """Return all interest names from the database (Requirement 7.3)."""
    interests = db.query(Interest.name).all()
    names = [row[0] for row in interests]
    return {"interests": names, "total": len(names)}
