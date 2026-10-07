"""
End-to-End Integration Tests — Tasks 14.1 and 14.2.

14.1  Ten fixed Swagger-style scenarios exercising validation, normalization,
      and the full recommendation pipeline via TestClient.
14.2  DB persistence verification: assert a history row is written after each
      valid POST /recommend, and confirm the graceful fallback when the DB
      write raises an exception.

Requirements: 1.2–1.4, 6.1, 8.1–8.3
"""

import os
import sys
from unittest.mock import patch, MagicMock

_TESTS_DIR = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.abspath(os.path.join(_TESTS_DIR, ".."))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

# Clear Settings cache so DATABASE_URL from conftest.py is picked up.
from backend.config import get_settings
get_settings.cache_clear()

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

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
from backend.models.database_models import RecommendationHistory
from backend.services.predictor import MLPredictor
from backend.services.skill_gap import SkillGapService
from backend.services.recommender import RecommenderService

# Create all tables in the in-memory DB.
Base.metadata.create_all(bind=_sqlite_engine)
app.dependency_overrides[get_db] = _get_test_db

# ---------------------------------------------------------------------------
# Load ML artifacts once for the entire module
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

app.state.recommender = _recommender

_ctx = TestClient(app, raise_server_exceptions=True)
_CLIENT = _ctx.__enter__()
app.state.recommender = _recommender  # re-inject after lifespan runs


# ===========================================================================
# Helpers
# ===========================================================================

_RESPONSE_FIELDS = {
    "rank", "career", "model_probability", "interest_score", "final_score",
    "required_skills", "missing_skills", "matching_skills",
}


def _assert_valid_200(response, *, scenario: str) -> dict:
    """Assert HTTP 200 and well-formed RecommendationResponse; return JSON."""
    assert response.status_code == 200, (
        f"[{scenario}] Expected 200, got {response.status_code}. "
        f"Body: {response.text}"
    )
    data = response.json()
    assert "recommendations" in data, f"[{scenario}] Missing 'recommendations'"
    assert "user_skills_normalized" in data, f"[{scenario}] Missing 'user_skills_normalized'"
    assert "total_careers_considered" in data, f"[{scenario}] Missing 'total_careers_considered'"
    for i, rec in enumerate(data["recommendations"]):
        missing = _RESPONSE_FIELDS - set(rec.keys())
        assert not missing, f"[{scenario}] recommendations[{i}] missing fields: {missing}"
    return data


# ===========================================================================
# Task 14.1 — Ten fixed end-to-end scenarios
# ===========================================================================

class TestE2EScenarios:
    """Ten fixed Swagger test cases (Req 1.2–1.4, 6.1)."""

    # 1. CS student — baseline valid request
    def test_01_cs_student_returns_200(self):
        body = {
            "education": "Bachelor's",
            "course": "B.Tech",
            "specialization": "Computer Science",
            "skills": ["Python", "SQL"],
            "interests": ["Technology"],
        }
        response = _CLIENT.post("/recommend", json=body)
        _assert_valid_200(response, scenario="01_cs_student")

    # 2. Commerce student — different domain
    def test_02_commerce_student_returns_200(self):
        body = {
            "education": "Bachelor's",
            "course": "BCom",
            "specialization": "Finance",
            "skills": ["Excel", "Statistics"],
            "interests": ["Finance"],
        }
        response = _CLIENT.post("/recommend", json=body)
        _assert_valid_200(response, scenario="02_commerce_student")

    # 3. Engineering student — Electronics domain
    def test_03_engineering_student_returns_200(self):
        body = {
            "education": "Bachelor's",
            "course": "B.E.",
            "specialization": "Electronics",
            "skills": ["Embedded Systems", "IoT"],
            "interests": ["Automation"],
        }
        response = _CLIENT.post("/recommend", json=body)
        _assert_valid_200(response, scenario="03_engineering_student")

    # 4. Multiple skills — five known canonical skills
    def test_04_multiple_skills_returns_200(self):
        body = {
            "education": "Bachelor's",
            "course": "B.Tech",
            "specialization": "Computer Science",
            "skills": ["Python", "Machine Learning", "TensorFlow", "SQL", "Statistics"],
            "interests": ["Technology"],
        }
        response = _CLIENT.post("/recommend", json=body)
        _assert_valid_200(response, scenario="04_multiple_skills")

    # 5. Multiple interests
    def test_05_multiple_interests_returns_200(self):
        body = {
            "education": "Bachelor's",
            "course": "B.Tech",
            "specialization": "Computer Science",
            "skills": ["Python", "SQL"],
            "interests": ["Technology", "Data Science", "AI"],
        }
        response = _CLIENT.post("/recommend", json=body)
        _assert_valid_200(response, scenario="05_multiple_interests")

    # 6. Unknown skill — should still return 200, not 422 or 500
    def test_06_unknown_skill_returns_200(self):
        body = {
            "education": "Bachelor's",
            "course": "B.Tech",
            "specialization": "Computer Science",
            "skills": ["FakeSkill123"],
            "interests": ["Technology"],
        }
        response = _CLIENT.post("/recommend", json=body)
        _assert_valid_200(response, scenario="06_unknown_skill")

    # 7. Missing required field (specialization) → 422
    def test_07_missing_specialization_returns_422(self):
        body = {
            "education": "Bachelor's",
            "course": "B.Tech",
            # specialization intentionally omitted
            "skills": ["Python"],
            "interests": ["Technology"],
        }
        response = _CLIENT.post("/recommend", json=body)
        assert response.status_code == 422, (
            f"[07_missing_specialization] Expected 422, got {response.status_code}. "
            f"Body: {response.text}"
        )

    # 8. Invalid/unsupported education value → 200 (normalizes gracefully, Req 1.4)
    def test_08_invalid_education_normalizes_gracefully_returns_200(self):
        body = {
            "education": "Diploma",
            "course": "Diploma in CS",
            "specialization": "Computer Science",
            "skills": ["Python", "SQL"],
            "interests": ["Technology"],
        }
        response = _CLIENT.post("/recommend", json=body)
        _assert_valid_200(response, scenario="08_invalid_education")

    # 9. Empty skills list → 422
    def test_09_empty_skills_returns_422(self):
        body = {
            "education": "Bachelor's",
            "course": "B.Tech",
            "specialization": "Computer Science",
            "skills": [],
            "interests": ["Technology"],
        }
        response = _CLIENT.post("/recommend", json=body)
        assert response.status_code == 422, (
            f"[09_empty_skills] Expected 422, got {response.status_code}. "
            f"Body: {response.text}"
        )

    # 10. Empty interests list → 200 (interests is optional for scoring)
    def test_10_empty_interests_returns_200(self):
        body = {
            "education": "Bachelor's",
            "course": "B.Tech",
            "specialization": "Computer Science",
            "skills": ["Python", "SQL"],
            "interests": [],
        }
        response = _CLIENT.post("/recommend", json=body)
        _assert_valid_200(response, scenario="10_empty_interests")


