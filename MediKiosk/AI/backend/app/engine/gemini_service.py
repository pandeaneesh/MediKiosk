import os
import json
import logging
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

class GeminiService:
    """
    Optional LLM extraction service utilizing Google GenAI API.
    Gracefully falls back to deterministic clinical state machine when key is not provided.
    """

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL
        self._client = None
        if self.api_key:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
                logger.info(f"Gemini GenAI client initialized with model {self.model_name}")
            except Exception as e:
                logger.warning(f"Could not initialize Gemini GenAI client: {e}")

    def is_available(self) -> bool:
        return self._client is not None

    async def extract_clinical_entities(self, text: str, medical_system: str = "allopathy") -> Optional[Dict[str, Any]]:
        """Extract clinical entities using structured JSON schema."""
        if not self._client:
            return None

        prompt = f"""
        Extract clinical history slots from the patient's statement for a hospital kiosk triage system.
        Medical System: {medical_system}
        Patient statement: "{text}"
        
        Return a valid JSON object with matching fields from:
        - chief_complaint: string
        - site: string
        - onset: string
        - character: string
        - radiation: string
        - associated_symptoms: list of strings
        - aggravating_factors: list of strings
        - relieving_factors: list of strings
        - severity: integer 0-10 or null
        - medical_history: list of chronic conditions
        - medication_history: list of medicines
        - allergies: list of allergies
        """
        try:
            response = self._client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config={
                    "response_mime_type": "application/json"
                }
            )
            if response and response.text:
                return json.loads(response.text)
        except Exception as e:
            logger.warning(f"Gemini extraction failed: {e}")
            return None

gemini_service = GeminiService()
