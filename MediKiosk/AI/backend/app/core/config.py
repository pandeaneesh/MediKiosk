# pyrefly: ignore [missing-import]
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "MediKiosk Conversational AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Gemini API Key (optional - system falls back to smart deterministic clinical engine if not set)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    
    # Bhashini Configuration (for Indian Language ASR / TTS)
    BHASHINI_USER_ID: str = os.getenv("BHASHINI_USER_ID", "")
    BHASHINI_API_KEY: str = os.getenv("BHASHINI_API_KEY", "")
    BHASHINI_INFERENCE_API_KEY: str = os.getenv("BHASHINI_INFERENCE_API_KEY", "")
    BHASHINI_SERVICE_ID: str = os.getenv("BHASHINI_SERVICE_ID", "")
    BHASHINI_PIPELINE_ID: str = os.getenv("BHASHINI_PIPELINE_ID", "")
    BHASHINI_INFERENCE_URL: str = os.getenv("BHASHINI_INFERENCE_URL", "https://dhruva-api.bhashini.gov.in/services/inference/pipeline")
    
    # Supported Languages (All Major Pan-Indian Languages & English)
    SUPPORTED_LANGUAGES: List[str] = [
        "english", "hindi", "marathi", "gujarati", "tamil",
        "telugu", "kannada", "malayalam", "bengali", "punjabi",
        "odia", "assamese", "urdu"
    ]
    DEFAULT_LANGUAGE: str = "english"
    
    # Emergency Webhook URL (for hospital nurse station notification)
    EMERGENCY_ALERT_WEBHOOK: str = os.getenv("EMERGENCY_ALERT_WEBHOOK", "")
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    
    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")

settings = Settings()
