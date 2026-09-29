import logging
import os
from pathlib import Path
import shutil
import time
import uuid
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from backend.ai.gemini_extractor import gemini_extractor
from backend.ai.summarizer import PhysicianSummarizer
from backend.ai.timeline import ClinicalTimelineBuilder
from backend.config import (
    ALLOWED_EXTENSIONS,
    FRONTEND_DIR,
    PROCESSED_DIR,
    SAMPLES_DIR,
    UPLOAD_DIR,
)
from backend.redis_client import redis_client

logger = logging.getLogger("MediKiosk.API")

app = FastAPI(
    title="MediKiosk Medical Document Intelligence (MDI)",
    description="Redis-driven clinical OCR & medical document intelligence pipeline",
    version="2.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static directories
app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")
app.mount("/api/files/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
app.mount("/api/files/processed", StaticFiles(directory=str(PROCESSED_DIR)), name="processed")
app.mount("/api/files/samples", StaticFiles(directory=str(SAMPLES_DIR)), name="samples")


class VerificationPayload(BaseModel):
    entity_type: str
    index: int
    name: str
    dose: str = ""
    frequency: str = ""
    value: str = ""
    unit: str = ""
    verified: bool = True


class AIKeyPayload(BaseModel):
    api_key: str


@app.get("/api/config/ai-status")
async def get_ai_status():
    configured = gemini_extractor.is_configured
    key = gemini_extractor.api_key or ""
    masked = f"{key[:6]}...{key[-4:]}" if len(key) > 10 else ""
    return {
        "configured": configured,
        "mode": "Gemini Multimodal Vision AI (Active)" if configured else "Local OCR & Indian Pharmacopoeia Engine (Active)",
        "masked_key": masked,
    }


@app.post("/api/config/ai-key")
async def set_ai_key(payload: AIKeyPayload):
    success = gemini_extractor.set_api_key(payload.api_key)
    return {
        "success": success,
        "configured": gemini_extractor.is_configured,
        "message": "Gemini Vision AI activated for medical handwriting deciphering" if success else "Invalid API key (Google Gemini keys begin with AIzaSy)",
    }


@app.get("/")
async def serve_index():
    index_file = FRONTEND_DIR / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return {"message": "MediKiosk Document Intelligence API is active"}


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "redis_live": redis_client.is_live,
        "mode": "Live Redis" if redis_client.is_live else "Resilient Embedded Redis (Zero-Setup)",
        "timestamp": time.time(),
    }


@app.post("/api/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed: {ALLOWED_EXTENSIONS}",
        )

    doc_id = f"DOC-{uuid.uuid4().hex[:8].upper()}"
    filename = f"{doc_id}_{file.filename}"
    save_path = UPLOAD_DIR / filename

    try:
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        logger.error("Failed to save uploaded file: %s", e)
        raise HTTPException(status_code=500, detail="Failed to write document to disk")

    # Enqueue task into Redis
    redis_client.enqueue_document_task(
        doc_id=doc_id,
        image_path=str(save_path),
        original_filename=file.filename,
    )

    return {
        "document_id": doc_id,
        "filename": file.filename,
        "status": "uploaded",
        "message": "Document received and queued in Redis for processing",
    }


@app.get("/api/documents/{doc_id}/status")
async def get_document_status(doc_id: str):
    status_info = redis_client.get_document_status(doc_id)
    if not status_info or status_info.get("status") == "not_found":
        raise HTTPException(status_code=404, detail="Document ID not found in Redis")
    return status_info


@app.get("/api/documents/{doc_id}/result")
async def get_document_result(doc_id: str):
    result = redis_client.get_document_result(doc_id)
    if not result:
        # Check current progress
        status_info = redis_client.get_document_status(doc_id)
        return {
            "document_id": doc_id,
            "status": status_info.get("status", "processing"),
            "progress": status_info.get("progress", 10),
            "stage": status_info.get("stage", "In Queue"),
            "result": None,
        }
    return {"document_id": doc_id, "status": "completed", "result": result}


@app.post("/api/documents/{doc_id}/verify")
async def verify_entity(doc_id: str, payload: VerificationPayload):
    result = redis_client.get_document_result(doc_id)
    if not result:
        raise HTTPException(status_code=404, detail="Document result not found")

    entities = result.get("extracted_entities", {})
    if payload.entity_type == "medication":
        meds = entities.get("medications", [])
        if 0 <= payload.index < len(meds):
            meds[payload.index]["name"] = payload.name
            if payload.dose:
                meds[payload.index]["dose"] = payload.dose
            if payload.frequency:
                meds[payload.index]["frequency"] = payload.frequency
            meds[payload.index]["needs_verification"] = False
            meds[payload.index]["doctor_verified"] = True
    elif payload.entity_type == "investigation":
        labs = entities.get("investigations", [])
        if 0 <= payload.index < len(labs):
            labs[payload.index]["name"] = payload.name
            if payload.value:
                labs[payload.index]["value"] = payload.value
            if payload.unit:
                labs[payload.index]["unit"] = payload.unit
            labs[payload.index]["needs_verification"] = False
            labs[payload.index]["doctor_verified"] = True

    # Re-filter unverified items
    remaining_unverified = []
    for idx, med in enumerate(entities.get("medications", [])):
        if med.get("needs_verification"):
            remaining_unverified.append({
                "entity_type": "medication",
                "index": idx,
                "name": med.get("name"),
                "confidence": med.get("confidence"),
                "source_text": med.get("source_text", ""),
                "bbox": med.get("source", {}).get("bbox", []),
            })
    for idx, lab in enumerate(entities.get("investigations", [])):
        if lab.get("needs_verification"):
            remaining_unverified.append({
                "entity_type": "investigation",
                "index": idx,
                "name": lab.get("name"),
                "confidence": lab.get("confidence"),
                "source_text": lab.get("source", {}).get("text", ""),
                "bbox": lab.get("source", {}).get("bbox", []),
            })

    result["unverified_items"] = remaining_unverified

    # Regenerate physician summary
    new_summary = PhysicianSummarizer.generate_summary(
        doc_id=doc_id,
        doc_type=result.get("document_type", "PRESCRIPTION"),
        entities=entities,
        unverified_items=remaining_unverified,
    )
    result["summary"] = new_summary

    # Save back to Redis
    redis_client.save_document_result(doc_id, result)
    return {"status": "success", "message": "Doctor verification saved", "result": result}


@app.get("/api/timeline")
async def get_patient_timeline():
    events = ClinicalTimelineBuilder.get_consolidated_timeline()
    return {"timeline": events}


@app.get("/api/samples")
async def list_sample_presets():
    samples = [
        {
            "id": "sample_handwritten",
            "title": "Doctor Handwritten Prescription Slip",
            "type": "PRESCRIPTION",
            "tags": ["Doctor Handwriting", "Clinical Decipher", "Vitals", "Fluid Regimen"],
            "filename": "sample_handwritten.jpeg",
            "description": "Authentic Indian handwritten doctor prescription slip with cursive handwriting, clinical impression, vitals, and fluid regimen.",
        },
        {
            "id": "sample_prescription",
            "title": "Dr. Rajesh Sharma OPD Prescription",
            "type": "PRESCRIPTION",
            "tags": ["Diabetes", "Hypertension", "Metformin 500mg", "HbA1c 8.2%"],
            "filename": "sample_prescription.png",
            "description": "Realistic clinical prescription with OPD header, vitals, lab findings, Rx table, and doctor sign-off.",
        },
        {
            "id": "sample_lab_report",
            "title": "Metropolis Diagnostic Pathology Report",
            "type": "LAB_REPORT",
            "tags": ["HbA1c", "Blood Sugar", "Lipid Profile", "Creatinine"],
            "filename": "sample_lab_report.png",
            "description": "Multi-parameter metabolic laboratory investigation with numerical findings and standard reference ranges.",
        },
        {
            "id": "sample_discharge_summary",
            "title": "Apex Hospital Discharge Summary",
            "type": "DISCHARGE_SUMMARY",
            "tags": ["Inpatient Admission", "Hyperglycemic Episode", "Discharge Meds"],
            "filename": "sample_discharge_summary.png",
            "description": "Comprehensive hospital discharge card covering clinical course, final diagnosis, and continuation regimen.",
        },
    ]
    return {"samples": samples}


@app.post("/api/samples/{sample_id}/load")
async def load_sample_document(sample_id: str):
    # Try finding matching file
    sample_path = SAMPLES_DIR / f"{sample_id}.png"
    ext = ".png"
    if not sample_path.exists():
        sample_path = SAMPLES_DIR / f"{sample_id}.jpeg"
        ext = ".jpeg"
    if not sample_path.exists():
        sample_path = SAMPLES_DIR / f"{sample_id}.jpg"
        ext = ".jpg"
    if not sample_path.exists():
        raise HTTPException(status_code=404, detail=f"Sample '{sample_id}' not found")

    filename = f"{sample_id}{ext}"
    doc_id = f"DOC-{sample_id[:4].upper()}-{uuid.uuid4().hex[:4].upper()}"
    dest_filename = f"{doc_id}_{filename}"
    dest_path = UPLOAD_DIR / dest_filename

    shutil.copyfile(str(sample_path), str(dest_path))

    # Push to Redis queue
    redis_client.enqueue_document_task(
        doc_id=doc_id,
        image_path=str(dest_path),
        original_filename=filename,
    )

    return {
        "document_id": doc_id,
        "filename": filename,
        "status": "uploaded",
        "message": f"Sample document '{sample_id}' enqueued into Redis pipeline",
    }
