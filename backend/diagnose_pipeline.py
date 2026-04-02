"""
Full diagnostic test of the AI agent pipeline.
Run this from the backend directory:
  python diagnose_pipeline.py
"""
import sys, os, traceback

print("=" * 60)
print("SOVEREIGN AI - PIPELINE DIAGNOSTIC")
print("=" * 60)

# ── 1. Settings & DB ──────────────────────────────────────────
print("\n[1] Checking settings and DB connection...")
try:
    from app.core.config import get_settings
    s = get_settings()
    print(f"  DATABASE_URL:     {'OK' if s.DATABASE_URL else 'MISSING'}")
    print(f"  DATABASE_NAME:    {s.DATABASE_NAME}")
    print(f"  GEMINI_API_KEY:   {'OK' if s.GEMINI_API_KEY else 'MISSING'}")
    print(f"  ADZUNA_APP_ID:    {'OK' if s.ADZUNA_APP_ID else 'MISSING'}")
    print(f"  ADZUNA_API_KEY:   {'OK' if s.ADZUNA_API_KEY else 'MISSING'}")
    print(f"  HUNTER_API_KEY:   {'OK' if s.HUNTER_API_KEY else 'MISSING'}")
except Exception as e:
    print(f"  FAILED: {e}")
    sys.exit(1)

print("\n[2] Connecting to MongoDB...")
try:
    from pymongo import MongoClient
    client = MongoClient(s.DATABASE_URL, serverSelectionTimeoutMS=5000)
    db = client.get_database(s.DATABASE_NAME)
    client.admin.command('ping')
    print(f"  Connected. Users: {db.users.count_documents({})}, Profiles: {db.profiles.count_documents({})}")
    user = db.users.find_one()
    if not user:
        print("  ERROR: No users in DB! Run the app, register a user, then re-run.")
        sys.exit(1)
    profile = db.profiles.find_one({"user_id": str(user["_id"])})
    print(f"  User: {user.get('email')}")
    print(f"  Profile: title={profile.get('title') if profile else 'NO PROFILE'}, skills={str((profile.get('skills') if profile else ''))[:40]}")
except Exception as e:
    print(f"  FAILED: {e}")
    traceback.print_exc()
    sys.exit(1)

profile_data = {
    "name": user.get("name") or "User",
    "title": (profile.get("title") if profile else None) or "Python Developer",
    "skills": (profile.get("skills") if profile else None) or "Python, FastAPI, MongoDB",
    "roles": (profile.get("roles") if profile else None) or ["Software Engineer"],
}
print(f"\n  Using profile_data: {profile_data}")

# ── 3. Job Fetching (Adzuna) ──────────────────────────────────
print("\n[3] Testing Job Discovery (Adzuna)...")
try:
    from app.agents.job_agent import fetch_jobs
    jobs = fetch_jobs(profile_data)
    print(f"  Found {len(jobs)} jobs")
    if jobs:
        print(f"  Sample: {jobs[0].get('title')} @ {jobs[0].get('company')}")
    else:
        print("  WARNING: No jobs returned!")
except Exception as e:
    print(f"  FAILED: {e}")
    traceback.print_exc()
    jobs = []

# ── 4. Semantic Matching (Gemini) ─────────────────────────────
print("\n[4] Testing Semantic Matching (Gemini)...")
try:
    from app.agents.matching_agent import filter_and_match_jobs, compute_match_score
    score = compute_match_score("Python developer with MongoDB experience", "Looking for a Python backend engineer")
    print(f"  Embedding test score: {score}")
    if jobs:
        matched = filter_and_match_jobs(jobs[:3], profile_data)
        print(f"  Matched {len(matched)} jobs, top score: {matched[0]['score'] if matched else 'N/A'}")
except Exception as e:
    print(f"  FAILED: {e}")
    traceback.print_exc()

# ── 5. HR Contact (Hunter.io) ─────────────────────────────────
print("\n[5] Testing HR Contact Discovery (Hunter.io)...")
try:
    from app.agents.hr_agent import find_recruiter_email
    email = find_recruiter_email("Google")
    print(f"  HR Email for Google: {email}")
except Exception as e:
    print(f"  FAILED: {e}")
    traceback.print_exc()

# ── 6. Email Generation (Gemini) ─────────────────────────────
print("\n[6] Testing Email Generation (Gemini)...")
try:
    from app.agents.email_agent import generate_personalized_email
    sample_job = jobs[0] if jobs else {"title": "Engineer", "description": "Build great things"}
    draft = generate_personalized_email(profile_data, sample_job, sample_job.get("company", "Acme"))
    print(f"  Email draft (first 200 chars): {draft[:200]}...")
except Exception as e:
    print(f"  FAILED: {e}")
    traceback.print_exc()

print("\n" + "=" * 60)
print("DIAGNOSTIC COMPLETE")
print("=" * 60)
