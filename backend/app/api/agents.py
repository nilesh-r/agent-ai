"""
Agent API routes — jobs, emails, profile, pipeline status, logs, code analysis.
"""
import logging
from datetime import datetime
from typing import List, Optional, Any

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pymongo.database import Database
from bson.objectid import ObjectId
from pydantic import BaseModel

from app.db.database import get_db
from app.core.dependencies import get_current_user_id
from app.workers.tasks import run_agent_workflow

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Request Models ───────────────────────────────────────────


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    skills: Optional[str] = None
    roles: Optional[str] = None
    salary: Optional[str] = None
    resume_text: Optional[str] = None


class RepoUrl(BaseModel):
    url: str


# ── Pipeline State ───────────────────────────────────────────

PIPELINE_NODES = ["job", "matching", "hr", "email", "code"]


# ── Helpers ──────────────────────────────────────────────────


def serialize_mongo(cursor) -> list:
    """Convert MongoDB cursor to a list of JSON-safe dicts."""
    results = []
    for doc in cursor:
        doc["id"] = str(doc.pop("_id", ""))
        for k, v in doc.items():
            if isinstance(v, ObjectId):
                doc[k] = str(v)
        results.append(doc)
    return results


def write_log(db: Database, level: str, message: str) -> None:
    """Persist an activity log entry to MongoDB."""
    db.activity_logs.insert_one({
        "time": datetime.utcnow().strftime("%H:%M:%S"),
        "level": level,
        "message": message,
        "created_at": datetime.utcnow(),
    })


# ── Agent Trigger ────────────────────────────────────────────


@router.post("/run-agent")
def trigger_agent_workflow(
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user_id),
    db: Database = Depends(get_db),
):
    """Start the full agent pipeline in the background."""
    write_log(db, "RUNNING", f"Agent pipeline triggered by user {user_id}")
    
    # Initialize/Reset nodes in MongoDB
    node_names = {
        "job": "Job Discovery",
        "matching": "Profile Matching", 
        "hr": "HR Contact Parsing",
        "email": "Outreach Generation",
        "code": "Code Analysis Agent"
    }
    
    for node_id in PIPELINE_NODES:
        db.pipeline_status.update_one(
            {"id": node_id},
            {"$set": {
                "name": node_names[node_id],
                "status": "idle",
                "latency": "0ms",
                "updated_at": datetime.utcnow()
            }},
            upsert=True
        )

    background_tasks.add_task(run_agent_workflow, user_id)
    return {"message": "Agent workflow started in background", "user_id": user_id}


# ── Jobs ─────────────────────────────────────────────────────


@router.get("/jobs")
def get_jobs(skip: int = 0, limit: int = 100, db: Database = Depends(get_db)):
    """List all discovered jobs."""
    jobs = db.jobs.find().sort("created_at", -1).skip(skip).limit(limit)
    return serialize_mongo(jobs)


# ── Emails ───────────────────────────────────────────────────


@router.get("/emails")
def get_emails(skip: int = 0, limit: int = 100, db: Database = Depends(get_db)):
    """List all generated outreach emails."""
    emails = db.emails.find().sort("created_at", -1).skip(skip).limit(limit)
    return serialize_mongo(emails)


@router.post("/send-email/{email_id}")
def send_email(email_id: str, db: Database = Depends(get_db)):
    """Mark an email as sent."""
    result = db.emails.update_one(
        {"_id": ObjectId(email_id)}, {"$set": {"status": "sent"}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Email not found")
    write_log(db, "SUCCESS", f"Email {email_id} marked as sent")
    return {"message": "Email sent successfully"}


# ── Stats ────────────────────────────────────────────────────


@router.get("/stats")
def get_stats(db: Database = Depends(get_db)):
    """Return real-time dashboard statistics computed from database."""
    jobs_count = db.jobs.count_documents({})
    emails_total = db.emails.count_documents({})
    emails_sent = db.emails.count_documents({"status": "sent"})

    # Compute real response rate
    response_rate = round((emails_sent / emails_total * 100), 1) if emails_total > 0 else 0.0

    # Compute real average match score from applications
    pipeline = [{"$group": {"_id": None, "avg": {"$avg": "$match_score"}}}]
    avg_result = list(db.applications.aggregate(pipeline))
    avg_match = round(avg_result[0]["avg"], 1) if avg_result and avg_result[0].get("avg") else 0.0

    return {
        "jobsFound": jobs_count,
        "emailsSent": emails_sent,
        "responseRate": response_rate,
        "avgMatch": avg_match,
    }


# ── Pipeline Status ──────────────────────────────────────────


@router.get("/pipeline-status")
def get_pipeline_status(db: Database = Depends(get_db)):
    """Return the current pipeline node statuses from MongoDB."""
    nodes = list(db.pipeline_status.find({}, {"_id": 0}))
    if not nodes:
        # Fallback if empty
        return [
            {"id": "job", "name": "Job Discovery", "status": "idle", "latency": "0ms"},
            {"id": "matching", "name": "Profile Matching", "status": "idle", "latency": "0ms"},
            {"id": "hr", "name": "HR Contact Parsing", "status": "idle", "latency": "0ms"},
            {"id": "email", "name": "Outreach Generation", "status": "idle", "latency": "0ms"},
            {"id": "code", "name": "Code Analysis Agent", "status": "idle", "latency": "0ms"},
        ]
    return nodes


# ── Activity Logs ────────────────────────────────────────────


@router.get("/logs")
def get_logs(limit: int = 100, db: Database = Depends(get_db)):
    """Return recent activity logs from MongoDB."""
    logs = db.activity_logs.find().sort("created_at", -1).limit(limit)
    return serialize_mongo(logs)


# ── Profile ──────────────────────────────────────────────────


@router.get("/profile")
def get_profile(
    user_id: str = Depends(get_current_user_id),
    db: Database = Depends(get_db),
):
    """Get the authenticated user's profile."""
    profile = db.profiles.find_one({"user_id": user_id})
    if not profile:
        return {"name": "User", "title": "New Member", "skills": "", "roles": ""}
    profile["id"] = str(profile.pop("_id"))
    return profile


@router.put("/profile")
def update_profile(
    profile_update: ProfileUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Database = Depends(get_db),
):
    """Update the authenticated user's profile."""
    update_data = profile_update.model_dump(exclude_unset=True)
    db.profiles.update_one({"user_id": user_id}, {"$set": update_data}, upsert=True)
    logger.info(f"Profile updated for user {user_id}")
    return get_profile(user_id, db)


# ── Code Analysis ────────────────────────────────────────────


@router.post("/analyze-repo")
def analyze_repo(payload: RepoUrl):
    """Analyze a GitHub repository using the Code AI agent."""
    from app.agents.code_agent import analyze_github_repo

    result = analyze_github_repo(payload.url)
    return result


# ── Settings / Integration Status ────────────────────────────


@router.get("/settings/status")
def get_integration_status():
    """Return which external API integrations are configured."""
    from app.core.config import get_settings

    s = get_settings()
    return {
        "gemini": bool(s.GEMINI_API_KEY),
        "google_oauth": bool(s.GOOGLE_CLIENT_ID and s.GOOGLE_CLIENT_SECRET),
        "github": bool(s.GITHUB_TOKEN),
        "hunter": bool(s.HUNTER_API_KEY),
        "adzuna": bool(s.ADZUNA_APP_ID and s.ADZUNA_API_KEY),
        "mongodb": bool(s.DATABASE_URL),
        "redis": bool(s.CELERY_BROKER_URL),
    }
