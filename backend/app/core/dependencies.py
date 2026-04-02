"""
Shared FastAPI dependencies — used across all routers.
"""
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pymongo.database import Database
from jose import jwt, JWTError
from bson.objectid import ObjectId

from app.db.database import get_db
from app.core.config import get_settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Database = Depends(get_db),
) -> dict:
    """
    Decode JWT token and return the full user document from MongoDB.
    Raises 401 if token is invalid or user is not found.
    """
    settings = get_settings()
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

    user = db.users.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


async def get_current_user_id(
    token: str = Depends(oauth2_scheme),
) -> str:
    """
    Lightweight version — returns only the user ID string from the JWT.
    Use when you don't need the full user document.
    """
    settings = get_settings()
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
