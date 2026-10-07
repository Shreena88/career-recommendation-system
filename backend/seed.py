"""
Seed script: creates all tables and populates reference data from processed JSON artifacts.
Run from the AI-Career-Recommendation directory:
    python -m backend.seed
"""

import json
import logging
import os

from sqlalchemy.dialects.postgresql import insert as pg_insert

from backend.database import Base, SessionLocal, engine
from backend.models.database_models import Career, CareerSkill, Interest, Skill

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

# Paths to processed knowledge-base artifacts (relative to project root)
CAREER_SKILLS_PATH = os.path.join(
    os.path.dirname(__file__), "..", "data", "processed", "career_skills.json"
)
INTEREST_MAP_PATH = os.path.join(
    os.path.dirname(__file__), "..", "data", "processed", "career_interest_mapping.json"
)


def _load_json(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def create_tables() -> None:
    log.info("Creating database tables…")
    Base.metadata.create_all(bind=engine)
    log.info("Tables created (or already exist).")


def seed_careers_and_skills(session, career_skills: dict) -> dict[str, int]:
    """
    Seed `careers` and `skills` tables, then populate `career_skills` join table.
    Returns a mapping of career_name → career.id.
    """
    # --- Collect all unique skills across every career ---
    all_skills: set[str] = set()
    for skills_list in career_skills.values():
        all_skills.update(skills_list)

    # --- Upsert skills (INSERT … ON CONFLICT DO NOTHING) ---
    log.info("Seeding %d unique skills…", len(all_skills))
    for skill_name in sorted(all_skills):
        stmt = (
            pg_insert(Skill)
            .values(name=skill_name, normalized_name=skill_name.lower())
            .on_conflict_do_nothing(index_elements=["name"])
        )
        session.execute(stmt)
    session.flush()

    # Build skill-name → id lookup
    skill_rows = session.query(Skill).all()
    skill_id_map: dict[str, int] = {s.name: s.id for s in skill_rows}

    # --- Upsert careers ---
    log.info("Seeding %d careers…", len(career_skills))
    career_id_map: dict[str, int] = {}
    for career_name in career_skills:
        stmt = (
            pg_insert(Career)
            .values(name=career_name, normalized_name=career_name.lower())
            .on_conflict_do_nothing(index_elements=["name"])
        )
        session.execute(stmt)
    session.flush()

    career_rows = session.query(Career).all()
    career_id_map = {c.name: c.id for c in career_rows}

    # --- Upsert career_skills join rows ---
    log.info("Seeding career_skills join table…")
    for career_name, skills_list in career_skills.items():
        career_id = career_id_map.get(career_name)
        if career_id is None:
            continue
        for skill_name in skills_list:
            skill_id = skill_id_map.get(skill_name)
            if skill_id is None:
                continue
            stmt = (
                pg_insert(CareerSkill)
                .values(career_id=career_id, skill_id=skill_id, is_required=True)
                .on_conflict_do_nothing(
                    index_elements=["career_id", "skill_id"]
                )
            )
            session.execute(stmt)

    return career_id_map


def seed_interests(session, interest_map: dict) -> None:
    """Seed `interests` table from all unique interests in career_interest_mapping.json."""
    all_interests: set[str] = set()
    for key, value in interest_map.items():
        if key == "_metadata":
            continue
        all_interests.update(value.keys())

    log.info("Seeding %d unique interests…", len(all_interests))
    for interest_name in sorted(all_interests):
        stmt = (
            pg_insert(Interest)
            .values(name=interest_name)
            .on_conflict_do_nothing(index_elements=["name"])
        )
        session.execute(stmt)


def run_seed() -> None:
    career_skills = _load_json(CAREER_SKILLS_PATH)
    interest_map = _load_json(INTEREST_MAP_PATH)

    create_tables()

    session = SessionLocal()
    try:
        seed_careers_and_skills(session, career_skills)
        seed_interests(session, interest_map)
        session.commit()
        log.info("Seed completed successfully.")
    except Exception:
        session.rollback()
        log.exception("Seed failed — transaction rolled back.")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    run_seed()
