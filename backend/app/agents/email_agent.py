import logging
import google.generativeai as genai
from app.core.config import get_settings

logger = logging.getLogger(__name__)

# Models to try in order (most capable first, fallback to simpler)
GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"]


def generate_personalized_email(user_profile: dict, job: dict, company_name: str) -> str:
    settings = get_settings()
    api_key = settings.GEMINI_API_KEY
    fallback_email = (
        f"Subject: Application for {job.get('title')} at {company_name}\n\n"
        f"Hi HR Team,\n\n"
        f"I am {user_profile.get('name', 'a candidate')} with skills in "
        f"{user_profile.get('skills', '')}. I am very interested in the "
        f"{job.get('title')} role at {company_name} and would love to discuss how "
        f"I can contribute to your team.\n\n"
        f"Best regards,\n{user_profile.get('name', 'Candidate')}"
    )

    if not api_key:
        logger.warning("GEMINI_API_KEY not found. Returning fallback email.")
        return fallback_email

    genai.configure(api_key=api_key)

    prompt = f"""You are an expert career agent writing a cold outreach email to a recruiter at {company_name} for the position of {job.get('title')}.

Candidate Profile:
Name: {user_profile.get('name', 'A candidate')}
Current Title: {user_profile.get('title', 'Professional')}
Skills: {user_profile.get('skills', 'Various skills')}

Job Description:
{job.get('description', 'Role at ' + company_name)[:300]}

Write a highly professional, concise, and compelling cold email (150-200 words). Include the subject line on the first line starting with 'Subject:'. Do not use any placeholder brackets. Sign off with the candidate's real name."""

    for model_name in GEMINI_MODELS:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            logger.info(f"Email generated using {model_name}")
            return response.text.strip()
        except Exception as e:
            logger.warning(f"Model {model_name} failed: {e}. Trying next...")
            continue

    logger.error("All Gemini models failed. Using fallback email.")
    return fallback_email
