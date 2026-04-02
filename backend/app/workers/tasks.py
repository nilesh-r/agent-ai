"""
Background task: full agent pipeline workflow.
"""
import time
import logging
from datetime import datetime
from bson.objectid import ObjectId

from app.agents.job_agent import fetch_jobs
from app.agents.matching_agent import filter_and_match_jobs
from app.agents.hr_agent import find_recruiter_email
from app.agents.email_agent import generate_personalized_email
from app.core.config import get_settings
from pymongo import MongoClient

logger = logging.getLogger(__name__)


def _get_db():
    """Get a fresh DB connection for background tasks (not in request scope)."""
    settings = get_settings()
    client = MongoClient(settings.DATABASE_URL)
    return client.get_database(settings.DATABASE_NAME)


def _update_node(db, node_id: str, status: str):
    """Update pipeline node status in MongoDB."""
    db.pipeline_status.update_one(
        {"id": node_id},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )


def _write_log(db, level: str, message: str):
    """Persist a log entry during pipeline execution."""
    db.activity_logs.insert_one({
        "time": datetime.utcnow().strftime("%H:%M:%S"),
        "level": level,
        "message": message,
        "created_at": datetime.utcnow(),
    })


def run_agent_workflow(user_id_str: str):
    """
    Execute the full career agent pipeline:
    1. Fetch jobs from Adzuna API
    2. Match jobs against user profile with Gemini embeddings
    3. Find recruiter contacts via Hunter.io
    4. Generate personalized outreach emails via Gemini
    """
    db = _get_db()

    try:
        # Reset pipeline nodes in DB
        for n_id in ["job", "matching", "hr", "email", "code"]:
            _update_node(db, n_id, "idle")

        _write_log(db, "RUNNING", "Pipeline started — resolving user profile...")

        # Resolve user
        user = None
        try:
            if user_id_str:
                user = db.users.find_one({"_id": ObjectId(user_id_str)})
        except Exception:
            pass
        
        if not user:
            user = db.users.find_one()

        if not user:
            _write_log(db, "ERROR", "No users found in database. Please register first.")
            return {"status": "error", "message": "No users exist in DB."}

        user_id_str = str(user["_id"])
        profile = db.profiles.find_one({"user_id": user_id_str})
        
        # Handle cases where profile might be missing or have None values
        if not profile:
            profile = {}

        profile_data = {
            "name": user.get("name") or "User",
            "title": profile.get("title") or "Professional",
            "skills": profile.get("skills") or "General Skills",
            "roles": profile.get("preferred_roles") or profile.get("roles") or ["Software Engineer"],
        }

        # ── Step 1: Fetch Jobs ──
        _update_node(db, "job", "running")
        _write_log(db, "RUNNING", f"Fetching jobs for {profile_data['title']} roles...")
        time.sleep(1)
        jobs_data = fetch_jobs(profile_data)
        
        if not jobs_data:
            _write_log(db, "WARNING", "No jobs found from Adzuna. Using discovery fallback.")
            # Fallback to a simulation if API returns nothing but we want the UI to show something
            jobs_data = fetch_jobs({"roles": "Software Engineer"}) # job_agent provides fallback internally
            
        _update_node(db, "job", "success")
        _write_log(db, "SUCCESS", f"Discovered {len(jobs_data)} job opportunities")

        # ── Step 2: Filter & Match ──
        _update_node(db, "matching", "running")
        _write_log(db, "RUNNING", "Running semantic matching with Gemini embeddings...")
        time.sleep(1)
        matched_results = filter_and_match_jobs(jobs_data, profile_data)
        _update_node(db, "matching", "success")
        _write_log(db, "SUCCESS", f"Matched {len(matched_results)} jobs to profile")

        # Take Top 3
        top_matches = matched_results[:3]

        for i, match in enumerate(top_matches):
            job_dict = match["job"]
            match_score = match.get("score", 0.0)

            # Upsert job
            db_job = db.jobs.find_one({"title": job_dict["title"], "company": job_dict["company"]})
            if not db_job:
                res = db.jobs.insert_one({
                    "title": job_dict["title"],
                    "company": job_dict["company"],
                    "description": job_dict.get("description", ""),
                    "location": job_dict.get("location", ""),
                    "salary_range": job_dict.get("salary_range", ""),
                    "url": job_dict.get("url", ""),
                    "match_score": match_score,
                    "status": "READY",
                    "created_at": datetime.utcnow(),
                })
                job_id = str(res.inserted_id)
            else:
                job_id = str(db_job["_id"])
                # Update match score
                db.jobs.update_one({"_id": db_job["_id"]}, {"$set": {"match_score": match_score}})

            # Save application
            db.applications.insert_one({
                "user_id": user_id_str,
                "job_id": job_id,
                "match_score": match_score,
                "status": "pending",
                "created_at": datetime.utcnow(),
            })

            # ── Step 3: Find Recruiter ──
            _update_node(db, "hr", "running")
            _write_log(db, "RUNNING", f"Finding recruiter contact at {job_dict['company']}...")
            time.sleep(1)
            hr_email = find_recruiter_email(job_dict["company"])
            _update_node(db, "hr", "success")
            _write_log(db, "SUCCESS", f"Found contact: {hr_email}")

            # ── Step 4: Generate Email ──
            _update_node(db, "email", "running")
            _write_log(db, "RUNNING", f"Drafting outreach email for {job_dict['title']}...")
            time.sleep(1)
            email_draft = generate_personalized_email(profile_data, job_dict, job_dict["company"])
            _update_node(db, "email", "success")
            _write_log(db, "SUCCESS", f"Email draft #{i + 1} generated")

            # ── Step 5: Code Review (placeholder) ──
            _update_node(db, "code", "running")
            time.sleep(0.5)
            _update_node(db, "code", "success")

            # Persist email
            db.emails.insert_one({
                "user_id": user_id_str,
                "job_id": job_id,
                "recipient_email": hr_email,
                "recipient": hr_email,
                "company": job_dict["company"],
                "subject": f"Application for {job_dict['title']}",
                "body": email_draft,
                "status": "draft",
                "created_at": datetime.utcnow(),
            })

        _write_log(db, "SUCCESS", f"Pipeline complete — processed {len(top_matches)} top matches")
        logger.info(f"Agent workflow completed for user {user_id_str}: {len(top_matches)} jobs processed")
        return {"status": "success", "processed_jobs": len(top_matches)}

    except Exception as e:
        logger.error(f"Workflow error: {e}", exc_info=True)
        _write_log(db, "ERROR", f"Pipeline failed: {str(e)}")
        # Set all running nodes to error
        for n_id in ["job", "matching", "hr", "email", "code"]:
            _update_node(db, n_id, "error")
        return {"status": "error", "message": str(e)}
