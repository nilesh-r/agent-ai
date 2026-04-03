"""
Authentication routes — local email/password + Google OAuth.
"""
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from pymongo.database import Database

from app.db.database import get_db
from app.schemas.user import UserCreate, UserResponse, UserLogin, Token
from app.core.security import verify_password, create_access_token, get_password_hash
from app.core.config import get_settings
from app.core.dependencies import get_current_user

# ── Google OAuth Bootstrap ───────────────────────────────────
from app.core.config import get_settings
settings = get_settings()

if settings.is_localhost:
    import os
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

import requests as req
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Google OAuth ─────────────────────────────────────────────


@router.get("/google/login")
async def google_login():
    """Redirect user to Google consent screen."""
    settings = get_settings()
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")

    from urllib.parse import urlencode

    scopes = [
        "openid",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
    ]
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": " ".join(scopes),
        "prompt": "select_account",
        "access_type": "offline",
    }
    authorization_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return RedirectResponse(url=authorization_url)


@router.get("/google/callback")
async def google_callback(request: Request, db: Database = Depends(get_db)):
    """Handle the Google OAuth callback, create/update user, set JWT cookie."""
    settings = get_settings()
    code = request.query_params.get("code")

    if not code:
        raise HTTPException(status_code=400, detail="Authorization code missing")

    # Exchange code for tokens
    try:
        import requests as req
        token_response = req.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
            timeout=15,
        )
        token_res_data = token_response.json()
        if "error" in token_res_data:
            raise Exception(token_res_data.get("error_description", token_res_data["error"]))
        id_token_str = token_res_data["id_token"]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google token exchange failed: {e}")
        raise HTTPException(status_code=400, detail=f"Token exchange failed: {e}")

    # Verify ID token
    try:
        info = id_token.verify_oauth2_token(
            id_token_str,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=30,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Token verification failed: {e}")

    email = info["email"]
    name = info.get("name", email.split("@")[0])

    # Upsert user
    user = db.users.find_one({"email": email})
    if not user:
        new_user = {
            "email": email,
            "name": name,
            "hashed_password": None,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "google_id": info["sub"],
        }
        result = db.users.insert_one(new_user)
        user_id = str(result.inserted_id)

        db.profiles.insert_one({
            "user_id": user_id,
            "phone": None,
            "skills": [],
            "preferred_roles": [],
            "github_link": None,
            "linkedin_link": None,
        })
        logger.info(f"New Google user created: {email}")
    else:
        user_id = str(user["_id"])
        if "google_id" not in user:
            db.users.update_one({"_id": user["_id"]}, {"$set": {"google_id": info["sub"]}})

    # Generate JWT & redirect
    access_token = create_access_token(subject=user_id)
    response = RedirectResponse(url=f"{settings.FRONTEND_URL}/")
    response.set_cookie(
        key="auth-token",
        value=access_token,
        max_age=1800,
        samesite="lax",  # Fixed: Allowed during top-level cross-site redirect
        secure=settings.is_production,  # Fixed: Must be True for HTTPS/Prod
        httponly=False,  # Fixed: Allow client-side dashboard/middleware to read
    )
    return response


# ── Local Auth ───────────────────────────────────────────────


@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Database = Depends(get_db)):
    """Register a new user with email and password."""
    if db.users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = {
        "email": user.email,
        "name": user.name,
        "hashed_password": get_password_hash(user.password),
        "is_active": True,
        "created_at": datetime.utcnow(),
    }
    result = db.users.insert_one(new_user)
    user_id = str(result.inserted_id)

    db.profiles.insert_one({
        "user_id": user_id,
        "phone": None,
        "skills": [],
        "preferred_roles": [],
        "github_link": None,
        "linkedin_link": None,
    })

    logger.info(f"New user registered: {user.email}")
    return {"id": user_id, "email": new_user["email"], "name": new_user["name"]}


@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Database = Depends(get_db)):
    """Authenticate with email and password, return JWT."""
    user = db.users.find_one({"email": user_data.email})
    if not user or not user.get("hashed_password"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not verify_password(user_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=str(user["_id"]))
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def get_me(user: dict = Depends(get_current_user)):
    """Return the currently authenticated user."""
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user["name"],
    }
