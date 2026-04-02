"""
AI Career Agent — FastAPI Application Entry Point
"""
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings, setup_logging
from app.api.auth import router as auth_router
from app.api.agents import router as agents_router

# ── Bootstrap ──
setup_logging()
logger = logging.getLogger(__name__)
settings = get_settings()

# ── App ──
app = FastAPI(
    title="AI Career Agent API",
    description="Autonomous career management platform powered by Gemini AI",
    version="1.0.0",
)

# ── CORS ──
# Must allow all origins for local dev — the frontend could be on localhost or 127.0.0.1
origins = [
    settings.FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ── Routers ──
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(agents_router, prefix="/api", tags=["Agents"])


from starlette.exceptions import HTTPException as StarletteHTTPException

# ── Global Exception Handler ──
# NOTE: This only catches non-CORS exceptions. CORS middleware runs BEFORE this.
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, StarletteHTTPException):
        # Let FastAPI handle regular HTTP exceptions (like 401, 404, 400)
        from fastapi.exception_handlers import http_exception_handler
        response = await http_exception_handler(request, exc)
    else:
        logger.error(f"Unhandled exception on {request.method} {request.url}: {exc}", exc_info=True)
        # Return CORS-safe error response with EXACT exception so we can debug it
        from fastapi.responses import JSONResponse
        response = JSONResponse(
            status_code=500,
            content={"detail": f"SERVER CRASH INFO: {type(exc).__name__} - {str(exc)}"},
        )
        
    origin = request.headers.get("origin", "")
    if origin in origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        
    return response


# ── Health ──
@app.get("/")
async def root():
    return {"message": "Welcome to the AI Career Agent API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}


logger.info("🚀 AI Career Agent API initialized")

