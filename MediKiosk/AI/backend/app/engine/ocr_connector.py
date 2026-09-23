from typing import Dict, Any, Optional
from app.models.schemas import SessionState, ClinicalData
import re

class OCRConnector:
    """
    Extensible module to ingest pre-extracted document data (e.g. past prescriptions,
    lab reports, discharge summaries) into active clinical session context.
    """

    @staticmethod
    def inject_document_data(session: SessionState, doc_type: str, extracted_text: str, parsed_fields: Optional[Dict[str, Any]] = None) -> SessionState:
        """Inject parsed document text into session without breaking conversation flow."""
        if not parsed_fields:
            parsed_fields = OCRConnector._parse_simple_medical_text(extracted_text)

        # Merge extracted medications
        if "medications" in parsed_fields and parsed_fields["medications"]:
            existing_meds = session.clinical_data.medication_history or []
            for med in parsed_fields["medications"]:
                if med not in existing_meds and med != "None reported":
                    existing_meds.append(med)
            session.clinical_data.medication_history = existing_meds
            if "medications" not in session.slots_covered:
                session.slots_covered.append("medications")

        # Merge extracted chronic conditions
        if "conditions" in parsed_fields and parsed_fields["conditions"]:
            existing_conds = session.clinical_data.medical_history or []
            for cond in parsed_fields["conditions"]:
                if cond not in existing_conds and cond != "None reported":
                    existing_conds.append(cond)
            session.clinical_data.medical_history = existing_conds
            if "medical_history" not in session.slots_covered:
                session.slots_covered.append("medical_history")

        # Merge allergies if found
        if "allergies" in parsed_fields and parsed_fields["allergies"]:
            existing_allergies = session.clinical_data.allergies or []
            for alg in parsed_fields["allergies"]:
                if alg not in existing_allergies and alg != "No known allergies":
                    existing_allergies.append(alg)
            session.clinical_data.allergies = existing_allergies
            if "allergies" not in session.slots_covered:
                session.slots_covered.append("allergies")

        session.clinical_data.patient_own_words.append(f"[Document Ingested: {doc_type}] {extracted_text[:120]}...")
        return session

    @staticmethod
    def _parse_simple_medical_text(text: str) -> Dict[str, Any]:
        """Simple rule-based parser for medical document strings."""
        result: Dict[str, Any] = {"medications": [], "conditions": [], "allergies": []}
        
        # Look for common drug patterns (e.g. Tab Metformin 500mg, Paracetamol, etc.)
        drug_pattern = r'(?:Tab|Cap|Syr|Inj|Tablet|Capsule)?\s*([A-Za-z]+(?:\s+[A-Za-z]+)?\s*(?:\d+\s*(?:mg|gm|ml))?)'
        matches = re.findall(drug_pattern, text)
        for m in matches:
            m_clean = m.strip()
            if len(m_clean) > 3 and not any(kw in m_clean.lower() for kw in ["patient", "doctor", "hospital", "clinic", "date", "name"]):
                result["medications"].append(m_clean)

        # Look for known chronic conditions
        text_lower = text.lower()
        if "diabetes" in text_lower or "dm" in text_lower:
            result["conditions"].append("Diabetes Mellitus")
        if "hypertension" in text_lower or "htn" in text_lower or "high bp" in text_lower:
            result["conditions"].append("Hypertension")
        if "asthma" in text_lower:
            result["conditions"].append("Asthma")
        if "hypothyroid" in text_lower:
            result["conditions"].append("Hypothyroidism")

        # Look for allergies
        if "allergic to" in text_lower or "allergy:" in text_lower:
            alg_match = re.search(r'(?:allergic to|allergy:?)\s*([A-Za-z\s,]+)', text, re.IGNORECASE)
            if alg_match:
                result["allergies"].append(alg_match.group(1).strip())

        return result

ocr_connector = OCRConnector()
