from __future__ import annotations
from enum import Enum
from typing import List, Dict, Any, Optional, Union
from datetime import datetime, timezone
from pydantic import BaseModel, Field

class MedicalSystemEnum(str, Enum):
    ALLOPATHY = "allopathy"
    AYUSH = "ayush"

class SessionPhase(str, Enum):
    SELECT_SYSTEM = "select_system"
    LANGUAGE_SELECT = "language_select"
    CONSENT = "consent"
    CHIEF_COMPLAINT = "chief_complaint"
    SOCRATES_QUESTIONS = "socrates_questions"
    AYURVEDA_DASHAVIDHA = "ayurveda_dashavidha"
    MEDICAL_HISTORY = "medical_history"
    MEDICATION_HISTORY = "medication_history"
    ALLERGIES = "allergies"
    REVIEW_CONFIRMATION = "review_confirmation"
    COMPLETED = "completed"
    EMERGENCY_ESCALATION = "emergency_escalation"

class QuestionType(str, Enum):
    SYSTEM_SELECT = "system_select"
    LANGUAGE_SELECT = "language_select"
    CONSENT = "consent"
    OPEN_TEXT = "open_text"
    SINGLE_CHOICE = "single_choice"
    MULTI_CHOICE = "multi_choice"
    PAIN_SCALE = "pain_scale"
    CONFIRMATION = "confirmation"

class QuickOption(BaseModel):
    label: str
    value: str
    subtitle: Optional[str] = None
    icon: Optional[str] = None

class ChatMessage(BaseModel):
    id: str
    role: str  # "ai" | "patient" | "system"
    content: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    options: List[QuickOption] = []
    question_type: QuestionType = QuestionType.OPEN_TEXT
    language: str = "english"
    audio_base64: Optional[str] = None

class RedFlagDetail(BaseModel):
    flag_name: str
    description: str
    urgency: str = "URGENT"  # "URGENT" | "CRITICAL"
    recommended_action: Optional[str] = None
    timestamp: Optional[str] = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class DashavidhaParikshaData(BaseModel):
    prakriti: Optional[Dict[str, Any]] = None
    vikriti: Optional[Dict[str, Any]] = None
    sara: Optional[str] = None
    samhanana: Optional[str] = None
    pramana: Optional[str] = None
    satmya: Optional[List[str]] = None
    satva: Optional[str] = None
    ahara_shakti: Optional[Dict[str, Any]] = None
    vyayama_shakti: Optional[str] = None
    vaya: Optional[str] = None

class ClinicalData(BaseModel):
    chief_complaint: Optional[str] = None
    symptom: Optional[str] = None
    site: Optional[str] = None
    onset: Optional[str] = None
    character: Optional[str] = None
    radiation: Optional[str] = None
    associated_symptoms: List[str] = Field(default_factory=list)
    timing: Optional[str] = None
    aggravating_factors: List[str] = Field(default_factory=list)
    relieving_factors: List[str] = Field(default_factory=list)
    severity: Optional[int] = None
    duration: Optional[str] = None
    previous_occurrences: Optional[str] = None
    medical_history: List[str] = Field(default_factory=list)
    medication_history: List[str] = Field(default_factory=list)
    allergies: List[str] = Field(default_factory=list)
    dashavidha_pariksha: Optional[DashavidhaParikshaData] = Field(default_factory=DashavidhaParikshaData)
    red_flags: List[str] = Field(default_factory=list)
    patient_own_words: List[str] = Field(default_factory=list)
    missing_information: List[str] = Field(default_factory=list)

class DoctorSummary(BaseModel):
    patient_id: str
    session_id: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    medical_system: str
    language_used: str
    patient_complaint: str
    socrates_summary: Optional[Dict[str, Any]] = None
    dashavidha_pariksha: Optional[Dict[str, Any]] = None
    chronic_history: List[str] = Field(default_factory=list)
    current_medications: List[str] = Field(default_factory=list)
    allergies: List[str] = Field(default_factory=list)
    triage_level: str = "STANDARD"  # "STANDARD" | "PRIORITY" | "EMERGENCY"
    red_flags: List[RedFlagDetail] = Field(default_factory=list)
    ai_note: str
    transcript_excerpt: List[ChatMessage] = Field(default_factory=list)

class SessionState(BaseModel):
    session_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    medical_system: MedicalSystemEnum = MedicalSystemEnum.ALLOPATHY
    system_type: str = "allopathy"
    language: str = "english"
    current_phase: SessionPhase = SessionPhase.SELECT_SYSTEM
    current_question_key: Optional[str] = None
    progress_percentage: int = 5
    is_completed: bool = False
    slots_covered: List[str] = Field(default_factory=list)
    clinical_data: ClinicalData = Field(default_factory=ClinicalData)
    messages: List[ChatMessage] = Field(default_factory=list)
    red_flags: List[RedFlagDetail] = Field(default_factory=list)
    doctor_summary: Optional[DoctorSummary] = None

# API Request / Response models
class StartSessionRequest(BaseModel):
    language: Optional[str] = "english"
    medical_system: Optional[str] = None

class ChatRequest(BaseModel):
    session_id: str
    message: Optional[str] = ""
    selected_option: Optional[str] = None
    language: Optional[str] = None
    audio_base64: Optional[str] = None

class ChatResponse(BaseModel):
    session_id: str
    medical_system: str
    language: str = "english"
    current_phase: SessionPhase
    progress_percentage: int
    ai_message: ChatMessage
    clinical_data: ClinicalData
    red_flag: bool = False
    red_flag_details: List[RedFlagDetail] = Field(default_factory=list)
    is_completed: bool = False
    doctor_summary: Optional[DoctorSummary] = None

class EditFieldRequest(BaseModel):
    session_id: str
    field_name: str
    new_value: Any

class EmergencyTriggerRequest(BaseModel):
    session_id: str
    hospital_unit: Optional[str] = "Emergency Triage & Resuscitation"
    reason: str

class OCRInjectRequest(BaseModel):
    session_id: str
    document_type: str = "prescription"
    extracted_text: str

class TTSRequest(BaseModel):
    text: str
    language: str = "hindi"
    gender: Optional[str] = "female"

class TTSResponse(BaseModel):
    success: bool
    audio_base64: Optional[str] = None
    language: str
    format: str = "wav"
    message: Optional[str] = None

