"""
API integration tests — Properties 13–15, 17.

Strategy
--------
* Load ML artifacts once at module level into a real RecommenderService.
* Inject that service into app.state BEFORE creating the TestClient so the
  lifespan's artifact-loading step is effectively replaced by the pre-built
  service (the lifespan will still run but its loaded objects are overwritten
  by our fixture before any test fires).
* Use a single module-level TestClient (context manager entered once) shared
  across all tests so the lifespan runs exactly once and the event loop stays
  open throughout the test session.

Properties tested
-----------------
Property 13: Valid request always returns 200          (Req 6.1)
Property 14: Invalid request always returns 422        (Req 1.2, 1.3)
Property 15: Response fields always present on success (Req 6.2, 6.3)
Property 17: No PII in API responses                   (Req 12.5)
"""

import os
import sys

_TESTS_DIR = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.abspath(os.path.join(_TESTS_DIR, ".."))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

# Clear lru_cache so Settings picks up patched env vars from conftest.py
from backend.config import get_settings
get_settings.cache_clear()

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
from hypothesis import given, settings as hyp_settings, HealthCheck
import hypothesis.strategies as st

# ---------------------------------------------------------------------------
# Patch backend.database to use in-memory SQLite before importing the app
# ---------------------------------------------------------------------------
import backend.database as _db_module

_TEST_DB_URL = "sqlite://"
_sqlite_engine = create_engine(
    _TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
_TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=_sqlite_engine
)
_db_module.engine = _sqlite_engine
_db_module.SessionLocal = _TestingSessionLocal


def _get_test_db():
    db = _TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


from backend.database import Base, get_db
from backend.main import app, MODEL_DIR, CAREER_SKILLS_PATH, INTEREST_MAP_PATH
from backend.services.predictor import MLPredictor
from backend.services.skill_gap import SkillGapService
from backend.services.recommender import RecommenderService

Base.metadata.create_all(bind=_sqlite_engine)
app.dependency_overrides[get_db] = _get_test_db

# ---------------------------------------------------------------------------
# Load ML artifacts once at module level
# ---------------------------------------------------------------------------
_predictor = MLPredictor(model_dir=MODEL_DIR)
_predictor.load_artifacts()

_skill_gap = SkillGapService(career_skills_path=CAREER_SKILLS_PATH)
_skill_gap.load_career_skills()

_recommender = RecommenderService(
    predictor=_predictor,
    skill_gap=_skill_gap,
    interest_map_path=INTEREST_MAP_PATH,
)
_recommender.load_interest_map()

# Inject into app.state before TestClient starts so the lifespan's own loading
# is overwritten by our pre-built instance.
app.state.recommender = _recommender

# ---------------------------------------------------------------------------
# Single shared TestClient — enter context manager once for the module
# ---------------------------------------------------------------------------
_ctx = TestClient(app, raise_server_exceptions=True)
_CLIENT = _ctx.__enter__()
# Overwrite again after lifespan runs, ensuring our pre-built service is used.
app.state.recommender = _recommender

# ---------------------------------------------------------------------------
# Valid input domains
# ---------------------------------------------------------------------------
from utils.preprocessing import SKILL_ALIASES, EDUCATION_NORMALIZATION, SPECIALIZATION_NORMALIZATION

_VALID_EDUCATIONS = list(EDUCATION_NORMALIZATION.keys())
_VALID_SPECIALIZATIONS = list(SPECIALIZATION_NORMALIZATION.keys())
_VALID_SKILLS = list(SKILL_ALIASES.keys())

_VALID_INTERESTS = [
    "Technology", "Data Science", "Software Development", "AI", "Arts",
    "Digital Media", "Healthcare", "Business", "Management", "Electronics",
    "Automation", "Finance", "Analytics", "Marketing", "Communications",
    "Linguistics", "Academia", "Biotech", "Research", "Cybersecurity",
    "Web Development", "Design", "Coding", "Innovation",
]

_PII_KEYS = {"Name", "Age", "CandidateID"}

