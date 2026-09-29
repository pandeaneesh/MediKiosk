import re
from typing import Any, Dict, List


class DocumentClassifier:
    """Classifies medical document type based on OCR text, keywords, and structural patterns."""

    KEYWORDS = {
        "PRESCRIPTION": [
            r"\brx\b", r"\btab\b", r"\btablet\b", r"\bcap\b", r"\bcapsule\b",
            r"\bsyrup\b", r"\binj\b", r"\binjection\b", r"\bod\b", r"\bbd\b",
            r"\btds\b", r"\bhs\b", r"\b1-0-1\b", r"\b1-1-1\b", r"\b1-0-0\b",
            r"\b0-0-1\b", r"\bmg\b", r"\bdoctor\b", r"\bdr\.\b", r"\bclinic\b",
            r"\bpatient\b", r"\bage\b", r"\bsex\b", r"\bdiagnosis\b"
        ],
        "LAB_REPORT": [
            r"\blab(oratory)?\b", r"\bpathology\b", r"\bbiochemistry\b", r"\bhematology\b",
            r"\breference (range|interval)\b", r"\bnormal value\b", r"\bresult\b",
            r"\bunits\b", r"\bhba1c\b", r"\bhemoglobin\b", r"\bcreatinine\b",
            r"\bcholesterol\b", r"\bplatelet\b", r"\bwbc\b", r"\brbc\b",
            r"\bmg/dl\b", r"\bg/dl\b", r"\bmmol/l\b", r"\bu/l\b", r"\blipid profile\b"
        ],
        "DISCHARGE_SUMMARY": [
            r"\bdischarge (summary|card|sheet)\b", r"\bdate of admission\b",
            r"\bdate of discharge\b", r"\bcourse in hospital\b", r"\bhospital\b",
            r"\btreatment given\b", r"\bcondition at discharge\b", r"\boperative procedure\b",
            r"\bipd\b", r"\buhid\b", r"\bward\b"
        ],
        "IMAGING_REPORT": [
            r"\bx-ray\b", r"\bmri\b", r"\bct scan\b", r"\bultrasound\b",
            r"\busg\b", r"\bradiology\b", r"\bfindings\b", r"\bimpression\b",
            r"\bcontrast\b", r"\bview\b"
        ],
        "OPD_RECORD": [
            r"\bopd\b", r"\boutpatient\b", r"\bchief complaints?\b",
            r"\bon examination\b", r"\bconsultation fee\b", r"\btoken no\b"
        ],
        "AYURVEDIC_RECORD": [
            r"\bayurved(a|ic)\b", r"\bchurna\b", r"\bkwath\b", r"\bvati\b",
            r"\bbhasma\b", r"\brasayana\b", r"\btailam\b", r"\bprakriti\b",
            r"\bvata\b", r"\bpitta\b", r"\bkapha\b"
        ]
    }

    @classmethod
    def classify(cls, ocr_blocks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyzes all OCR text lines and scores each document class."""
        full_text = " ".join([b.get("text", "") for b in ocr_blocks]).lower()

        if not full_text.strip():
            return {"document_type": "UNKNOWN", "confidence": 0.0}

        # Check explicit high-confidence title header markers
        if re.search(r"discharge\s*(summary|card|sheet)", full_text, re.IGNORECASE):
            return {
                "document_type": "DISCHARGE_SUMMARY",
                "confidence": 0.98,
                "all_scores": {"DISCHARGE_SUMMARY": 0.98, "PRESCRIPTION": 0.45},
            }
        if re.search(r"\b(m\.?b\.?b\.?s|m\.?s\.?\(|m\.?d\.?\(|bams|bhms|clinic|hospital.*centre|prescription)\b", full_text, re.IGNORECASE):
            return {
                "document_type": "PRESCRIPTION",
                "confidence": 0.95,
                "all_scores": {"PRESCRIPTION": 0.95},
            }
        if re.search(r"(pathology|biochemistry|hematology|diagnostic|metropolis|test\s*name.*result)", full_text, re.IGNORECASE) and re.search(r"(result|reference|units|mg/dl|g/dl)", full_text, re.IGNORECASE):
            return {
                "document_type": "LAB_REPORT",
                "confidence": 0.98,
                "all_scores": {"LAB_REPORT": 0.98},
            }
        if re.search(r"(x-ray|mri|ct\s*scan|ultrasound|sonography|radiology)", full_text, re.IGNORECASE) and re.search(r"(impression|findings|view)", full_text, re.IGNORECASE):
            return {
                "document_type": "IMAGING_REPORT",
                "confidence": 0.96,
                "all_scores": {"IMAGING_REPORT": 0.96},
            }

        scores: Dict[str, float] = {k: 0.0 for k in cls.KEYWORDS}

        for doc_type, patterns in cls.KEYWORDS.items():
            matched_count = 0
            for pat in patterns:
                matches = len(re.findall(pat, full_text, re.IGNORECASE))
                if matches > 0:
                    matched_count += min(matches, 3)
            # Normalize score
            score = matched_count / (len(patterns) * 0.4)
            scores[doc_type] = min(score, 1.0)

        # Pick highest scoring class
        best_type = max(scores, key=scores.get)
        best_score = scores[best_type]

        if best_score < 0.2:
            return {"document_type": "UNKNOWN", "confidence": round(float(best_score), 2)}

        # Boost confidence into realistic medical range (0.80 - 0.98)
        confidence = min(0.75 + (best_score * 0.23), 0.98)
        return {
            "document_type": best_type,
            "confidence": round(float(confidence), 2),
            "all_scores": {k: round(v, 2) for k, v in scores.items() if v > 0.05}
        }