# ===========================================================================
# Task 14.2 — DB persistence and graceful fallback
# ===========================================================================

class TestDBPersistence:
    """Recommendation history persistence (Req 8.1–8.3)."""

    def test_history_row_inserted_after_valid_request(self):
        """
        After a valid POST /recommend, exactly one row must exist in
        recommendation_history with an input_snapshot matching the request.
        (Requirement 8.1, 8.3)
        """
        # Use a fresh DB session for assertion queries
        db = _TestingSessionLocal()
        count_before = db.query(RecommendationHistory).count()
        db.close()

        body = {
            "education": "Master's",
            "course": "M.Tech",
            "specialization": "Data Science",
            "skills": ["Python", "Machine Learning", "SQL"],
            "interests": ["Data Science", "Technology"],
        }
        response = _CLIENT.post("/recommend", json=body)
        assert response.status_code == 200, (
            f"Expected 200, got {response.status_code}. Body: {response.text}"
        )

        db = _TestingSessionLocal()
        count_after = db.query(RecommendationHistory).count()
        assert count_after == count_before + 1, (
            f"Expected one new history row, "
            f"before={count_before} after={count_after}"
        )

        latest = (
            db.query(RecommendationHistory)
            .order_by(RecommendationHistory.id.desc())
            .first()
        )
        db.close()

        assert latest is not None
        snapshot = latest.input_snapshot
        # education is normalized by the Pydantic validator before storage
        assert snapshot["course"] == body["course"]
        assert snapshot["specialization"] == body["specialization"]
        assert snapshot["skills"] == body["skills"]
        assert snapshot["interests"] == body["interests"]
        assert latest.created_at is not None, "created_at must be set"

    def test_db_failure_still_returns_200(self):
        """
        When the DB write raises an exception, the API must still return
        HTTP 200 with a valid recommendation payload. (Requirement 8.2)
        """
        body = {
            "education": "Bachelor's",
            "course": "B.Tech",
            "specialization": "Computer Science",
            "skills": ["Python", "SQL"],
            "interests": ["Technology"],
        }

        # Patch the Session class's commit method to simulate a DB failure.
        # We patch the underlying Session class that sessionmaker produces.
        with patch(
            "sqlalchemy.orm.Session.commit",
            side_effect=Exception("simulated DB failure"),
        ):
            response = _CLIENT.post("/recommend", json=body)

        assert response.status_code == 200, (
            f"Expected 200 even on DB failure, got {response.status_code}. "
            f"Body: {response.text}"
        )
        data = response.json()
        assert "recommendations" in data
        assert len(data["recommendations"]) > 0
