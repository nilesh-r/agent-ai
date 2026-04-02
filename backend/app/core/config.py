"""
Centralized application configuration using Pydantic BaseSettings.
All environment variables are loaded and validated here.
"""
import logging
import sys
from typing import Optional
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # ── Database ──
    DATABASE_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "agent_db"

    # ── Security ──
    SECRET_KEY: str = "your-fallback-secret-key-change-it"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # ── Celery / Redis ──
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    # ── Google Gemini ──
    GEMINI_API_KEY: Optional[str] = None

    # ── Google OAuth ──
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/auth/google/callback"

    # ── GitHub ──
    GITHUB_TOKEN: Optional[str] = None

    # ── Hunter.io ──
    HUNTER_API_KEY: Optional[str] = None

    # ── Adzuna Job API ──
    ADZUNA_APP_ID: Optional[str] = None
    ADZUNA_API_KEY: Optional[str] = None
    ADZUNA_COUNTRY: str = "us"

    # ── App ──
    FRONTEND_URL: str = "http://localhost:3000"
    EMAIL_LIMIT_PER_DAY: int = 200
    OAUTHLIB_INSECURE_TRANSPORT: str = "1"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance — loaded once, reused everywhere."""
    return Settings()


def setup_logging() -> None:
    """Configure structured logging for the entire application."""
    log_format = "%(asctime)s │ %(levelname)-8s │ %(name)-25s │ %(message)s"
    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=[logging.StreamHandler(sys.stdout)],
    )
    # Quiet noisy third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("pymongo").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
