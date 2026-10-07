"""
Pydantic schemas for career recommendation request and response.
"""

from pydantic import BaseModel, validator
from utils.preprocessing import normalize_education


class RecommendationRequest(BaseModel):
    education: str
    course: str
    specialization: str
    skills: list[str]
    interests: list[str]

    @validator("skills")
    def skills_not_empty(cls, v):
        if not v:
            raise ValueError("skills must not be empty")
        return v

    @validator("education")
    def education_valid(cls, v):
        return normalize_education(v.strip())


class CareerRecommendation(BaseModel):
    rank: int
    career: str
    model_probability: float
    interest_score: float
    final_score: float
    required_skills: list[str]
    missing_skills: list[str]
    matching_skills: list[str]


class RecommendationResponse(BaseModel):
    recommendations: list[CareerRecommendation]
    user_skills_normalized: list[str]
    total_careers_considered: int
