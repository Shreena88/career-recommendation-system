"""
SkillGapService — computes missing and matching skills for a given career.

Loads career_skills.json (built from Dataset 2) and exposes an `analyze`
method that compares a user's skill set against the required skills for
any recommended career.
"""

import json
import os
import sys
from dataclasses import dataclass, field

# Ensure project root is on sys.path for utils imports.
_HERE = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.abspath(os.path.join(_HERE, "..", ".."))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from utils.preprocessing import normalize_skills_list


# ---------------------------------------------------------------------------
# Result dataclass
# ---------------------------------------------------------------------------

@dataclass
class SkillGapResult:
    """Holds the output of SkillGapService.analyze."""
    required_skills: list[str] = field(default_factory=list)
    missing_skills: list[str] = field(default_factory=list)
    matching_skills: list[str] = field(default_factory=list)


# ---------------------------------------------------------------------------
# SkillGapService
# ---------------------------------------------------------------------------

class SkillGapService:
    """
    Computes skill gaps between a user's skills and a career's requirements.

    Parameters
    ----------
    career_skills_path : str
        Path to ``career_skills.json`` — maps career name → list[skill].
    """

    def __init__(self, career_skills_path: str) -> None:
        self.career_skills_path = career_skills_path
        self._kb: dict[str, list[str]] = {}

    # ------------------------------------------------------------------
    # Artifact loading
    # ------------------------------------------------------------------

    def load_career_skills(self) -> None:
        """
        Load career_skills.json into ``self._kb``.

        Raises
        ------
        FileNotFoundError
            If the career_skills.json file cannot be found.
        """
        if not os.path.exists(self.career_skills_path):
            raise FileNotFoundError(
                f"Career skills knowledge base not found: {self.career_skills_path}"
            )
        with open(self.career_skills_path, "r", encoding="utf-8") as f:
            self._kb = json.load(f)

    # ------------------------------------------------------------------
    # Public interface
    # ------------------------------------------------------------------

    def get_required_skills(self, career: str) -> list[str]:
        """
        Return the list of required skills for a career.

        Returns an empty list if the career is not present in the knowledge
        base (Requirement 5.4).
        """
        return self._kb.get(career, [])

    def analyze(self, career: str, user_skills: list[str]) -> SkillGapResult:
        """
        Compute the skill gap for a user relative to a career.

        Parameters
        ----------
        career : str
            The career label to analyze against.
        user_skills : list[str]
            Raw (unnormalized) skill strings provided by the user.

        Returns
        -------
        SkillGapResult
            - ``required_skills``: all skills required for the career.
            - ``missing_skills``: required skills the user does NOT have.
            - ``matching_skills``: required skills the user already has.

        Postcondition
        -------------
        ``set(missing_skills) ∩ set(matching_skills) == set()``
        (Properties 11 and 12, Requirements 5.1–5.3)
        """
        required = set(self.get_required_skills(career))
        normalized_user = set(normalize_skills_list(user_skills))

        matching = sorted(required & normalized_user)
        missing = sorted(required - normalized_user)

        return SkillGapResult(
            required_skills=sorted(required),
            missing_skills=missing,
            matching_skills=matching,
        )
