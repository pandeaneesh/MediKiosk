# pyrefly: ignore [missing-import]
import pytest
from app.engine.bhashini_service import BhashiniService

@pytest.mark.asyncio
async def test_bhashini_fallback_when_credentials_empty():
    service = BhashiniService()
    service.user_id = ""
    service.api_key = ""
    service.inference_api_key = ""

    # Should safely return None (triggering graceful browser fallback)
    stt_res = await service.speech_to_text("base64data", "hindi")
    assert stt_res is None

    tts_res = await service.text_to_speech("नमस्ते", "hindi")
    assert tts_res is None

def test_bhashini_language_map():
    service = BhashiniService()
    expected = {
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
        "urdu": "ur"
    }
    for lang, iso in expected.items():
        assert service.LANG_MAP[lang] == iso, f"Failed for {lang}"

def test_bhashini_headers():
    service = BhashiniService()
    service.user_id = "test_user"
    service.api_key = "test_api_key"
    service.inference_api_key = "test_bearer_token"

    headers = service._get_headers()
    assert headers["userID"] == "test_user"
    assert headers["ulcaApiKey"] == "test_api_key"
    assert headers["Authorization"] == "test_bearer_token"
    assert headers["Content-Type"] == "application/json"

def test_tts_api_endpoint():
    # pyrefly: ignore [missing-import]
    from fastapi.testclient import TestClient
    from app.main import app
    client = TestClient(app)

    res = client.post("/api/tts", json={
        "text": "नमस्ते, आप कैसे हैं?",
        "language": "hindi"
    })
    assert res.status_code == 200
    data = res.json()
    assert "audio_base64" in data
    assert "format" in data
    assert "language" in data
    assert data["language"] == "hindi"
    assert "success" in data
