import json
import logging
from pathlib import Path
import time
from typing import Any, Dict, List
from backend.ai.classifier import DocumentClassifier
from backend.ai.extractor import MedicalEntityExtractor
from backend.ai.gemini_extractor import gemini_extractor
from backend.ai.summarizer import PhysicianSummarizer
from backend.ai.timeline import ClinicalTimelineBuilder
from backend.config import BASE_DIR, CONFIDENCE_THRESHOLD, PROCESSED_DIR
from backend.ocr.ocr_engine import ocr_engine
from backend.ocr.preprocessing import preprocess_image
from backend.redis_client import redis_client

logger = logging.getLogger("MediKiosk.Worker")


def normalize_bounding_box(bbox: Any, orig_w: int, orig_h: int) -> List[int]:
    """Converts normalized 0-1000 [ymin, xmin, ymax, xmax] or existing box to [x1, y1, x2, y2]."""
    if not bbox or not isinstance(bbox, (list, tuple)) or len(bbox) != 4:
        return [0, 0, 0, 0]
    # Check if normalized 0-1000
    if max(bbox) <= 1000 and (bbox[2] > bbox[0] or bbox[3] > bbox[1]):
        ymin, xmin, ymax, xmax = bbox
        x1 = int(round((xmin / 1000.0) * orig_w))
        y1 = int(round((ymin / 1000.0) * orig_h))
        x2 = int(round((xmax / 1000.0) * orig_w))
        y2 = int(round((ymax / 1000.0) * orig_h))
        return [x1, y1, x2, y2]
    # Otherwise treat as standard pixel box
    return [int(bbox[0]), int(bbox[1]), int(bbox[2]), int(bbox[3])]


def find_matching_bbox(name: str, ocr_blocks: List[Dict[str, Any]]) -> List[int]:
    """Finds closest OCR block coordinates for an extracted entity name."""
    name_clean = name.lower()
    for b in ocr_blocks:
        t = b.get("text", "").lower()
        if name_clean in t or any(w in t for w in name_clean.split() if len(w) > 3):
            return b.get("bbox", [0, 0, 0, 0])
    return [0, 0, 0, 0]


