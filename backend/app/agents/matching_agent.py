import logging
import math
import google.generativeai as genai
from app.core.config import get_settings

logger = logging.getLogger(__name__)

def get_embedding(text: str) -> list[float]:
    try:
        result = genai.embed_content(
            model="models/gemini-embedding-001",
            content=text,
            task_type="retrieval_document",
        )
        return result['embedding']
    except Exception as e:
        logger.error(f"Error getting embedding: {e}")
        return []

def cosine_similarity(vec1: list[float], vec2: list[float]) -> float:
    if not vec1 or not vec2:
        return 0.0
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    norm_a = math.sqrt(sum(a * a for a in vec1))
    norm_b = math.sqrt(sum(b * b for b in vec2))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot_product / (norm_a * norm_b)

def compute_match_score(resume_text: str, job_description: str) -> float:
    settings = get_settings()
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        logger.warning("Valid GEMINI_API_KEY not found. Returning 0 matching score.")
        return 0.0

    genai.configure(api_key=api_key)
    
    resume_emb = get_embedding(resume_text)
    job_emb = get_embedding(job_description)
    
    score = cosine_similarity(resume_emb, job_emb)
    percentage = max(0.0, min(100.0, (score * 100.0)))
    return round(percentage, 1)

def filter_and_match_jobs(jobs: list, user_profile: dict) -> list:
    matched_jobs = []
    skills_text = user_profile.get("skills", "")
    title_text = user_profile.get("title", "")
    resume_context = f"{title_text}. Skills: {skills_text}"

    for job in jobs:
        score = compute_match_score(resume_context, job.get("description", ""))
        matched_jobs.append({"job": job, "score": score})
        
    return sorted(matched_jobs, key=lambda x: x["score"], reverse=True)
