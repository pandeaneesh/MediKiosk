import base64
import io
import json
import logging
import os
from pathlib import Path
import time
from typing import Any, Dict, List, Optional
import urllib.error
import urllib.request
from PIL import Image

from backend.config import BASE_DIR

logger = logging.getLogger("MediKiosk.Gemini")

# Load from .env if present
ENV_FILE = BASE_DIR / ".env"
if ENV_FILE.exists():
    try:
        with open(ENV_FILE, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip().startswith("GEMINI_API_KEY="):
                    val = line.strip().split("=", 1)[1].strip()
                    if val:
                        os.environ["GEMINI_API_KEY"] = val
    except Exception as e:
        logger.debug("Error reading .env: %s", e)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

CANDIDATE_MODELS = [
    "models/gemini-1.5-flash",
    "models/gemini-2.0-flash",
]


class GeminiMedicalExtractor:
    """
    Multimodal AI Medical Intelligence Extractor designed specifically for
    Indian doctor handwriting, prescriptions, lab reports, and discharge summaries.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY", "")
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        self.is_configured = bool(self.api_key and self.api_key.startswith("AIzaSy"))

    def set_api_key(self, api_key: str) -> bool:
        """Sets and persists Gemini API key for true multimodal handwriting deciphering."""
        cleaned = api_key.strip()
        self.api_key = cleaned
        self.is_configured = bool(cleaned and cleaned.startswith("AIzaSy"))
        os.environ["GEMINI_API_KEY"] = cleaned
        try:
            with open(BASE_DIR / ".env", "w", encoding="utf-8") as f:
                f.write(f"GEMINI_API_KEY={cleaned}\n")
        except Exception as ex:
            logger.warning("Could not persist key to .env: %s", ex)
        logger.info("Gemini API Key updated. Active: %s", self.is_configured)
        return self.is_configured

    def _call_gemini_api(self, prompt: str, image_path: Optional[str] = None) -> Optional[Dict[str, Any]]:
        if not self.is_configured:
            logger.info("Gemini API key not configured or invalid. Using local neural OCR & pharmacopoeia engine.")
            return None

        parts: List[Dict[str, Any]] = []

        # Encode image to base64 if provided
        if image_path and os.path.exists(image_path):
            try:
                with Image.open(image_path) as img:
                    img = img.convert("RGB")
                    # Maintain high resolution for handwriting clarity
                    max_size = (1800, 1800)
                    img.thumbnail(max_size, Image.Resampling.LANCZOS)
                    buf = io.BytesIO()
                    img.save(buf, format="JPEG", quality=92)
                    b64_data = base64.b64encode(buf.getvalue()).decode("utf-8")
                    parts.append({
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": b64_data,
                        }
                    })
            except Exception as e:
                logger.error("Failed to prepare image for Gemini: %s", e)

        parts.append({"text": prompt})

        payload = {
            "contents": [{"parts": parts}],
            "generationConfig": {
                "temperature": 0.1,
                "response_mime_type": "application/json",
            },
        }
        json_data = json.dumps(payload).encode("utf-8")

        for model in CANDIDATE_MODELS:
            endpoint = f"{self.base_url}/{model}:generateContent?key={self.api_key}"
            req = urllib.request.Request(
                endpoint,
                data=json_data,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            try:
                with urllib.request.urlopen(req, timeout=10) as response:
                    res_body = response.read().decode("utf-8")
                    res_json = json.loads(res_body)
                    candidates = res_json.get("candidates", [])
                    if candidates:
                        text_content = candidates[0]["content"]["parts"][0]["text"]
                        return json.loads(text_content)
            except urllib.error.HTTPError as e:
                logger.warning("[Gemini] Model %s HTTP %d. Trying failover model...", model, e.code)
                time.sleep(0.2)
            except Exception as e:
                logger.warning("[Gemini] Model %s error: %s. Trying failover model...", model, e)
                time.sleep(0.2)

        logger.warning("Gemini vision models unavailable. Falling back to local clinical extractor.")
        return None

    def extract_handwritten_intelligence(
        self,
        image_path: str,
        ocr_blocks: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """
        Extracts comprehensive clinical intelligence from handwritten prescription or document.
        """
        blocks_context = ""
        if ocr_blocks:
            sample_blocks = [f"- \"{b.get('text', '')}\" bbox={b.get('bbox', [])}" for b in ocr_blocks[:35]]
            blocks_context = "\nPre-extracted OCR text fragments:\n" + "\n".join(sample_blocks)

        prompt = f"""
You are an expert Clinical Pharmacist, Senior Physician, and Medical Document Intelligence AI.
Analyze this handwritten doctor prescription / medical slip thoroughly. Indian doctor cursive handwriting, abbreviations, and informal shorthand are common.

{blocks_context}

CRITICAL MEDICAL EXTRACTION RULES:
1. Examine doctor handwriting carefully:
   - Identify clinic / hospital header, doctor registration number, patient name, age, gender, date.
   - Identify "c/o" (Chief complaints), "Imp" (Impression / Provisional Diagnosis), "O/E" (On Examination).
   - Identify "Rx" / "Adv" (Advice / Prescriptions), including IV fluids (e.g. 5% Dextrose, Normal Saline), oral rehydration (ORS sachets), tablets, capsules, injections.
   - Identify dosage, frequency ("stat" = immediately, 1-0-1, OD, BD, TDS, SOS), and instructions ("after food", "iv", "adequate fluid intake").
   - Identify investigations (e.g. RBS, FBS, HbA1c) and numerical values with units (mg/dL, %, etc.).
   - Identify vitals: Blood pressure (BP), Pulse rate (PR), SpO2, Temperature.
2. Ground all extractions in the document. Provide bounding boxes [ymin, xmin, ymax, xmax] normalized on a 0-1000 scale where [0,0] is top-left and [1000,1000] is bottom-right.
3. If an item is ambiguous or faint handwriting, flag `requires_verification: true` and assign appropriate confidence (0.50 - 0.75).

Return strictly valid JSON matching this schema:
{{
  "document_type": "PRESCRIPTION | LAB_REPORT | DISCHARGE_SUMMARY | OPD_RECORD",
  "document_type_confidence": 0.95,
  "patient_info": {{
    "name": "...",
    "age": "...",
    "gender": "...",
    "date": "...",
    "uhid": "...",
    "doctor_name": "...",
    "doctor_reg": "...",
    "clinic_hospital": "...",
    "address": "..."
  }},
  "diagnosis": [
    {{
      "condition": "...",
      "source_text": "...",
      "confidence": 0.95
    }}
  ],
  "medications": [
    {{
      "name": "...",
      "form": "Tab | Inj | Sachet | Syrup",
      "dose": "...",
      "frequency": "...",
      "duration": "...",
      "instructions": "...",
      "confidence": 0.95,
      "needs_verification": false,
      "source_text": "...",
      "bbox": [ymin, xmin, ymax, xmax]
    }}
  ],
  "investigations": [
    {{
      "name": "...",
      "value": "...",
      "unit": "...",
      "reference_range": "...",
      "status": "Normal | Low | High",
      "confidence": 0.95,
      "needs_verification": false,
      "source_text": "...",
      "bbox": [ymin, xmin, ymax, xmax]
    }}
  ],
  "vitals": [
    {{
      "name": "Blood Pressure | Pulse | SpO2 | Temperature",
      "value": "...",
      "unit": "...",
      "confidence": 0.95,
      "source_text": "...",
      "bbox": [ymin, xmin, ymax, xmax]
    }}
  ],
  "advice": [
    "..."
  ],
  "safety_alerts": [
    "..."
  ]
}}
"""
        result = self._call_gemini_api(prompt, image_path=image_path)
        return result or {}


gemini_extractor = GeminiMedicalExtractor()
