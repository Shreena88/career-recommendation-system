"""
Pydantic schemas for user and profile creation.
"""

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    username: str
    email: EmailStr


class UserProfileCreate(BaseModel):
    user_id: int
    education: str
    course: str
    specialization: str


class SkillCreate(BaseModel):
    name: str


class InterestCreate(BaseModel):
    name: str
