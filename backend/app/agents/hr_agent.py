import requests
import logging
from app.core.config import get_settings

logger = logging.getLogger(__name__)

def find_recruiter_email(company_name: str) -> str:
    settings = get_settings()
    api_key = settings.HUNTER_API_KEY
    domain = company_name.lower().replace(" ", "") + ".com"
    fallbacks = [f"recruiting@{domain}", f"careers@{domain}"]
    
    if not api_key:
        logger.warning("HUNTER_API_KEY not found. Using fallback pattern.")
        return fallbacks[0]

    url = f"https://api.hunter.io/v2/domain-search?domain={domain}&api_key={api_key}"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        emails = data.get("data", {}).get("emails", [])
        for email in emails:
            # Try to find someone in HR or recruiting
            dep = email.get("department", "")
            pos = email.get("position", "").lower()
            if dep in ["hr", "executive", "management"] or "recruit" in pos or "talent" in pos:
                return email.get("value")
                
        # If no specific HR email is found, return the most confident email
        if emails:
            return emails[0].get("value")
            
        return fallbacks[0]
    except Exception as e:
        logger.error(f"Error fetching email from Hunter.io: {e}")
        return fallbacks[0]
