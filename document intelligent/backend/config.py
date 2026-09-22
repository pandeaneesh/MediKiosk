import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = BASE_DIR / "backend"
DATA_DIR = BACKEND_DIR / "data"
UPLOAD_DIR = DATA_DIR / "uploads"
PROCESSED_DIR = DATA_DIR / "processed"
SAMPLES_DIR = DATA_DIR / "samples"
FRONTEND_DIR = BASE_DIR / "frontend"

# Ensure data directories exist
for directory in [DATA_DIR, UPLOAD_DIR, PROCESSED_DIR, SAMPLES_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

# Redis Configuration
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_DB = int(os.getenv("REDIS_DB", 0))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)
REDIS_URL = os.getenv("REDIS_URL", f"redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}")

# Redis Keys & Channels
REDIS_QUEUE_NAME = "medikiosk:tasks:queue"
REDIS_DOC_STATE_PREFIX = "medikiosk:doc:"
REDIS_DOC_RESULT_PREFIX = "medikiosk:result:"
REDIS_TIMELINE_KEY = "medikiosk:timeline:global"

# Document Intelligence Thresholds
CONFIDENCE_THRESHOLD = 0.80  # Entities with confidence < 0.80 require doctor verification

# Document Types
DOC_TYPES = [
    "PRESCRIPTION",
    "LAB_REPORT",
    "DISCHARGE_SUMMARY",
    "IMAGING_REPORT",
    "OPD_RECORD",
    "AYURVEDIC_RECORD",
    "UNKNOWN"
]

# Supported File Extensions
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".pdf"}