_RECOMMENDATION_FIELDS = {
    "rank", "career", "model_probability", "interest_score", "final_score",
    "required_skills", "missing_skills", "matching_skills",
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _contains_pii(obj) -> bool:
    """Recursively check whether any dict key in *obj* is a PII field."""
    if isinstance(obj, dict):
        if _PII_KEYS & set(obj.keys()):
            return True
        return any(_contains_pii(v) for v in obj.values())
    if isinstance(obj, list):
        return any(_contains_pii(item) for item in obj)
    return False


def _valid_body(**overrides) -> dict:
    base = {
        "education": "bachelor's",
        "course": "B.Tech",
        "specialization": "computer science",
        "skills": ["python", "sql"],
        "interests": ["Technology"],
    }
    base.update(overrides)
    return base


# ===========================================================================
# Property 13: Valid request always returns 200
# Validates: Requirement 6.1
# ===========================================================================

@given(
    education=st.sampled_from(_VALID_EDUCATIONS),
    specialization=st.sampled_from(_VALID_SPECIALIZATIONS),
    skills=st.lists(
        st.sampled_from(_VALID_SKILLS),
        min_size=1,
        max_size=5,
        unique=True,
    ),
    interests=st.lists(
        st.sampled_from(_VALID_INTERESTS),
        min_size=0,
        max_size=3,
        unique=True,
    ),
)
@hyp_settings(
    max_examples=20,
    suppress_health_check=[HealthCheck.too_slow],
    deadline=None,
)
def test_property13_valid_request_returns_200(
    education, specialization, skills, interests
):
    """Property 13 — Validates: Requirement 6.1"""
    body = {
        "education": education,
        "course": "B.Tech",
        "specialization": specialization,
        "skills": list(skills),
        "interests": list(interests),
    }
    response = _CLIENT.post("/recommend", json=body)
    assert response.status_code == 200, (
        f"Expected 200 for valid body {body!r}, "
        f"got {response.status_code}. Response: {response.text}"
    )


# ===========================================================================
# Property 14: Invalid request always returns 422
# Validates: Requirements 1.2, 1.3
# ===========================================================================

def test_property14_empty_skills_returns_422():
    """Property 14 — empty skills → 422. Validates: Requirements 1.2, 1.3"""
    response = _CLIENT.post("/recommend", json=_valid_body(skills=[]))
    assert response.status_code == 422, (
        f"Expected 422 for empty skills, got {response.status_code}. "
        f"Response: {response.text}"
    )


@given(
    missing_field=st.sampled_from(["education", "course", "specialization", "skills"]),
)
@hyp_settings(max_examples=4, suppress_health_check=[HealthCheck.too_slow], deadline=None)
def test_property14_missing_required_field_returns_422(missing_field):
    """Property 14 — missing required field → 422. Validates: Requirements 1.2, 1.3"""
    body = _valid_body()
    del body[missing_field]
    response = _CLIENT.post("/recommend", json=body)
    assert response.status_code == 422, (
        f"Expected 422 when '{missing_field}' is missing, "
        f"got {response.status_code}. Response: {response.text}"
    )


# ===========================================================================
# Property 15: Response fields always present on success
# Validates: Requirements 6.2, 6.3
# ===========================================================================

@given(
    education=st.sampled_from(_VALID_EDUCATIONS),
    specialization=st.sampled_from(_VALID_SPECIALIZATIONS),
    skills=st.lists(
        st.sampled_from(_VALID_SKILLS),
        min_size=1,
        max_size=5,
        unique=True,
    ),
)
@hyp_settings(
    max_examples=15,
    suppress_health_check=[HealthCheck.too_slow],
    deadline=None,
)
def test_property15_response_fields_present(education, specialization, skills):
    """Property 15 — Validates: Requirements 6.2, 6.3"""
    body = {
        "education": education,
        "course": "B.Tech",
        "specialization": specialization,
        "skills": list(skills),
        "interests": ["Technology"],
    }
    response = _CLIENT.post("/recommend", json=body)
    assert response.status_code == 200, (
        f"Expected 200, got {response.status_code}. Response: {response.text}"
    )
    data = response.json()
    assert "recommendations" in data
    assert "user_skills_normalized" in data
    assert "total_careers_considered" in data
    for i, rec in enumerate(data["recommendations"]):
        missing = _RECOMMENDATION_FIELDS - set(rec.keys())
        assert not missing, f"Recommendation[{i}] missing fields: {missing}"


# ===========================================================================
# Property 17: No PII in API responses
# Validates: Requirement 12.5
# ===========================================================================

def test_property17_no_pii_in_recommend_response():
    """Property 17 — /recommend must not expose PII. Validates: Requirement 12.5"""
    response = _CLIENT.post("/recommend", json=_valid_body())
    assert response.status_code == 200
    assert not _contains_pii(response.json()), "PII found in /recommend response"


def test_property17_no_pii_in_careers_response():
    """Property 17 — /careers must not expose PII. Validates: Requirement 12.5"""
    response = _CLIENT.get("/careers")
    assert response.status_code == 200
    assert not _contains_pii(response.json()), "PII found in /careers response"


def test_property17_no_pii_in_skills_response():
    """Property 17 — /skills must not expose PII. Validates: Requirement 12.5"""
    response = _CLIENT.get("/skills")
    assert response.status_code == 200
    assert not _contains_pii(response.json()), "PII found in /skills response"


def test_property17_no_pii_in_interests_response():
    """Property 17 — /interests must not expose PII. Validates: Requirement 12.5"""
    response = _CLIENT.get("/interests")
    assert response.status_code == 200
    assert not _contains_pii(response.json()), "PII found in /interests response"


def test_property17_no_pii_in_health_response():
    """Property 17 — /health must not expose PII. Validates: Requirement 12.5"""
    response = _CLIENT.get("/health")
    assert response.status_code == 200
    assert not _contains_pii(response.json()), "PII found in /health response"
