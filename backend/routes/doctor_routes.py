try:
    from fastapi import APIRouter, HTTPException
except ImportError:
    class APIRouter:
        def __init__(self, *args, **kwargs): pass
        def get(self, *args, **kwargs): return lambda f: f
        def post(self, *args, **kwargs): return lambda f: f
        def put(self, *args, **kwargs): return lambda f: f
        def delete(self, *args, **kwargs): return lambda f: f
    class HTTPException(Exception):
        def __init__(self, status_code=400, detail=""):
            self.status_code = status_code
            self.detail = detail

import os
import sys
import time
import json
import random
from typing import Optional, List, Dict, Any

from models.schemas import (
    DoctorLoginRequest,
    CallNextPatientRequest,
    SaveConsultationRequest
)
from config.sqlite_config import execute_query, execute_update
from config.redis_config import redis_engine
from config.jwt_helper import encode_jwt
from config.mongodb_config import save_doctor_to_mongo, find_doctor_in_mongo, get_all_doctors_from_mongo
from services.queue_service import SmartQueueEngine

router = APIRouter(prefix="/api/v1/doctor", tags=["Doctor OPD Clinical Chamber"])

def find_doctor_in_db(doctor_id: str):
    if not doctor_id:
        return None
    
    rows = execute_query(
        "SELECT * FROM local_master_doctors WHERE doctor_id = ? OR LOWER(name) LIKE ?",
        (doctor_id.strip(), f"%{doctor_id.strip().lower()}%")
    )
    if rows:
        d = rows[0]
        stream_val = d.get("stream") or ("ayush" if "ayu" in (d.get("department") or "").lower() else "allopathy")
        res = {
            "id": d["doctor_id"],
            "doctorId": d["doctor_id"],
            "doctor_id": d["doctor_id"],
            "name": d["name"],
            "degrees": d["degrees"],
            "specialty": d["specialty"],
            "department": d["department"],
            "roomNumber": d["room_number"],
            "room_number": d["room_number"],
            "floorWing": d["floor_wing"],
            "floor_wing": d["floor_wing"],
            "status": d["status"],
            "patientsSeen": d["patients_seen"],
            "patients_seen": d["patients_seen"],
            "waitingCount": d["waiting_count"],
            "waiting_count": d["waiting_count"],
            "shift": d["shift"],
            "mobile": d.get("mobile", ""),
            "email": d.get("email", ""),
            "hospitalId": d.get("hospital_id", "HOSP-AIIMS-01"),
            "avatar": d.get("avatar") or "DR",
            "council": d.get("council", ""),
            "regNumber": d.get("reg_number", ""),
            "reg_number": d.get("reg_number", ""),
            "hprId": d.get("hpr_id", ""),
            "hpr_id": d.get("hpr_id", ""),
            "stream": stream_val,
            "bio": d.get("bio", ""),
            "clinicalBadgeColor": "emerald" if stream_val == "ayush" else "blue"
        }
        try:
            save_doctor_to_mongo(res)
        except Exception:
            pass
        return res

    try:
        mongo_doc = find_doctor_in_mongo(doctor_id)
        if mongo_doc:
            save_doctor_to_db(mongo_doc)
            return mongo_doc
    except Exception:
        pass

    return None

