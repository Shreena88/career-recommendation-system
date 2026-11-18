from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/career_db"
    MODEL_DIR: str = "models/"
    APP_VERSION: str = "1.0.0"
    JWT_SECRET_KEY: str = "CHANGE_ME_TO_A_STRONG_RANDOM_SECRET"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