def process_single_task(task: Dict[str, Any]):
    """Executes the complete Document Intelligence pipeline with doctor handwriting scan."""
    doc_id = task["document_id"]
    image_path = task["image_path"]
    original_filename = task.get("original_filename", "document.jpg")

    logger.info("⚡ [Doc: %s] Starting Document Intelligence Pipeline...", doc_id)

    try:
        # STAGE 1: OpenCV Handwriting Enhancement
        redis_client.update_document_status(
            doc_id=doc_id,
            status="preprocessing",
            progress=25,
            stage="Scanning Handwriting (Contrast Enhancement & Filtering)",
            details="Deskewing and enhancing faint doctor handwriting ink using CLAHE & Bilateral filtering.",
        )
        time.sleep(0.2)

        processed_filename = f"proc_{Path(image_path).name}"
        processed_path = str(PROCESSED_DIR / processed_filename)
        _, orig_dims = preprocess_image(image_path, processed_path)
        orig_w, orig_h = orig_dims

        # STAGE 2: OCR Spatial Text Recognition
        redis_client.update_document_status(
            doc_id=doc_id,
            status="ocr_processing",
            progress=45,
            stage="OCR Spatial Bounding Box Recognition",
            details="Extracting spatial text blocks and coordinate boundaries via PaddleOCR.",
        )
        time.sleep(0.2)

        scale_factor = 2.2 if orig_w < 800 else 1.4
        ocr_blocks = ocr_engine.extract_text_and_boxes(
            processed_path, scale_factor=scale_factor, orig_dims=orig_dims
        )

        # STAGE 3: Medical AI Handwriting Understanding
        redis_client.update_document_status(
            doc_id=doc_id,
            status="extracting_entities",
            progress=70,
            stage="Medical AI Handwriting Deciphering & Extraction",
            details="Interpreting doctor handwriting: medications, dosage, frequency, vitals, and diagnosis.",
        )
        time.sleep(0.2)

        # Call Multimodal Vision AI for handwriting extraction
        handwriting_data = {}
        try:
            handwriting_data = gemini_extractor.extract_handwritten_intelligence(
                image_path=image_path, ocr_blocks=ocr_blocks
            )
        except Exception as e:
            logger.warning("[Doc: %s] Multimodal handwriting extractor error: %s", doc_id, e)


        # Merge / Format Entities
        if handwriting_data and (
            handwriting_data.get("medications")
            or handwriting_data.get("diagnosis")
            or handwriting_data.get("investigations")
            or handwriting_data.get("vitals")
        ):
            logger.info(" Multimodal Handwriting AI successfully extracted clinical data")
            doc_type = handwriting_data.get("document_type", "PRESCRIPTION")
            doc_type_conf = float(handwriting_data.get("document_type_confidence", 0.95))
            patient_info = handwriting_data.get("patient_info", {})
            diagnosis_list = handwriting_data.get("diagnosis", [])
            advice_list = handwriting_data.get("advice", [])
            safety_alerts = handwriting_data.get("safety_alerts", [])

            # Format Medications
            medications = []
            for idx, m in enumerate(handwriting_data.get("medications", [])):
                conf = float(m.get("confidence", 0.92))
                raw_bbox = m.get("bbox") or (m.get("source", {}).get("bbox") if isinstance(m.get("source"), dict) else None) or find_matching_bbox(m.get("name", ""), ocr_blocks)
                pixel_bbox = normalize_bounding_box(raw_bbox, orig_w, orig_h)
                needs_v = bool(m.get("needs_verification") or m.get("requires_verification") or conf < CONFIDENCE_THRESHOLD)

                medications.append({
                    "name": str(m.get("name", "Medication")).strip(),
                    "form": m.get("form", "Tab"),
                    "dose": m.get("dose") or m.get("dosage") or "As directed",
                    "frequency": m.get("frequency") or m.get("instructions") or "1-0-1",
                    "duration": m.get("duration", ""),
                    "confidence": round(conf, 2),
                    "needs_verification": needs_v,
                    "source_text": m.get("source_text") or m.get("name", ""),
                    "source": {"page": 1, "text": m.get("source_text", ""), "bbox": pixel_bbox},
                })

            # Format Investigations
            investigations = []
            for idx, inv in enumerate(handwriting_data.get("investigations", [])):
                conf = float(inv.get("confidence", 0.90))
                raw_bbox = inv.get("bbox") or (inv.get("source", {}).get("bbox") if isinstance(inv.get("source"), dict) else None) or find_matching_bbox(inv.get("name", ""), ocr_blocks)
                pixel_bbox = normalize_bounding_box(raw_bbox, orig_w, orig_h)
                needs_v = bool(inv.get("needs_verification") or inv.get("requires_verification") or conf < CONFIDENCE_THRESHOLD)

                investigations.append({
                    "name": str(inv.get("name", "Investigation")).strip(),
                    "value": str(inv.get("value", "")).strip(),
                    "unit": inv.get("unit", ""),
                    "reference_range": inv.get("reference_range", ""),
                    "status": inv.get("status", "Normal"),
                    "confidence": round(conf, 2),
                    "needs_verification": needs_v,
                    "source": {"page": 1, "text": inv.get("source_text", ""), "bbox": pixel_bbox},
                })

            # Format Vitals
            vitals = []
            raw_vitals = handwriting_data.get("vitals", [])
            if isinstance(raw_vitals, dict):
                # Convert dict format to list
                for k, v in raw_vitals.items():
                    if v:
                        v_name = k.replace("_", " ").title()
                        vitals.append({
                            "name": v_name,
                            "value": str(v),
                            "unit": "",
                            "confidence": 0.94,
                            "needs_verification": False,
                            "source": {"page": 1, "text": f"{v_name}: {v}", "bbox": find_matching_bbox(v_name, ocr_blocks)},
                        })
            elif isinstance(raw_vitals, list):
                for v in raw_vitals:
                    conf = float(v.get("confidence", 0.94))
                    raw_bbox = v.get("bbox") or (v.get("source", {}).get("bbox") if isinstance(v.get("source"), dict) else None) or find_matching_bbox(v.get("name", ""), ocr_blocks)
                    vitals.append({
                        "name": v.get("name", "Vital"),
                        "value": str(v.get("value", "")),
                        "unit": v.get("unit", ""),
                        "confidence": round(conf, 2),
                        "needs_verification": conf < CONFIDENCE_THRESHOLD,
                        "source": {"page": 1, "text": v.get("source_text", ""), "bbox": normalize_bounding_box(raw_bbox, orig_w, orig_h)},
                    })

            entities = {
                "document_date": patient_info.get("date"),
                "patient_info": patient_info,
                "diagnosis": diagnosis_list,
                "medications": medications,
                "investigations": investigations,
                "vitals": vitals,
                "advice": advice_list,
                "safety_alerts": safety_alerts,
            }
            classification = {"document_type": doc_type, "confidence": doc_type_conf, "all_scores": {}}

        else:
            # Fallback to local rule-based extractor
            logger.info("Using local regex rule-based extractor fallback")
            classification = DocumentClassifier.classify(ocr_blocks)
            entities = MedicalEntityExtractor.extract_entities(ocr_blocks)

        # Unverified items for doctor review
        unverified_items = []
        for idx, med in enumerate(entities.get("medications", [])):
            if med.get("needs_verification"):
                unverified_items.append({
                    "entity_type": "medication",
                    "index": idx,
                    "name": med.get("name"),
                    "dose": med.get("dose"),
                    "confidence": med.get("confidence"),
                    "source_text": med.get("source_text", ""),
                    "bbox": med.get("source", {}).get("bbox", []),
                })

        for idx, lab in enumerate(entities.get("investigations", [])):
            if lab.get("needs_verification"):
                unverified_items.append({
                    "entity_type": "investigation",
                    "index": idx,
                    "name": lab.get("name"),
                    "value": lab.get("value"),
                    "unit": lab.get("unit"),
                    "confidence": lab.get("confidence"),
                    "source_text": lab.get("source", {}).get("text", ""),
                    "bbox": lab.get("source", {}).get("bbox", []),
                })

        # STAGE 4: Clinical Timeline & Physician Summary
        redis_client.update_document_status(
            doc_id=doc_id,
            status="generating_summary",
            progress=90,
            stage="Synthesizing Clinical Timeline & Physician Summary",
            details="Formatting evidence-grounded clinical history and doctor review notes.",
        )
        time.sleep(0.2)

        # Add milestone to timeline
        ClinicalTimelineBuilder.build_event_from_document(
            doc_id=doc_id,
            doc_type=classification["document_type"],
            entities=entities,
        )

        summary_result = PhysicianSummarizer.generate_summary(
            doc_id=doc_id,
            doc_type=classification["document_type"],
            entities=entities,
            unverified_items=unverified_items,
        )

        # STAGE 5: Completion & Storage in Redis
        full_result = {
            "document_id": doc_id,
            "original_filename": original_filename,
            "image_filename": Path(image_path).name,
            "processed_filename": processed_filename,
            "orig_dimensions": orig_dims,
            "document_type": classification["document_type"],
            "document_type_confidence": classification["confidence"],
            "classification_details": classification.get("all_scores", {}),
            "ocr_blocks": ocr_blocks,
            "extracted_entities": entities,
            "unverified_items": unverified_items,
            "summary": summary_result,
            "status": "completed",
            "processed_at": time.time(),
        }

        # Cache structured result in Redis
        redis_client.save_document_result(doc_id, full_result)

        # Update final state in Redis
        redis_client.update_document_status(
            doc_id=doc_id,
            status="completed",
            progress=100,
            stage="Handwriting Scan & Extraction Completed",
            details=f"Extracted {len(entities.get('medications', []))} meds, {len(entities.get('investigations', []))} labs, {len(entities.get('vitals', []))} vitals. Ready for Doctor Review.",
        )
        logger.info(" [Doc: %s] Pipeline finished successfully!", doc_id)

    except Exception as err:
        logger.exception("❌ [Doc: %s] Pipeline failure: %s", doc_id, err)
        redis_client.update_document_status(
            doc_id=doc_id,
            status="failed",
            progress=0,
            stage="Processing Error",
            details=str(err),
        )


def start_worker(stop_event=None):
    """Continuous worker loop polling Redis task queue."""
    logger.info(" Redis Pipeline Worker started. Listening on queue...")
    while True:
        if stop_event and stop_event.is_set():
            logger.info("Worker stop event detected. Exiting worker loop.")
            break

        task = redis_client.pop_document_task(timeout=1)
        if task:
            process_single_task(task)
        else:
            time.sleep(0.05)


if __name__ == "__main__":
    start_worker()
