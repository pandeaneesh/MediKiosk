import uuid
import logging
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.models.schemas import (
    SessionState, StartSessionRequest, ChatRequest, ChatResponse,
    EditFieldRequest, EmergencyTriggerRequest, OCRInjectRequest,
    DoctorSummary, RedFlagDetail, MedicalSystemEnum, TTSRequest, TTSResponse
)
from app.storage.session_store import session_store
from app.engine.socrates_engine import SocratesEngine
from app.engine.summary_generator import SummaryGenerator
from app.engine.ocr_connector import ocr_connector
from app.engine.bhashini_service import bhashini_service

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="MediKiosk Multilingual Conversational AI Backend with Dual Allopathy & AYUSH Clinical Pathways"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.post("/api/session/start", response_model=ChatResponse)
def start_session(req: StartSessionRequest):
    session_id = f"kiosk-{uuid.uuid4().hex[:8]}"
    lang = (req.language or settings.DEFAULT_LANGUAGE).lower()
    
    ai_msg, session = SocratesEngine.create_initial_session(session_id, lang)
    if req.medical_system:
        if "ayush" in req.medical_system.lower():
            session.medical_system = MedicalSystemEnum.AYUSH
            session.system_type = "ayush"
        else:
            session.medical_system = MedicalSystemEnum.ALLOPATHY
            session.system_type = "allopathy"

    session_store.save_session(session)

    return ChatResponse(
        session_id=session.session_id,
        medical_system=session.system_type,
        language=session.language,
        current_phase=session.current_phase,
        progress_percentage=session.progress_percentage,
        ai_message=ai_msg,
        clinical_data=session.clinical_data,
        red_flag=len(session.red_flags) > 0,
        red_flag_details=session.red_flags,
        is_completed=session.is_completed,
        doctor_summary=session.doctor_summary
    )

@app.post("/api/chat", response_model=ChatResponse)
async def chat_interaction(req: ChatRequest):
    session = session_store.get_session(req.session_id)
    if not session:
        # Auto-create if session expired or direct test call
        ai_msg, session = SocratesEngine.create_initial_session(req.session_id, req.language or settings.DEFAULT_LANGUAGE)

    # Sync requested language if explicitly provided
    if req.language and req.language.lower() in settings.SUPPORTED_LANGUAGES:
        session.language = req.language.lower()

    # Process voice base64 if provided and text is empty
    user_text = req.message or ""
    if req.audio_base64 and not user_text:
        asr_transcript = await bhashini_service.speech_to_text(req.audio_base64, session.language)
        if asr_transcript:
            user_text = asr_transcript

    ai_msg, updated_session = SocratesEngine.process_message(
        session,
        message=user_text,
        selected_option=req.selected_option
    )

    session_store.save_session(updated_session)

    return ChatResponse(
        session_id=updated_session.session_id,
        medical_system=updated_session.system_type,
        language=updated_session.language,
        current_phase=updated_session.current_phase,
        progress_percentage=updated_session.progress_percentage,
        ai_message=ai_msg,
        clinical_data=updated_session.clinical_data,
        red_flag=len(updated_session.red_flags) > 0,
        red_flag_details=updated_session.red_flags,
        is_completed=updated_session.is_completed,
        doctor_summary=updated_session.doctor_summary
    )

@app.get("/api/session/{session_id}")
def get_session_details(session_id: str):
    session = session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@app.get("/api/session/{session_id}/summary", response_model=DoctorSummary)
def get_doctor_summary(session_id: str):
    session = session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if not session.doctor_summary:
        session.doctor_summary = SummaryGenerator.generate_summary(session)
        session_store.save_session(session)

    return session.doctor_summary

@app.post("/api/session/{session_id}/edit")
def edit_clinical_field(session_id: str, req: EditFieldRequest):
    session = session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if hasattr(session.clinical_data, req.field_name):
        setattr(session.clinical_data, req.field_name, req.new_value)
        session.doctor_summary = SummaryGenerator.generate_summary(session)
        session_store.save_session(session)
        return {
            "status": "updated",
            "field_name": req.field_name,
            "clinical_data": session.clinical_data,
            "doctor_summary": session.doctor_summary
        }
    else:
        raise HTTPException(status_code=400, detail=f"Invalid field: {req.field_name}")

@app.post("/api/emergency/trigger")
def trigger_emergency(req: EmergencyTriggerRequest):
    session = session_store.get_session(req.session_id)
    alert = RedFlagDetail(
        flag_name="Emergency Nurse Station Activated",
        description=f"Manual or high-urgency escalation triggered: {req.reason}",
        urgency="CRITICAL",
        recommended_action="Immediate triage nurse dispatch and bedside assessment."
    )
    if session:
        session.red_flags.append(alert)
        session_store.save_session(session)

    return {
        "status": "alert_dispatched",
        "hospital_unit": req.hospital_unit,
        "session_id": req.session_id,
        "alert": alert
    }

@app.post("/api/ocr/inject")
def inject_ocr(req: OCRInjectRequest):
    session = session_store.get_session(req.session_id)
    if not session:
        # Create a blank session if missing
        _, session = SocratesEngine.create_initial_session(req.session_id)

    updated_session = ocr_connector.inject_document_data(
        session,
        doc_type=req.document_type,
        extracted_text=req.extracted_text
    )
    session_store.save_session(updated_session)

    return {
        "status": "ocr_injected",
        "session_id": req.session_id,
        "clinical_data": updated_session.clinical_data
    }

@app.post("/api/tts", response_model=TTSResponse)
async def synthesize_speech(req: TTSRequest):
    """Synthesize text to speech using Bhashini ASR/TTS pipeline with fallback indicator."""
    if not req.text.strip():
        return TTSResponse(success=False, language=req.language, message="Empty text provided")

    audio_base64 = await bhashini_service.text_to_speech(req.text, req.language, req.gender or "female")
    if audio_base64:
        return TTSResponse(
            success=True,
            audio_base64=audio_base64,
            language=req.language,
            message="Bhashini audio synthesized successfully"
        )
    return TTSResponse(
        success=False,
        language=req.language,
        message="Bhashini credentials not set or unavailable. Use client Web Speech fallback."
    )
