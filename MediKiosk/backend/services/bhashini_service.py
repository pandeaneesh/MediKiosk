import os
import json
import logging
import urllib.request
import urllib.error
import urllib.parse
from typing import Optional, Dict, Any

logger = logging.getLogger("bhashini_service")

# Load environment variables from .env if available
def load_env_file():
    env_paths = [
        os.path.join(os.path.dirname(__file__), "..", ".env"),
        os.path.join(os.path.dirname(__file__), "..", "..", "AI", "backend", ".env")
    ]
    for p in env_paths:
        if os.path.exists(p):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            k = k.strip()
                            v = v.strip().strip("\"'")
                            if k and not os.environ.get(k):
                                os.environ[k] = v
            except Exception as e:
                logger.warning(f"Failed to read env file {p}: {e}")

load_env_file()

class BhashiniVoiceService:
    """Enterprise Service connector for Government of India / Bhashini Multilingual ASR & TTS APIs."""

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
        "as": "as",
        "ur": "ur"
    }

    def __init__(self):
        self.user_id = os.environ.get("BHASHINI_USER_ID", "").strip().strip("\"'")
        self.api_key = os.environ.get("BHASHINI_API_KEY", "").strip().strip("\"'")
        self.inference_api_key = os.environ.get("BHASHINI_INFERENCE_API_KEY", "").strip().strip("\"'")
        self.service_id = os.environ.get("BHASHINI_SERVICE_ID", "").strip().strip("\"'")
        self.pipeline_id = os.environ.get("BHASHINI_PIPELINE_ID", "").strip().strip("\"'")
        url_raw = os.environ.get(
            "BHASHINI_INFERENCE_URL",
            "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"
        )
        self.inference_url = url_raw.strip().strip("\"'").strip()
        if not self.inference_url.startswith("http"):
            self.inference_url = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        if self.user_id:
            headers["userID"] = self.user_id
        if self.api_key:
            headers["ulcaApiKey"] = self.api_key
        if self.inference_api_key:
            headers["Authorization"] = self.inference_api_key
        return headers

    def text_to_speech(self, text: str, language: str = "hindi", gender: str = "female") -> Dict[str, Any]:
        """Synthesize Indian language audio from text using Bhashini Dhruva AI pipeline."""
        if not text or not text.strip():
            return {"success": False, "error": "Empty text"}

        iso_lang = self.LANG_MAP.get(language.lower(), "hi")
        clean_text = text.strip()

        # If Bhashini credentials are configured, call Bhashini Inference endpoint
        if self.api_key or self.inference_api_key:
            headers = self._get_headers()
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
                            "source": clean_text
                        }
                    ]
                }
            }
            if self.pipeline_id:
                payload["pipelineRequestConfig"] = {"pipelineId": self.pipeline_id}

            try:
                # Try using requests library first for modern HTTP/2 & SSL
                try:
                    import requests
                    resp = requests.post(self.inference_url, json=payload, headers=headers, timeout=8)
                    if resp.status_code == 200:
                        res_json = resp.json()
                        audio_base64 = res_json.get("pipelineResponse", [{}])[0].get("audio", [{}])[0].get("audioContent", "")
                        if audio_base64:
                            return {
                                "success": True,
                                "source": "bhashini",
                                "audioContent": audio_base64,
                                "format": "wav",
                                "language": iso_lang,
                                "text": clean_text
                            }
                except ImportError:
                    data_bytes = json.dumps(payload).encode("utf-8")
                    req = urllib.request.Request(self.inference_url, data=data_bytes, headers=headers, method="POST")
                    with urllib.request.urlopen(req, timeout=8) as response:
                        if response.status == 200:
                            res_json = json.loads(response.read().decode("utf-8"))
                            audio_base64 = res_json.get("pipelineResponse", [{}])[0].get("audio", [{}])[0].get("audioContent", "")
                            if audio_base64:
                                return {
                                    "success": True,
                                    "source": "bhashini",
                                    "audioContent": audio_base64,
                                    "format": "wav",
                                    "language": iso_lang,
                                    "text": clean_text
                                }
            except Exception as e:
                logger.warning(f"Bhashini TTS API call warning: {e}. Generating stream fallback.")

        # Fallback to Universal High-Fidelity Audio Stream URL for standard Indian languages
        lang_code = "mr" if iso_lang == "mr" else ("hi" if iso_lang == "hi" else ("en-IN" if iso_lang == "en" else iso_lang))
        safe_query = urllib.parse.quote(clean_text[:200])
        stream_url = f"https://translate.google.com/translate_tts?ie=UTF-8&tl={lang_code}&client=tw-ob&q={safe_query}"

        return {
            "success": True,
            "source": "fallback_stream",
            "audioUrl": stream_url,
            "language": iso_lang,
            "text": clean_text
        }

    def speech_to_text(self, audio_base64: str, language: str = "hindi") -> Dict[str, Any]:
        """Convert Indian voice audio to text using Bhashini ASR pipeline."""
        if not audio_base64:
            return {"success": False, "error": "Empty audio content"}

        iso_lang = self.LANG_MAP.get(language.lower(), "hi")

        if self.api_key or self.inference_api_key:
            headers = self._get_headers()
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
                try:
                    import requests
                    resp = requests.post(self.inference_url, json=payload, headers=headers, timeout=10)
                    if resp.status_code == 200:
                        res_json = resp.json()
                        transcript = res_json.get("pipelineResponse", [{}])[0].get("output", [{}])[0].get("source", "")
                        return {
                            "success": True,
                            "source": "bhashini",
                            "transcript": transcript,
                            "language": iso_lang
                        }
                except ImportError:
                    data_bytes = json.dumps(payload).encode("utf-8")
                    req = urllib.request.Request(self.inference_url, data=data_bytes, headers=headers, method="POST")
                    with urllib.request.urlopen(req, timeout=10) as response:
                        if response.status == 200:
                            res_json = json.loads(response.read().decode("utf-8"))
                            transcript = res_json.get("pipelineResponse", [{}])[0].get("output", [{}])[0].get("source", "")
                            return {
                                "success": True,
                                "source": "bhashini",
                                "transcript": transcript,
                                "language": iso_lang
                            }
            except Exception as e:
                logger.error(f"Bhashini ASR API call error: {e}")

        return {
            "success": False,
            "error": "Bhashini ASR server unavailable, use browser Web Speech API.",
            "source": "browser_fallback"
        }

bhashini_service = BhashiniVoiceService()

