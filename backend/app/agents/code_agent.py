import os
import requests
import logging
import json
import google.generativeai as genai

logger = logging.getLogger(__name__)

def analyze_github_repo(repo_url: str) -> dict:
    fallback_result = {
        "score": 0,
        "suggestions": [
            {"title": "Analysis unavailable", "description": "Configure GITHUB_TOKEN and GEMINI_API_KEY in backend .env to enable real repository analysis.", "severity": "error"}
        ]
    }
    
    github_token = os.getenv("GITHUB_TOKEN")
    gemini_key = os.getenv("GEMINI_API_KEY")
    
    if not github_token or not gemini_key:
        return fallback_result

    # Parse repo url "https://github.com/user/repo"
    parts = repo_url.rstrip("/").split("/")
    if len(parts) < 2:
        return fallback_result
    
    owner, repo = parts[-2], parts[-1]
    
    headers = {"Authorization": f"Bearer {github_token}", "Accept": "application/vnd.github.v3+json"}
    
    try:
        readme_resp = requests.get(f"https://api.github.com/repos/{owner}/{repo}/readme", headers=headers, timeout=10)
        readme_content = "No README found"
        if readme_resp.status_code == 200:
            import base64
            readme_data = readme_resp.json()
            readme_content = base64.b64decode(readme_data.get("content", "")).decode("utf-8")[:3000] # limit length
            
        lang_resp = requests.get(f"https://api.github.com/repos/{owner}/{repo}/languages", headers=headers, timeout=10)
        languages = list(lang_resp.json().keys()) if lang_resp.status_code == 200 else []
        
        genai.configure(api_key=gemini_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = f"""
        Analyze the following repository based on its languages and README.
        Languages: {languages}
        README Snippet:
        {readme_content}
        
        Return a JSON object EXACTLY in this format:
        {{
            "score": <an integer 0-100 representing engineering quality context>,
            "suggestions": [
                {{"title": "<string>", "description": "<string>", "severity": "<error/warning/success/info>"}}
            ]
        }}
        Provide exactly 4 distinct suggestions. Provide NO other formatting or markdown blocks around the JSON.
        """
        
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json", "temperature": 0.3}
        )
        
        result_str = response.text
        return json.loads(result_str)
        
    except Exception as e:
        logger.error(f"Error in code analysis: {e}")
        return fallback_result
