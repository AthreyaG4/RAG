from celery import Celery
import os

print("=" * 60)
print("CELERY_BROKER_URL:", os.getenv("CELERY_BROKER_URL"))
print("CELERY_RESULT_BACKEND:", os.getenv("CELERY_RESULT_BACKEND"))
print("=" * 60)
celery_app = Celery(
    "worker",
    broker=os.getenv("CELERY_BROKER_URL"),
    backend=os.getenv("CELERY_RESULT_BACKEND"),
)

celery_app.conf.update(
    task_track_started=True,
)

from tasks import *