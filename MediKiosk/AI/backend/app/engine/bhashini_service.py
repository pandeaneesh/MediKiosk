import logging
import httpx
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

class BhashiniService:
    """Service connector for Government of India / Bhashini Multilingual ASR & TTS APIs."""

    LANG_MAP = {
        "english": "en",
        "hindi": "hi",
        "marathi": "mr",
        "gujarati": "gu",
        "tamil": "ta",
        "telugu": "te",
        "kannada": "kn",
        "malayalam": "ml",
        "bengali": "bn",
        "punjabi": "pa",
        "odia": "or",
        "assamese": "as",
        "urdu": "ur",
        "en": "en",
        "hi": "hi",
        "mr": "mr",
        "gu": "gu",
        "ta": "ta",
        "te": "te",
        "kn": "kn",
        "ml": "ml",
        "bn": "bn",
        "pa": "pa",
        "or": "or",
        "od": "or",
        "as": "as",
        "ur": "ur"
    }

    def __init__(self):
        self.user_id = settings.BHASHINI_USER_ID
        self.api_key = settings.BHASHINI_API_KEY
        self.inference_api_key = settings.BHASHINI_INFERENCE_API_KEY
        self.service_id = settings.BHASHINI_SERVICE_ID
        self.pipeline_id = settings.BHASHINI_PIPELINE_ID
        self.inference_url = settings.BHASHINI_INFERENCE_URL

    def _get_headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.user_id:
            headers["userID"] = self.user_id
        if self.api_key:
            headers["ulcaApiKey"] = self.api_key
        if self.inference_api_key:
            headers["Authorization"] = self.inference_api_key
        return headers

    async def speech_to_text(self, audio_base64: str, language_code: str = "hi") -> Optional[str]:
        """Convert recorded voice audio to text using Bhashini ASR pipeline."""
        if not (self.api_key or self.inference_api_key):
            logger.info("Bhashini credentials not set. Falling back to browser Web Speech ASR.")
            return None

        headers = self._get_headers()
        iso_lang = self.LANG_MAP.get(language_code.lower(), language_code)

        task_config: Dict[str, Any] = {
            "language": {
                "sourceLanguage": iso_lang
            },
            "audioFormat": "wav",
            "samplingRate": 16000
        }
        if self.service_id:
            task_config["serviceId"] = self.service_id

        payload: Dict[str, Any] = {
            "pipelineTasks": [
                {
                    "taskType": "asr",
                    "config": task_config
                }
            ],
            "inputData": {
                "audio": [
                    {
                        "audioContent": audio_base64
                    }
                ]
            }
        }
        if self.pipeline_id:
            payload["pipelineRequestConfig"] = {"pipelineId": self.pipeline_id}

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(self.inference_url, json=payload, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    transcript = data.get("pipelineResponse", [{}])[0].get("output", [{}])[0].get("source", "")
                    return transcript
                else:
                    logger.warning(f"Bhashini ASR returned HTTP {res.status_code}: {res.text}")
        except Exception as e:
            logger.error(f"Error calling Bhashini ASR: {e}")
            return None

        return None

    async def text_to_speech(self, text: str, language_code: str = "hi", gender: str = "female") -> Optional[str]:
        """Synthesize audio speech from text using Bhashini TTS pipeline."""
        if not (self.api_key or self.inference_api_key):
            logger.info("Bhashini credentials not set. Using browser Web Speech Synthesis.")
            return None

        headers = self._get_headers()
        iso_lang = self.LANG_MAP.get(language_code.lower(), language_code)

        task_config: Dict[str, Any] = {
            "language": {
                "sourceLanguage": iso_lang
            },
            "gender": gender
        }
        if self.service_id:
            task_config["serviceId"] = self.service_id

        payload: Dict[str, Any] = {
            "pipelineTasks": [
                {
                    "taskType": "tts",
                    "config": task_config
                }
            ],
            "inputData": {
                "input": [
                    {
                        "source": text
                    }
                ]
            }
        }
        if self.pipeline_id:
            payload["pipelineRequestConfig"] = {"pipelineId": self.pipeline_id}

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(self.inference_url, json=payload, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    audio_base64 = data.get("pipelineResponse", [{}])[0].get("audio", [{}])[0].get("audioContent", "")
                    return audio_base64
                else:
                    logger.warning(f"Bhashini TTS returned HTTP {res.status_code}: {res.text}")
        except Exception as e:
            logger.error(f"Error calling Bhashini TTS: {e}")
            return None

        return None

bhashini_service = BhashiniService()
