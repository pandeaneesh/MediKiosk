try:
    from pydantic import BaseModel, Field
except ImportError:
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def dict(self):
            return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}
    def Field(*args, **kwargs):
        return None

from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Patient Schemas ---
class PatientVitals(BaseModel):
    bp: str = "120/80 mmHg"
    spo2: str = "98%"
    pulse: str = "72 bpm"
    temp: str = "98.6 °F"
    bmi: Optional[str] = "24.5"
    recordedAt: Optional[str] = None

class PatientSchema(BaseModel):
    patientId: str
    abhaNumber: Optional[str] = None
    abhaAddress: Optional[str] = None
    aadhaarNumber: Optional[str] = None
    fullName: str
    mobile: str
    email: Optional[str] = None
    age: int = 35
    gender: str = "Male"
    bloodGroup: str = "O+"
    address: str = "New Delhi, India"
    vitals: Optional[PatientVitals] = None
    hospitalId: Optional[str] = "HOSP-AIIMS-01"

class VerifyIdentifierRequest(BaseModel):
    identifier: str
    loginMethod: str = "abha" # 'abha', 'aadhaar', 'mobile', 'email'

class SendOtpRequest(BaseModel):
    mobile: Optional[str] = None
    identifier: Optional[str] = None
    loginMethod: Optional[str] = "abha"
    email: Optional[str] = None
    fullName: Optional[str] = None

class VerifyOtpRequest(BaseModel):
    mobile: Optional[str] = None
    identifier: Optional[str] = None
    otp: Optional[str] = None
    code: Optional[str] = None
    email: Optional[str] = None
    loginMethod: Optional[str] = "abha"

class RegisterPatientRequest(BaseModel):
    fullName: str
    mobile: str
    abhaNumber: Optional[str] = None
    abhaAddress: Optional[str] = None
    aadhaarNumber: Optional[str] = None
    email: Optional[str] = None
    gender: str = "Male"
    age: int = 30
    address: str = "New Delhi, India"
    symptoms: Optional[str] = "General Medicine / OPD Consultation"
    dashvidhaHistory: Optional[Dict[str, Any]] = None
    vitals: Optional[Dict[str, Any]] = None
    hospitalId: Optional[str] = "HOSP-AIIMS-01"

class UpdatePatientProfileRequest(BaseModel):
    fullName: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    bloodGroup: Optional[str] = None
    vitals: Optional[Dict[str, Any]] = None

class IssueTicketRequest(BaseModel):
    patientId: str
    department: str
    doctorId: str
    kioskId: str = "K-01"
    email: Optional[str] = None

class BookAppointmentRequest(BaseModel):
    patientId: str
    doctorId: str
    hospitalId: Optional[str] = "HOSP-AIIMS-01"
    department: str
    appointmentDate: str
    timeSlot: str
    tokenNumber: Optional[str] = None

# --- AI Interview Schemas ---
class StartInterviewRequest(BaseModel):
    patientId: str
    appointmentId: Optional[str] = None
    doctorId: Optional[str] = None
    medicalSystem: Optional[str] = "allopathy" # 'allopathy' or 'ayush'
    language: Optional[str] = "english"

class InterviewChatRequest(BaseModel):
    sessionId: str
    patientId: str
    message: Optional[str] = ""
    selectedOption: Optional[str] = None
    language: Optional[str] = "english"
    audioBase64: Optional[str] = None
    medicalSystem: Optional[str] = "allopathy"
    history: Optional[List[Dict[str, Any]]] = None

class SaveInterviewRequest(BaseModel):
    patientId: str
    appointmentId: Optional[str] = None
    doctorId: Optional[str] = None
    sessionId: str
    complaint: Optional[str] = None
    symptoms: Optional[str] = None
    duration: Optional[str] = None
    severity: Optional[int] = 5
    painLocation: Optional[str] = None
    painIntensity: Optional[int] = None
    medicalSystem: Optional[str] = "allopathy"
    language: Optional[str] = "english"
    aiSummary: Optional[Dict[str, Any]] = None
    clinicalData: Optional[Dict[str, Any]] = None
    dashvidhaHistory: Optional[Dict[str, Any]] = None
    dashavidha: Optional[Dict[str, Any]] = None
    messages: Optional[List[Dict[str, Any]]] = None
    redFlags: Optional[List[Dict[str, Any]]] = None
    isCompleted: Optional[bool] = True

