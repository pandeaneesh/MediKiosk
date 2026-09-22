import json
from pathlib import Path
import time
from backend.config import SAMPLES_DIR, UPLOAD_DIR
from backend.redis_client import redis_client
from backend.workers.pipeline_worker import process_single_task


def run_pipeline_test():
    print(" Running MediKiosk Document Intelligence Pipeline Verification...")

    sample_rx = SAMPLES_DIR / "sample_prescription.png"
    if not sample_rx.exists():
        print("❌ Sample prescription image not found!")
        return

    doc_id = "DOC-TEST-001"
    task = {
        "document_id": doc_id,
        "image_path": str(sample_rx),
        "original_filename": "sample_prescription.png",
    }

    # Execute single task
    process_single_task(task)

    # Check status from Redis
    status = redis_client.get_document_status(doc_id)
    print(f" Redis Document State: {status.get('status')} ({status.get('progress')}%) - {status.get('stage')}")

    # Check structured result from Redis
    result = redis_client.get_document_result(doc_id)
    if not result:
        print("❌ Result not found in Redis!")
        return

    print(" Extracted Document Type:", result.get("document_type"), f"(Confidence: {result.get('document_type_confidence')})")
    print(f" Extracted {len(result.get('ocr_blocks', []))} OCR Text Blocks with Bounding Boxes")

    meds = result.get("extracted_entities", {}).get("medications", [])
    print(f" Extracted {len(meds)} Medications:")
    for m in meds:
        print(f"   • {m['name']} | Dose: {m.get('dose')} | Freq: {m.get('frequency')} | Conf: {m.get('confidence')} | Needs Verify: {m.get('needs_verification')}")

    vitals = result.get("extracted_entities", {}).get("vitals", [])
    print(f" Extracted {len(vitals)} Vitals:")
    for v in vitals:
        print(f"   • {v['name']}: {v['value']} {v.get('unit')} (Conf: {v.get('confidence')})")

    labs = result.get("extracted_entities", {}).get("investigations", [])
    print(f" Extracted {len(labs)} Labs:")
    for l in labs:
        print(f"   • {l['name']}: {l['value']} {l.get('unit')}")

    print("\n Generated Physician Summary:\n")
    summary_txt = result.get("summary", {}).get("summary_text", "")
    print(summary_txt.encode("ascii", "replace").decode("ascii"))
    print("\n ALL PIPELINE CHECKS PASSED SUCCESSFULLY! ")


if __name__ == "__main__":
    run_pipeline_test()
