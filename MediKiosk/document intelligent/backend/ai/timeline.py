from datetime import datetime
import re
from typing import Any, Dict, List
from backend.redis_client import redis_client


class ClinicalTimelineBuilder:
    """
    Synthesizes multi-document clinical history into a coherent,
    chronological patient timeline tracking diagnoses, lab trends, and medication changes.
    """

    @classmethod
    def parse_year(cls, date_str: str) -> int:
        """Extracts year from date string e.g. '10/09/2026', '2024-05-12', '2023'."""
        if not date_str:
            return 2026
        match = re.search(r"\b(19\d\d|20\d\d)\b", date_str)
        if match:
            return int(match.group(1))
        return 2026

    @classmethod
    def build_event_from_document(cls, doc_id: str, doc_type: str, entities: Dict[str, Any]) -> Dict[str, Any]:
        """Constructs a timeline milestone from an individual document extraction."""
        raw_date = entities.get("document_date") or datetime.now().strftime("%d/%m/%Y")
        year = cls.parse_year(raw_date)

        meds = entities.get("medications", [])
        labs = entities.get("investigations", [])
        vitals = entities.get("vitals", [])

        events_summary = []
        if doc_type == "PRESCRIPTION":
            med_names = [f"{m['name']} ({m.get('dose', '')})" for m in meds[:3]]
            if med_names:
                events_summary.append(f"Prescribed: {', '.join(med_names)}")
            else:
                events_summary.append("Prescription Consultation")
        elif doc_type == "LAB_REPORT":
            lab_summary = [f"{l['name']}: {l['value']} {l.get('unit', '')}" for l in labs[:3]]
            events_summary.append(f"Labs: {', '.join(lab_summary) if lab_summary else 'Diagnostics'}")
        elif doc_type == "DISCHARGE_SUMMARY":
            events_summary.append("Inpatient Hospital Admission & Discharge")
        else:
            events_summary.append(f"Clinical Encounter ({doc_type})")

        milestone = {
            "document_id": doc_id,
            "document_type": doc_type,
            "date": raw_date,
            "year": year,
            "title": f"{doc_type.replace('_', ' ').title()} ({year})",
            "summary": " • ".join(events_summary),
            "medications": [m["name"] for m in meds],
            "investigations": [{l["name"]: f"{l['value']} {l.get('unit', '')}"} for l in labs],
            "vitals": [{v["name"]: f"{v['value']} {v.get('unit', '')}"} for v in vitals],
        }

        # Store in Redis timeline list
        redis_client.append_to_timeline(milestone)
        return milestone

    @classmethod
    def get_consolidated_timeline(cls) -> List[Dict[str, Any]]:
        """Retrieves and chronologically sorts all recorded milestones from Redis."""
        events = redis_client.get_timeline()
        if not events:
            # Provide initial baseline milestones for MediKiosk demonstration
            return [
                {
                    "year": 2023,
                    "date": "14/05/2023",
                    "document_type": "OPD_RECORD",
                    "title": "Initial OPD Consultation (2023)",
                    "summary": "Type 2 Diabetes Mellitus diagnosed • Polyuria and fatigue reported",
                    "medications": ["Lifestyle modification advised"],
                    "investigations": [{"Fasting Blood Sugar": "148 mg/dL"}],
                    "vitals": [{"Blood Pressure": "130/84 mmHg"}]
                },
                {
                    "year": 2024,
                    "date": "10/06/2024",
                    "document_type": "LAB_REPORT",
                    "title": "Annual Metabolic Screening (2024)",
                    "summary": "HbA1c: 7.1% • Metformin 500 mg initiated OD",
                    "medications": ["Metformin 500 mg"],
                    "investigations": [{"HbA1c": "7.1 %"}, {"Serum Creatinine": "0.9 mg/dL"}],
                    "vitals": [{"Blood Pressure": "134/86 mmHg"}]
                },
                {
                    "year": 2025,
                    "date": "18/11/2025",
                    "document_type": "PRESCRIPTION",
                    "title": "Endocrinology Review (2025)",
                    "summary": "HbA1c escalated to 8.2% • Metformin dosage increased to 500 mg 1-0-1",
                    "medications": ["Metformin 500 mg", "Glimepiride 1 mg"],
                    "investigations": [{"HbA1c": "8.2 %"}],
                    "vitals": [{"Blood Pressure": "142/90 mmHg"}]
                }
            ]
        # Sort chronologically by year, then date
        events.sort(key=lambda x: (x.get("year", 2026), str(x.get("date", ""))))
        return events
