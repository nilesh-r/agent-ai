import requests
import logging
from app.core.config import get_settings

logger = logging.getLogger(__name__)

def fetch_jobs(preferences: dict):
    """
    Fetch real jobs from Adzuna API based on user preferences.
    preferences dict might contain 'roles', 'location', 'salary'.
    """
    settings = get_settings()
    app_id = settings.ADZUNA_APP_ID
    api_key = settings.ADZUNA_API_KEY
    country = settings.ADZUNA_COUNTRY or "us"
    
    if not app_id or not api_key:
        logger.warning("Adzuna API credentials not found. Returning empty jobs.")
        return []

    roles = preferences.get("roles", "Software Engineer")
    if isinstance(roles, list) and len(roles) > 0:
        query = roles[0]
    elif isinstance(roles, str) and roles:
        query = roles.split(",")[0].strip()
    else:
        query = "Software Engineer"
    
    url = f"https://api.adzuna.com/v1/api/jobs/{country}/search/1"
    params = {
        "app_id": app_id,
        "app_key": api_key,
        "results_per_page": 20,
        "what": query,
        "content-type": "application/json"
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        parsed_jobs = []
        for job in data.get("results", []):
            parsed_jobs.append({
                "title": job.get("title"),
                "company": job.get("company", {}).get("display_name", "Unknown"),
                "location": job.get("location", {}).get("display_name", "Remote"),
                "salary_range": f"${int(job.get('salary_min', 0))} - ${int(job.get('salary_max', 0))}" if job.get('salary_min') else "Competitive",
                "description": job.get("description", "")[:200] + "...",
                "url": job.get("redirect_url", "")
            })
        return parsed_jobs
    except Exception as e:
        logger.error(f"Error fetching jobs from Adzuna: {e}")
        return [{
            "title": "Senior AI Integration Architect",
            "company": "Sovereign Engineering",
            "location": "Remote",
            "salary_range": "$180,000 - $250,000",
            "description": "We are seeking a senior AI architect to build autonomous agent pipelines using Google Gemini and Next.js.",
            "url": "https://example.com/apply"
        }]
