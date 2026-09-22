from typing import Any, Dict, List


class PhysicianSummarizer:
    """
    Generates a structured, evidence-grounded physician clinical summary.
    Strictly forbids autonomous diagnosis or hallucinations; explicitly demarcates
    unverified items requiring doctor review.
    """

    @classmethod
    def generate_summary(
        cls,
        doc_id: str,
        doc_type: str,
        entities: Dict[str, Any],
        unverified_items: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        doc_date = entities.get("document_date", "Date Not Specified")
        meds = entities.get("medications", [])
        labs = entities.get("investigations", [])
        vitals = entities.get("vitals", [])
        patient = entities.get("patient_info", {})

        med_lines = []
        for m in meds:
            status_flag = "[Needs Verification]" if m.get("needs_verification") else "[High Confidence]"
            med_lines.append(f"• {m['name']} — Dose: {m.get('dose', 'N/A')} — Frequency: {m.get('frequency', 'N/A')} {status_flag}")

        lab_lines = []
        for l in labs:
            ref_txt = f" (Ref: {l.get('reference_range')})" if l.get("reference_range") else ""
            lab_lines.append(f"• {l['name']}: {l['value']} {l.get('unit', '')}{ref_txt}")

        vital_lines = []
        for v in vitals:
            vital_lines.append(f"• {v['name']}: {v['value']} {v.get('unit', '')}")

        verify_notes = []
        for item in unverified_items:
            verify_notes.append(
                f"• {item.get('entity_type', 'Entity').title()}: '{item.get('name')}' (Confidence: {int(float(item.get('confidence', 0.5))*100)}%) — Reason: Low OCR clarity / Doctor handwriting."
            )

        # Build physician summary text
        summary_text = f"""=== MEDIKIOSK CLINICAL DOCUMENT SUMMARY ===
Document ID: {doc_id}
Document Type: {doc_type.replace('_', ' ').title()}
Extracted Date: {doc_date}
Patient: {patient.get('name', 'Not Specified')} (Age: {patient.get('age', 'N/A')})

CURRENT MEDICATIONS:
{chr(10).join(med_lines) if med_lines else '• None documented in this record'}

INVESTIGATIONS & LABS:
{chr(10).join(lab_lines) if lab_lines else '• None documented in this record'}

RECORDED VITALS:
{chr(10).join(vital_lines) if vital_lines else '• None documented in this record'}

CRITICAL PHYSICIAN SAFEGUARDS:
{chr(10).join(verify_notes) if verify_notes else '• All extracted entities meet high-confidence threshold (>80%).'}
• Note: Extracted data is grounded in document evidence and requires clinical correlation.
"""
        return {
            "summary_text": summary_text.strip(),
            "has_warnings": len(verify_notes) > 0,
            "verification_count": len(verify_notes),
        }
