import os
from celery import Celery

# Use Redis local port for the worker message broker
REDIS_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "agent_worker",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["app.workers.tasks"]
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],  
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)
