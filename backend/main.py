"""
FastAPI application entry point.

Startup sequence
----------------
1. Load ML artifacts via MLPredictor.load_artifacts() — fail fast on missing files.
2. Load career skills KB via SkillGapService.load_career_skills().
3. Load interest map via RecommenderService.load_interest_map().
4. Attach the fully-initialised RecommenderService to app.state for use by routes.

Run with:
    uvicorn backend.main:app --reload
"""

import logging
import os

from contextlib import asynccontextmanager
from fastapi import FastAPI

from backend.config import get_settings
from backend.routes import recommendations, users
from backend.services.predictor import MLPredictor
from backend.services.recommender import RecommenderService
from backend.services.skill_gap import SkillGapService

logger = logging.getLogger(__name__)
settings = get_settings()

# Resolve artifact paths relative to the project root
_HERE = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.abspath(os.path.join(_HERE, ".."))

MODEL_DIR = os.path.join(_PROJECT_ROOT, settings.MODEL_DIR)
CAREER_SKILLS_PATH = os.path.join(_PROJECT_ROOT, "data", "processed", "career_skills.json")
INTEREST_MAP_PATH = os.path.join(_PROJECT_ROOT, "data", "processed", "career_interest_mapping.json")


# ---------------------------------------------------------------------------
# Lifespan — startup / shutdown
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load all ML artifacts and services at startup (Requirements 3.1, 3.2)."""
    logger.info("Loading ML artifacts from %s ...", MODEL_DIR)

    predictor = MLPredictor(model_dir=MODEL_DIR)
    predictor.load_artifacts()          # raises FileNotFoundError if missing
    logger.info("ML model loaded successfully.")

    skill_gap = SkillGapService(career_skills_path=CAREER_SKILLS_PATH)
    skill_gap.load_career_skills()
    logger.info("Career skills knowledge base loaded.")

    recommender = RecommenderService(
        predictor=predictor,
        skill_gap=skill_gap,
        interest_map_path=INTEREST_MAP_PATH,
    )
    recommender.load_interest_map()
    logger.info("Interest map loaded.")

    app.state.recommender = recommender

    yield

    # Shutdown — nothing to clean up
    logger.info("Application shutting down.")


# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Career Recommendation API",
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

app.include_router(recommendations.router)
app.include_router(users.router)