def save_doctor_to_db(data: dict):
    doc_id = str(data.get("doctorId") or data.get("doctor_id") or data.get("id") or f"doc-{int(time.time() * 1000)}").strip()
    name = str(data.get("name") or data.get("fullName") or "Dr. Medical Specialist").strip()
    degrees = data.get("degrees", "MBBS, MD")
    specialty = data.get("specialty", "Specialist Physician")
    department = data.get("department", "General Medicine")
    room_number = data.get("roomNumber") or data.get("room_number") or "OPD Room 104"
    floor_wing = data.get("floorWing") or data.get("floor_wing") or "Ground Floor, Central Block"
    status = data.get("status", "On Duty")
    patients_seen = int(data.get("patientsSeen") or data.get("patients_seen") or 0)
    waiting_count = int(data.get("waitingCount") or data.get("waiting_count") or 0)
    shift = data.get("shift", "08:00 - 14:00")
    mobile = data.get("mobile", "")
    email = data.get("email", "")
    hospital_id = data.get("hospitalId") or data.get("hospital_id") or "HOSP-AIIMS-01"
    
    avatar = data.get("avatar")
    if not avatar:
        clean_name = name.replace("Dr.", "").replace("Vaidya", "").strip()
        parts = [p for p in clean_name.split() if p]
        avatar = "".join([p[0] for p in parts[:2]]).upper() if parts else "DR"

    council = data.get("council", "")
    reg_number = data.get("regNumber") or data.get("reg_number") or ""
    hpr_id = data.get("hprId") or data.get("hpr_id") or ""
    stream = data.get("stream") or ("ayush" if "ayu" in department.lower() else "allopathy")
    bio = data.get("bio", "")

    execute_update(
        """INSERT OR REPLACE INTO local_master_doctors
           (doctor_id, hospital_id, name, degrees, specialty, department, room_number, floor_wing, status, patients_seen, waiting_count, shift, mobile, email, avatar, council, reg_number, hpr_id, stream, bio)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (doc_id, hospital_id, name, degrees, specialty, department, room_number, floor_wing, status, patients_seen, waiting_count, shift, mobile, email, avatar, council, reg_number, hpr_id, stream, bio)
    )

    res = {
        "id": doc_id,
        "doctorId": doc_id,
        "doctor_id": doc_id,
        "name": name,
        "degrees": degrees,
        "specialty": specialty,
        "department": department,
        "roomNumber": room_number,
        "room_number": room_number,
        "floorWing": floor_wing,
        "floor_wing": floor_wing,
        "status": status,
        "patientsSeen": patients_seen,
        "patients_seen": patients_seen,
        "waitingCount": waiting_count,
        "waiting_count": waiting_count,
        "shift": shift,
        "mobile": mobile,
        "email": email,
        "hospitalId": hospital_id,
        "avatar": avatar,
        "council": council,
        "regNumber": reg_number,
        "reg_number": reg_number,
        "hprId": hpr_id,
        "hpr_id": hpr_id,
        "stream": stream,
        "bio": bio,
        "clinicalBadgeColor": "emerald" if stream == "ayush" else "blue"
    }

    try:
        save_doctor_to_mongo(res)
    except Exception:
        pass
    return res

@router.post("/login")
def doctor_login(req: DoctorLoginRequest):
    doc = find_doctor_in_db(req.doctorId)
    if not doc:
        # Fallback to doc-1 if generic test login
        doc = find_doctor_in_db("doc-1")
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor ID not found in roster.")
        
    token = encode_jwt({"doctorId": doc["doctorId"], "role": "doctor"})
    return {
        "success": True,
        "token": token,
        "doctor": doc
    }

@router.get("/list")
def list_doctors():
    docs = execute_query("SELECT * FROM local_master_doctors ORDER BY name ASC")
    if not docs:
        docs = get_all_doctors_from_mongo()

    formatted = []
    for d in (docs or []):
        doc_name = d.get("name", "Dr. Specialist")
        stream_val = d.get("stream") or ("ayush" if "ayu" in (d.get("department") or "").lower() else "allopathy")
        avatar_val = d.get("avatar")
        if not avatar_val:
            clean_name = doc_name.replace("Dr.", "").replace("Vaidya", "").strip()
            parts = [p for p in clean_name.split() if p]
            avatar_val = "".join([p[0] for p in parts[:2]]).upper() if parts else "DR"

        formatted.append({
            "id": d.get("doctor_id") or d.get("id"),
            "doctorId": d.get("doctor_id") or d.get("id"),
            "doctor_id": d.get("doctor_id") or d.get("id"),
            "name": doc_name,
            "avatar": avatar_val,
            "degrees": d.get("degrees") or "MBBS, MD",
            "specialty": d.get("specialty") or "Specialist Physician",
            "department": d.get("department") or "General Medicine",
            "roomNumber": d.get("room_number") or d.get("roomNumber") or "OPD Room 104",
            "room_number": d.get("room_number") or d.get("roomNumber") or "OPD Room 104",
            "floorWing": d.get("floor_wing") or "Ground Floor",
            "shift": d.get("shift") or "Morning OPD (08:00 - 14:00)",
            "status": d.get("status") or "On Duty",
            "stream": stream_val,
            "council": d.get("council") or "",
            "regNumber": d.get("reg_number") or d.get("regNumber") or "",
            "reg_number": d.get("reg_number") or d.get("regNumber") or "",
            "hprId": d.get("hpr_id") or d.get("hprId") or "",
            "hpr_id": d.get("hpr_id") or d.get("hprId") or "",
            "bio": d.get("bio") or "",
            "clinicalBadgeColor": "emerald" if stream_val == "ayush" else "blue",
            "patientsSeen": d.get("patients_seen", 0),
            "waitingCount": d.get("waiting_count", 0),
            "mobile": d.get("mobile", ""),
            "email": d.get("email", "")
        })

    return {
        "success": True,
        "doctors": formatted
    }

@router.post("/register")
def register_doctor(data: dict):
    saved_doc = save_doctor_to_db(data)
    token = encode_jwt({"doctorId": saved_doc["doctorId"], "role": "doctor"})
    return {
        "success": True,
        "token": token,
        "doctor": saved_doc
    }

@router.get("/queue/{doctorId}")
def get_doctor_queue(doctorId: str):
    tickets = execute_query(
        "SELECT * FROM offline_queue_tickets WHERE doctor_id = ? AND status IN ('WAITING', 'IN_CHAMBER') ORDER BY token_number ASC",
        (doctorId,)
    )
    return {
        "success": True,
        "doctorId": doctorId,
        "tickets": tickets
    }

@router.post("/call-next")
def call_next(req: CallNextPatientRequest):
    res = SmartQueueEngine.call_next_and_mark_seen(req.doctorId)
    return res

@router.get("/patient-history/{patientId}")
def get_patient_clinical_history(patientId: str):
    """
    Automatic Consolidated Clinical History Fetch for Doctor Consultation:
    1. Patient Demographics & Profile
    2. Current Complaint, AI Health Interview (SOCRATES & AYUSH) & Red Flags
    3. 3D Body Pain Mapping & VAS Score
    4. Uploaded Medical Documents & Extracted OCR Entities (Medications, Labs, Vitals)
    5. Previous Consultations, Diagnoses & Prescriptions
    6. Medical History Conditions & Appointments
    """
    # 1. Fetch Patient
    p_rows = execute_query("SELECT * FROM patients WHERE patient_id = ?", (patientId,))
    if not p_rows:
        raise HTTPException(status_code=404, detail=f"Patient {patientId} not found.")
    
    p = p_rows[0]
    vitals = json.loads(p["vitals"]) if p.get("vitals") else {"bp": "120/80 mmHg", "spo2": "98%", "pulse": "72 bpm", "temp": "98.6 °F"}
    dashvidha = json.loads(p["past_history_dashvidha"]) if p.get("past_history_dashvidha") else None
    stored_pain = json.loads(p["pain_mapping"]) if p.get("pain_mapping") else None

    # 2. Latest AI Health Interview
    int_rows = execute_query(
        "SELECT * FROM interviews WHERE patient_id = ? ORDER BY created_at DESC",
        (patientId,)
    )
    current_interview = None
    all_interviews = []
    for it in int_rows:
        item = {
            "interviewId": it["interview_id"],
            "sessionId": it["session_id"],
            "appointmentId": it["appointment_id"],
            "complaint": it["complaint"],
            "symptoms": it["symptoms"],
            "duration": it["duration"],
            "severity": it["severity"],
            "painLocation": it["pain_location"],
            "painIntensity": it["pain_intensity"],
            "medicalSystem": it["medical_system"],
            "language": it["language"],
            "aiSummary": json.loads(it["ai_summary"]) if it.get("ai_summary") else None,
            "clinicalData": json.loads(it["clinical_data"]) if it.get("clinical_data") else None,
            "messages": json.loads(it["messages"]) if it.get("messages") else [],
            "redFlags": json.loads(it["red_flags"]) if it.get("red_flags") else [],
            "isCompleted": bool(it["is_completed"]),
            "createdAt": it["created_at"]
        }
        all_interviews.append(item)
    if all_interviews:
        current_interview = all_interviews[0]

    # 3. 3D Pain Mapping
    pm_rows = execute_query(
        "SELECT * FROM patient_pain_mappings WHERE patient_id = ? ORDER BY id DESC LIMIT 1",
        (patientId,)
    )
    pain_mapping = None
    if pm_rows:
        pm = pm_rows[0]
        pain_mapping = {
            "bodyRegion": pm["body_region"],
            "side": pm["side"],
            "location": pm["location"],
            "painIntensity": pm.get("pain_intensity", 5),
            "painType": pm.get("pain_type", "Aching"),
            "laymanSummary": pm["layman_summary"],
            "coordinates": json.loads(pm["coordinates"]) if pm.get("coordinates") else None,
            "recordedAt": pm["recorded_at"]
        }
    elif stored_pain:
        pain_mapping = stored_pain

    # 4. Medical Documents & OCR Results
    doc_rows = execute_query(
        "SELECT * FROM medical_documents WHERE patient_id = ? ORDER BY created_at DESC",
        (patientId,)
    )
    documents = []
    for d in doc_rows:
        documents.append({
            "documentId": d["document_id"],
            "title": d["title"],
            "filename": d["filename"],
            "documentType": d["document_type"],
            "extractedText": d["extracted_text"],
            "entities": json.loads(d["entities_json"]) if d.get("entities_json") else {},
            "summary": d["summary"],
            "fileUrl": d["file_url"],
            "status": d["status"],
            "createdAt": d["created_at"]
        })

    # 5. Previous Consultations
    consult_rows = execute_query(
        "SELECT * FROM consultations WHERE patient_id = ? ORDER BY created_at DESC",
        (patientId,)
    )
    consultations = []
    for c in consult_rows:
        consultations.append({
            "consultationId": c["consultation_id"],
            "appointmentId": c["appointment_id"],
            "doctorId": c["doctor_id"],
            "doctorName": c["doctor_name"],
            "diagnosis": c["diagnosis"],
            "prescription": json.loads(c["prescription_json"]) if c.get("prescription_json") else [],
            "clinicalNotes": c["clinical_notes"],
            "advice": c["advice"],
            "ayurvedicNotes": json.loads(c["ayurvedic_notes"]) if c.get("ayurvedic_notes") else None,
            "followUpDate": c["follow_up_date"],
            "createdAt": c["created_at"]
        })

    # 6. Medical History Conditions & Appointments
    history_rows = execute_query("SELECT * FROM medical_history WHERE patient_id = ? ORDER BY id DESC", (patientId,))
    apt_rows = execute_query("SELECT * FROM appointments WHERE patient_id = ? ORDER BY created_at DESC", (patientId,))

    return {
        "success": True,
        "patient": {
            "patientId": p["patient_id"],
            "fullName": p["full_name"],
            "patientName": p["full_name"],
            "mobile": p["mobile"],
            "email": p.get("email"),
            "abhaNumber": p["abha_number"],
            "abhaAddress": p["abha_address"],
            "aadhaarNumber": p.get("aadhaar_number"),
            "age": p["age"],
            "gender": p["gender"],
            "address": p["address"],
            "vitals": vitals,
            "dashvidha": dashvidha
        },
        "currentIssue": {
            "chiefComplaint": current_interview.get("complaint") if current_interview else p["symptoms"],
            "symptoms": current_interview.get("symptoms") if current_interview else p["symptoms"],
            "duration": current_interview.get("duration") if current_interview else "2-3 weeks",
            "severity": current_interview.get("severity") if current_interview else 5,
            "interview": current_interview,
            "redFlags": current_interview.get("redFlags", []) if current_interview else []
        },
        "painMapping": pain_mapping,
        "documents": documents,
        "consultations": consultations,
        "medicalHistory": history_rows,
        "appointments": apt_rows
    }

@router.post("/consultation/save")
def save_consultation(req: SaveConsultationRequest):
    con_id = f"CON-{random.randint(1000, 9999)}-{int(time.time()) % 1000}"
    rx_json = json.dumps(req.prescription) if req.prescription else "[]"
    ayu_json = json.dumps(req.ayurvedicNotes) if req.ayurvedicNotes else None

    execute_update(
        """INSERT INTO consultations
           (consultation_id, appointment_id, patient_id, doctor_id, doctor_name, diagnosis, prescription_json, clinical_notes, advice, ayurvedic_notes, follow_up_date)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (con_id, req.appointmentId, req.patientId, req.doctorId, req.doctorName, req.diagnosis, rx_json, req.clinicalNotes, req.advice, ayu_json, req.followUpDate)
    )

    # Update appointment status if present
    if req.appointmentId:
        execute_update(
            "UPDATE appointments SET status = 'COMPLETED' WHERE appointment_id = ?",
            (req.appointmentId,)
        )

    # Mark ticket status as SEEN
    if req.ticketId:
        SmartQueueEngine.update_ticket_status(req.ticketId, "SEEN", req.doctorId)
    else:
        execute_update(
            "UPDATE offline_queue_tickets SET status = 'SEEN' WHERE patient_id = ? AND doctor_id = ? AND status = 'WAITING'",
            (req.patientId, req.doctorId)
        )

    # Increment doctor's patients_seen count
    execute_update(
        "UPDATE local_master_doctors SET patients_seen = patients_seen + 1 WHERE doctor_id = ?",
        (req.doctorId,)
    )

    return {
        "success": True,
        "message": "Consultation saved and clinical prescription recorded.",
        "consultationId": con_id,
        "patientId": req.patientId,
        "status": "COMPLETED"
    }
