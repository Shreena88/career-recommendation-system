"""
RecommenderService — combines ML probabilities with interest-based
personalization to produce a ranked top-5 career recommendation list.

Depends on:
  - MLPredictor  (services/predictor.py)
  - SkillGapService (services/skill_gap.py)
  - career_interest_mapping.json (built from Dataset 1)
"""

import json
import os
import sys
from dataclasses import dataclass, field

# Ensure project root is on sys.path.
_HERE = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.abspath(os.path.join(_HERE, "..", ".."))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from backend.services.predictor import MLPredictor
from backend.services.skill_gap import SkillGapService


# ---------------------------------------------------------------------------
# Output dataclass
# ---------------------------------------------------------------------------

@dataclass
class CareerRecommendation:
    """A single ranked career recommendation with scores and skill gap."""
    rank: int
    career: str
    model_probability: float
    interest_score: float
    final_score: float
    required_skills: list[str] = field(default_factory=list)
    missing_skills: list[str] = field(default_factory=list)
    matching_skills: list[str] = field(default_factory=list)


# ---------------------------------------------------------------------------
# RecommenderService
# ---------------------------------------------------------------------------

class RecommenderService:
    """
    Combines ML probability and interest-map score into a ranked top-5 list.

    Parameters
    ----------
    predictor : MLPredictor
        A loaded MLPredictor instance.
    skill_gap : SkillGapService
        A loaded SkillGapService instance.
    interest_map_path : str
        Path to ``career_interest_mapping.json``.
    """

    def __init__(
        self,
        predictor: MLPredictor,
        skill_gap: SkillGapService,
        interest_map_path: str,
    ) -> None:
        self._predictor = predictor
        self._skill_gap = skill_gap
        self.interest_map_path = interest_map_path
        self._map: dict[str, dict[str, float]] = {}

    # ------------------------------------------------------------------
    # Artifact loading
    # ------------------------------------------------------------------

    def load_interest_map(self) -> None:
        """
        Load career_interest_mapping.json into ``self._map``.

        Raises
        ------
        FileNotFoundError
            If the interest map file cannot be found.
        """
        if not os.path.exists(self.interest_map_path):
            raise FileNotFoundError(
                f"Interest map not found: {self.interest_map_path}"
            )
        with open(self.interest_map_path, "r", encoding="utf-8") as f:
            self._map = json.load(f)

    # ------------------------------------------------------------------
    # Scoring helpers
    # ------------------------------------------------------------------

    def compute_interest_score(self, career: str, user_interests: list[str]) -> float:
        """
        Compute interest compatibility for a career.

        Returns 0.0 if the career is not in the interest map (Requirement 4.2).
        Sums the weights for each user interest that appears in the map entry
        for the career, then clamps the result to [0.0, 1.0].

        Parameters
        ----------
        career : str
        user_interests : list[str]

        Returns
        -------
        float
            Value in [0.0, 1.0] (Requirement 4.1 / Property 8).
        """
        if career not in self._map:
            return 0.0
        career_map = self._map[career]
        score = sum(career_map.get(interest, 0.0) for interest in user_interests)
        return min(max(score, 0.0), 1.0)

    def compute_final_score(self, model_prob: float, interest_score: float) -> float:
        """
        Compute the weighted final score.

        final_score = (model_prob × 0.70) + (interest_score × 0.30)

        (Requirement 4.3 / Property 9)
        """
        return (model_prob * 0.70) + (interest_score * 0.30)

    # ------------------------------------------------------------------
    # Main recommendation entry point
    # ------------------------------------------------------------------

    def get_recommendations(
        self,
        education: str,
        course: str,
        specialization: str,
        skills: list[str],
        interests: list[str],
    ) -> list[CareerRecommendation]:
        """
        Return top-5 career recommendations sorted by final_score descending.

        Steps
        -----
        1. Get top-10 ML predictions via predict_top_k.
        2. For each candidate career compute interest_score and final_score.
        3. Run skill-gap analysis per career.
        4. Sort by final_score descending and return top 5.

        Postcondition
        -------------
        len(result) <= 5 and final_scores are non-increasing (Property 10,
        Requirement 4.5).

        Parameters
        ----------
        education : str
        course : str
            Stored in recommendation context; not used as an ML feature
            (the ML pipeline uses Education Level + Specialization + Skills).
        specialization : str
        skills : list[str]
        interests : list[str]

        Returns
        -------
        list[CareerRecommendation]
        """
        # Step 1: ML top-10 predictions
        ml_results = self._predictor.predict_top_k(
            education=education,
            specialization=specialization,
            skills=skills,
            k=10,
        )

        # Step 2: score and rank
        candidates = []
        for career, model_prob in ml_results:
            interest_score = self.compute_interest_score(career, interests)
            final_score = self.compute_final_score(model_prob, interest_score)
            candidates.append((career, model_prob, interest_score, final_score))

        candidates.sort(key=lambda x: x[3], reverse=True)
        top5 = candidates[:5]

        # Step 3: skill-gap analysis + build output
        recommendations = []
        for rank, (career, model_prob, interest_score, final_score) in enumerate(top5, start=1):
            gap = self._skill_gap.analyze(career, skills)
            recommendations.append(CareerRecommendation(
                rank=rank,
                career=career,
                model_probability=model_prob,
                interest_score=interest_score,
                final_score=final_score,
                required_skills=gap.required_skills,
                missing_skills=gap.missing_skills,
                matching_skills=gap.matching_skills,
            ))

        return recommendations
