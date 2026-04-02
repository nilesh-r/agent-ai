"""
MongoDB database connection module.
"""
from pymongo import MongoClient
from app.core.config import get_settings


def get_db():
    """FastAPI dependency yielding the MongoDB database instance."""
    settings = get_settings()
    client = MongoClient(settings.DATABASE_URL)
    db = client.get_database(settings.DATABASE_NAME)
    yield db
