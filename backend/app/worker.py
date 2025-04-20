from celery import Celery
from app.crud import check_urls
from app.db import SessionLocal
from app.models import URLCheck
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
celery = Celery("worker", broker=REDIS_URL)