# --- 3D Pain Mapping Schemas ---
class SavePainMappingRequest(BaseModel):
    patientId: str
    interviewId: Optional[str] = None
    patientGender: Optional[str] = "male"
    bodyRegion: str
    side: Optional[str] = "center"
    location: Optional[str] = "middle"
    painIntensity: Optional[int] = 5
    painType: Optional[str] = "Aching"
    laymanSummary: str
    coordinates: Optional[Any] = None
    severity: Optional[int] = 5
    painType: Optional[str] = "Aching"
    duration: Optional[str] = "Recent"
    aggravatingFactors: Optional[str] = "None"
    timestamp: Optional[str] = None

class LaunchPainMappingRequest(BaseModel):
    patientId: Optional[str] = "PT-NEW"
    patientGender: Optional[str] = "male"

# --- Medical Document Schemas ---
class SaveDocumentRequest(BaseModel):
    patientId: str
    appointmentId: Optional[str] = None
    title: str
    filename: str
    fileType: str = "image/jpeg"
    documentType: str = "PRESCRIPTION"
    extractedText: Optional[str] = ""
    entitiesJson: Optional[Dict[str, Any]] = None
    summary: Optional[str] = ""
    fileUrl: Optional[str] = ""
    status: Optional[str] = "completed"

# --- Doctor & Consultation Schemas ---
class DoctorSchema(BaseModel):
    doctorId: str
    hospitalId: Optional[str] = "HOSP-AIIMS-01"
    name: str
    degrees: str
    institution: Optional[str] = ""
    specialty: str
    department: str
    roomNumber: str
    floorWing: str = "Ground Floor"
    status: str = "On Duty"
    patientsSeen: int = 0
    waitingCount: int = 0
    shift: str = "08:00 - 14:00"
    email: Optional[str] = None
    mobile: Optional[str] = None

class DoctorLoginRequest(BaseModel):
    doctorId: str
    pin: Optional[str] = "1234"

class CallNextPatientRequest(BaseModel):
    doctorId: str

class SaveConsultationRequest(BaseModel):
    patientId: str
    doctorId: Optional[str] = "doc-1"
    doctorName: Optional[str] = "Dr. Rajesh Sharma"
    appointmentId: Optional[str] = None
    ticketId: Optional[str] = None
    diagnosis: Optional[str] = "Clinical Examination Completed"
    prescription: Optional[List[Dict[str, Any]]] = None
    prescriptions: Optional[List[Any]] = None
    clinicalNotes: Optional[str] = ""
    notes: Optional[str] = ""
    advice: Optional[str] = ""
    orders: Optional[List[Any]] = None
    ayurvedicNotes: Optional[Dict[str, Any]] = None
    followUpDate: Optional[str] = None
    followUpDays: Optional[int] = None

# --- Admin Schemas ---
class AdminLoginRequest(BaseModel):
    username: str
    password: str

class RemoteKioskPrintRequest(BaseModel):
    kioskId: str

class ToggleDoctorStatusRequest(BaseModel):
    doctorId: str

class AddHospitalRequest(BaseModel):
    name: str
    code: Optional[str] = None
    city: str = "New Delhi"
    state: str = "Delhi"
    region: Optional[str] = "Northern Region"
    total_beds: Optional[int] = 500
    active_kiosks: Optional[int] = 4
    daily_patient_capacity: Optional[int] = 2500
    contact_number: Optional[str] = "+91-11-26000000"
    superintendent_name: Optional[str] = None
    superintendent_email: Optional[str] = None
    admin_email: Optional[str] = None
    admin_password: Optional[str] = None


