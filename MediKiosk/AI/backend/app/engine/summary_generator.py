from typing import Dict, Any, Optional
from datetime import datetime, timezone
from app.models.schemas import SessionState, DoctorSummary, MedicalSystemEnum

class SummaryGenerator:
    """Generates structured, practitioner-ready clinical handover reports for Doctors and Ayurvedic Vaidyas."""

    @staticmethod
    def generate_summary(session: SessionState) -> DoctorSummary:
        clin = session.clinical_data
        dp = clin.dashavidha_pariksha
        is_ayush = (session.medical_system == MedicalSystemEnum.AYUSH) or (session.system_type == "ayush")

        # Determine triage level based on red flags and severity
        if session.red_flags or (clin.severity and clin.severity >= 9):
            triage_level = "EMERGENCY"
        elif clin.severity and clin.severity >= 7:
            triage_level = "PRIORITY"
        else:
            triage_level = "STANDARD"

        # SOCRATES Summary
        socrates_dict: Dict[str, Any] = {
            "Site (Location)": clin.site or "Not specified",
            "Onset & Duration": clin.onset or clin.duration or "Not specified",
            "Character": clin.character or "Not specified",
            "Radiation": clin.radiation or "None",
            "Associated Symptoms": clin.associated_symptoms if clin.associated_symptoms else ["None reported"],
            "Timing / Pattern": clin.timing or "Not specified",
            "Aggravating / Relieving Factors": {
                "Aggravating": clin.aggravating_factors if clin.aggravating_factors else ["None reported"],
                "Relieving": clin.relieving_factors if clin.relieving_factors else ["None reported"]
            },
            "Severity Score": f"{clin.severity}/10" if clin.severity is not None else "Not rated"
        }

        # Dashavidha Pariksha Summary
        dashavidha_dict: Optional[Dict[str, Any]] = None
        if is_ayush or (dp and (dp.prakriti or dp.vikriti or dp.ahara_shakti or dp.satmya or dp.satva or dp.vyayama_shakti or dp.sara or dp.samhanana or dp.vaya)):
            dashavidha_dict = {
                "1. Prakriti (प्रकृति)": dp.prakriti.get("body_build", "Not assessed") if dp and dp.prakriti else "Not assessed",
                "2. Vikriti (विकृति)": ", ".join(dp.vikriti.get("recent_changes", [])) if dp and dp.vikriti and dp.vikriti.get("recent_changes") else "Not assessed",
                "3. Ahara Shakti (आहार शक्ति / अग्नि)": dp.ahara_shakti.get("appetite_level", "Not assessed") if dp and dp.ahara_shakti else "Not assessed",
                "4. Satmya (सात्म्य)": ", ".join(dp.satmya) if dp and dp.satmya else "None reported",
                "5. Sattva (सत्त्व)": dp.satva or "Not assessed",
                "6. Vyayama Shakti (व्यायाम शक्ति)": dp.vyayama_shakti or "Not assessed",
                "7. Sara (सार बल)": dp.sara or "Not assessed",
                "8. Samhanana (संहनन)": dp.samhanana or "Not assessed",
                "9. Vaya (वय)": dp.vaya or "Not assessed"
            }

        if is_ayush:
            med_system_label = "AYUSH / Ayurveda (दशविध परीक्षा)"
            ai_note = (
                "AI-assisted patient-reported observations requiring Vaidya clinical examination. "
                "This handover summary is for clinical history reference and is not a diagnosis or prescription."
            )
        else:
            med_system_label = "Allopathy (Modern Medicine)"
            ai_note = (
                "AI-assisted patient-reported triage history compiled for doctor review. "
                "This document is a clinical history handover and is not a diagnosis or treatment plan."
            )

        summary = DoctorSummary(
            patient_id=f"PT-{session.session_id[-6:].upper()}",
            session_id=session.session_id,
            timestamp=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            medical_system=med_system_label,
            language_used=session.language.capitalize(),
            patient_complaint=clin.chief_complaint or "Unspecified complaint",
            socrates_summary=socrates_dict if not is_ayush else None,
            dashavidha_pariksha=dashavidha_dict if is_ayush else None,
            chronic_history=clin.medical_history if clin.medical_history else ["None reported"],
            current_medications=clin.medication_history if clin.medication_history else ["None reported"],
            allergies=clin.allergies if clin.allergies else ["No known allergies"],
            triage_level=triage_level,
            red_flags=session.red_flags,
            ai_note=ai_note,
            transcript_excerpt=session.messages[-6:] if session.messages else []
        )
        return summary
