import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from config.sqlite_config import init_sqlite_db, execute_update, execute_query
from config.mongodb_config import is_mongo_connected, get_mongo_db

import json

INITIAL_HOSPITALS = [
    {
        "hospital_id": "HOSP-AIIMS-01",
        "name": "AIIMS New Delhi Central Hospital",
        "code": "AIIMS-DEL",
        "city": "New Delhi",
        "state": "Delhi",
        "region": "Northern Region",
        "total_beds": 2400,
        "active_kiosks": 6,
        "daily_patient_capacity": 8500,
        "contact_number": "+91-11-26588500"
    },
    {
        "hospital_id": "HOSP-SJ-02",
        "name": "Safdarjung Multi-Speciality Hospital",
        "code": "SJH-DEL",
        "city": "New Delhi",
        "state": "Delhi",
        "region": "Northern Region",
        "total_beds": 1800,
        "active_kiosks": 4,
        "daily_patient_capacity": 6200,
        "contact_number": "+91-11-26165060"
    },
    {
        "hospital_id": "HOSP-CIVIL-03",
        "name": "District Civil Hospital Pune",
        "code": "DCH-PUN",
        "city": "Pune",
        "state": "Maharashtra",
        "region": "Western Region",
        "total_beds": 950,
        "active_kiosks": 3,
        "daily_patient_capacity": 3400,
        "contact_number": "+91-20-26127391"
    },
    {
        "hospital_id": "HOSP-KMC-04",
        "name": "Kasturba Community Health Center Manipal",
        "code": "KMC-MNP",
        "city": "Udupi",
        "state": "Karnataka",
        "region": "Southern Region",
        "total_beds": 650,
        "active_kiosks": 2,
        "daily_patient_capacity": 2100,
        "contact_number": "+91-820-2922761"
    }
]

INITIAL_USERS = [
    {
        "user_id": "usr-govt-stakeholder",
        "username": "govt.stakeholder@abdm.gov.in",
        "email": "govt.stakeholder@abdm.gov.in",
        "role": "MAIN_ADMIN",
        "password_hash": "govt@1234",
        "full_name": "Er. Sachin Bansal (National Health Authority & Stakeholders Director)",
        "hospital_id": None
    },
    {
        "user_id": "usr-main-admin",
        "username": "gov.director@abdm.gov.in",
        "email": "gov.director@abdm.gov.in",
        "role": "MAIN_ADMIN",
        "password_hash": "govt@1234",
        "full_name": "Er. Sachin Bansal (National Health Authority Director)",
        "hospital_id": None
    },
    {
        "user_id": "usr-super-admin",
        "username": "superadmin@medikiosk.gov.in",
        "email": "superadmin@medikiosk.gov.in",
        "role": "MAIN_ADMIN",
        "password_hash": "govt@1234",
        "full_name": "Dr. R. S. Sharma (MoHFW Chief Director)",
        "hospital_id": None
    },
    {
        "user_id": "usr-hosp-admin-primary",
        "username": "hospital.admin@medikiosk.gov.in",
        "email": "hospital.admin@medikiosk.gov.in",
        "role": "HOSPITAL_ADMIN",
        "password_hash": "hosp@1234",
        "full_name": "Dr. V. K. Paul (Hospital Medical Superintendent)",
        "hospital_id": "HOSP-AIIMS-01"
    },
    {
        "user_id": "usr-hosp-admin-1",
        "username": "admin.medikiosk@gmail.com",
        "email": "admin.medikiosk@gmail.com",
        "role": "HOSPITAL_ADMIN",
        "password_hash": "hosp@1234",
        "full_name": "Dr. V. K. Paul (AIIMS Medical Superintendent)",
        "hospital_id": "HOSP-AIIMS-01"
    },
    {
        "user_id": "usr-hosp-admin-2",
        "username": "nirmala.thomas@medikiosk.gov.in",
        "email": "nirmala.thomas@medikiosk.gov.in",
        "role": "HOSPITAL_ADMIN",
        "password_hash": "hosp@1234",
        "full_name": "Sister Nirmala Thomas (AIIMS OPD Incharge)",
        "hospital_id": "HOSP-AIIMS-01"
    },
    {
        "user_id": "usr-hosp-admin-3",
        "username": "admin.civilpune@medikiosk.gov.in",
        "email": "admin.civilpune@medikiosk.gov.in",
        "role": "HOSPITAL_ADMIN",
        "password_hash": "hosp@1234",
        "full_name": "Dr. Rameshwar Patil (Civil Hospital Superintendent)",
        "hospital_id": "HOSP-CIVIL-03"
    },
    {
        "user_id": "usr-doc-1",
        "username": "doc-1",
        "email": "rajeshwar.sharma@medikiosk.gov.in",
        "role": "DOCTOR",
        "password_hash": "12345",
        "full_name": "Dr. Rajeshwar Sharma",
        "hospital_id": "HOSP-AIIMS-01"
    }
]

INITIAL_DOCTORS = [
    {
        "doctor_id": "doc-1",
        "hospital_id": "HOSP-AIIMS-01",
        "name": "Dr. Rajeshwar Sharma",
        "degrees": "MBBS, MD (General Medicine)",
        "specialty": "Senior Consultant Physician",
        "department": "General Medicine",
        "room_number": "OPD Room 104",
        "floor_wing": "Ground Floor, Central Block",
        "status": "On Duty",
        "patients_seen": 34,
        "waiting_count": 8,
        "shift": "08:00 - 14:00",
        "mobile": "9811223344",
        "email": "rajeshwar.sharma@medikiosk.gov.in"
    },
    {
        "doctor_id": "doc-2",
        "hospital_id": "HOSP-AIIMS-01",
        "name": "Dr. Arvind Mehta",
        "degrees": "MBBS, MD, DM (Cardiology)",
        "specialty": "Interventional Cardiologist",
        "department": "Cardiology & Emergency",
        "room_number": "Emergency Bay 2",
        "floor_wing": "Ground Floor, Acute Care Wing",
        "status": "In Emergency",
        "patients_seen": 19,
        "waiting_count": 3,
        "shift": "Emergency On-Call",
        "mobile": "9811334455",
        "email": "arvind.mehta@medikiosk.gov.in"
    },
    {
        "doctor_id": "doc-3",
        "hospital_id": "HOSP-AIIMS-01",
        "name": "Vaidya Ananya Deshpande",
        "degrees": "BAMS, MD (Ayurveda - Kayachikitsa)",
        "specialty": "Chief Ayurvedic Physician",
        "department": "Ayurvedic OPD & Panchakarma",
        "room_number": "Room 208",
        "floor_wing": "2nd Floor, AYUSH Wing",
        "status": "On Duty",
        "patients_seen": 22,
        "waiting_count": 5,
        "shift": "08:00 - 14:00",
        "mobile": "9811445566",
        "email": "ananya.deshpande@medikiosk.gov.in"
    },
    {
        "doctor_id": "doc-4",
        "hospital_id": "HOSP-AIIMS-01",
        "name": "Dr. Priya S. Nair",
        "degrees": "MBBS, MS (Orthopedics), DNB",
        "specialty": "Consultant Orthopedic Surgeon",
        "department": "Orthopedics",
        "room_number": "OPD Room 112",
        "floor_wing": "Ground Floor, Surgical Wing",
        "status": "On Duty",
        "patients_seen": 27,
        "waiting_count": 7,
        "shift": "08:00 - 14:00",
        "mobile": "9811556677",
        "email": "priya.nair@medikiosk.gov.in"
    },
    {
        "doctor_id": "doc-5",
        "hospital_id": "HOSP-AIIMS-01",
        "name": "Dr. Sunita Kulkarni",
        "degrees": "MBBS, MD (Pediatrics), DCH",
        "specialty": "Senior Consultant Pediatrician",
        "department": "Pediatrics",
        "room_number": "OPD Room 106",
        "floor_wing": "Ground Floor, Maternal & Child Wing",
        "status": "On Break",
        "patients_seen": 21,
        "waiting_count": 4,
        "shift": "08:00 - 14:00",
        "mobile": "9811667788",
        "email": "sunita.kulkarni@medikiosk.gov.in"
    }
]

INITIAL_PATIENTS = [
    {
        "patient_id": "PT-8841",
        "user_id": "usr-pt-8841",
        "hospital_id": "HOSP-AIIMS-01",
        "full_name": "Ramesh Kumar Sharma",
        "mobile": "9810123456",
        "email": "ramesh.sharma@abdm.gov.in",
        "abha_number": "14-8892-4412-9031",
        "abha_address": "ramesh.sharma@abdm",
        "aadhaar_number": "5481-9023-1184",
        "age": 42,
        "gender": "Male",
        "address": "B-402, Green Park, New Delhi",
        "symptoms": "Low Back Pain radiating to right thigh & Stiffness",
        "vitals": json.dumps({"bp": "128/82 mmHg", "pulse": "76 bpm", "spo2": "99%", "temp": "98.4 °F", "bmi": "25.2"}),
        "past_history_dashvidha": json.dumps({
            "prakriti": "Vata-Kaphaja (प्रकृति)",
            "vikriti": "Kati Graha / Gridhrasi Lakshana (Low Back Stiffness & Sciatica twinges)",
            "aharaShakti": "Madhyama Agni (Moderate digestive power)",
            "vyayamaShakti": "Madhyama (30-min walk daily)",
            "satva": "Pravara (Sound mental resilience)",
            "satmya": "Vegetarian Diet, No Known Drug Allergies"
        }),
        "pain_mapping": json.dumps({
            "patientId": "PT-8841",
            "bodyRegion": "back",
            "side": "center",
            "location": "lower",
            "painIntensity": 6,
            "painType": "Aching with shooting twinges",
            "laymanSummary": "Lower Back (Lumbar Spine L4-L5)",
            "coordinates": [0.0, 0.45, 0.75]
        })
    },
    {
        "patient_id": "PT-1204",
        "user_id": "usr-pt-1204",
        "hospital_id": "HOSP-AIIMS-01",
        "full_name": "Sunita Devi Patel",
        "mobile": "9876543210",
        "email": "sunita.patel@abdm.gov.in",
        "abha_number": "14-1234-5678-9012",
        "abha_address": "sunita.patel@abdm",
        "aadhaar_number": "9876-5432-1098",
        "age": 38,
        "gender": "Female",
        "address": "Sector 14, Gurgaon, Haryana",
        "symptoms": "Chronic Fatigue, Mild Anemia & Headache",
        "vitals": json.dumps({"bp": "118/76 mmHg", "pulse": "72 bpm", "spo2": "98%", "temp": "98.6 °F", "bmi": "22.8"}),
        "past_history_dashvidha": json.dumps({
            "prakriti": "Vata-Pittaja (प्रकृति)",
            "vikriti": "Pandu / Dhatu Kshaya (Mild Anemia & Low Stamina)",
            "aharaShakti": "Manda Agni (Slow digestion & Bloating)",
            "vyayamaShakti": "Avara (Low physical endurance)",
            "satva": "Madhyama",
            "satmya": "Mixed diet, Lactose sensitive"
        }),
        "pain_mapping": json.dumps({
            "patientId": "PT-1204",
            "bodyRegion": "head",
            "side": "center",
            "location": "forehead",
            "painIntensity": 4,
            "painType": "Throbbing",
            "laymanSummary": "Forehead & Temples",
            "coordinates": [0.0, -0.75, 4.45]
        })
    },
    {
        "patient_id": "PT-5481",
        "user_id": "usr-pt-5481",
        "hospital_id": "HOSP-CIVIL-03",
        "full_name": "Sanjay Balwantrao Shinde",
        "mobile": "9822334455",
        "email": "sanjay.shinde@abdm.gov.in",
        "abha_number": "5481-9023-1184-0001",
        "abha_address": "sanjay.shinde@abdm",
        "aadhaar_number": "1488-9244-1290",
        "age": 51,
        "gender": "Male",
        "address": "Kothrud, Pune, Maharashtra",
        "symptoms": "Persistent Upper Stomach Burning & Acid Sour Belching",
        "vitals": json.dumps({"bp": "130/84 mmHg", "pulse": "78 bpm", "spo2": "99%", "temp": "98.2 °F", "bmi": "26.1"}),
        "past_history_dashvidha": json.dumps({
            "prakriti": "Pitta-Vataja (प्रकृति)",
            "vikriti": "Amla Pitta (Hyperacidity & Esophageal Reflux)",
            "aharaShakti": "Tikshnagni (Hyperactive digestive fire)",
            "vyayamaShakti": "Madhyama",
            "satva": "Pravara",
            "satmya": "Spicy food, Sulfa allergy"
        }),
        "pain_mapping": json.dumps({
            "patientId": "PT-5481",
            "bodyRegion": "abdomen",
            "side": "center",
            "location": "upper",
            "painIntensity": 5,
            "painType": "Burning sensation",
            "laymanSummary": "Upper Middle Belly (Heartburn area)",
            "coordinates": [0.0, -0.75, 1.35]
        })
    }
]

INITIAL_APPOINTMENTS = [
    {
        "appointment_id": "APT-8841-01",
        "patient_id": "PT-8841",
        "doctor_id": "doc-1",
        "hospital_id": "HOSP-AIIMS-01",
        "department": "General Medicine",
        "appointment_date": "2026-09-16",
        "time_slot": "09:30 AM",
        "token_number": "OPD-A-042",
        "status": "WAITING"
    },
    {
        "appointment_id": "APT-1204-01",
        "patient_id": "PT-1204",
        "doctor_id": "doc-1",
        "hospital_id": "HOSP-AIIMS-01",
        "department": "General Medicine",
        "appointment_date": "2026-09-16",
        "time_slot": "10:15 AM",
        "token_number": "OPD-A-018",
        "status": "SCHEDULED"
    },
    {
        "appointment_id": "APT-5481-01",
        "patient_id": "PT-5481",
        "doctor_id": "doc-3",
        "hospital_id": "HOSP-AIIMS-01",
        "department": "Ayurvedic OPD & Panchakarma",
        "appointment_date": "2026-09-16",
        "time_slot": "11:00 AM",
        "token_number": "OPD-B-019",
        "status": "SCHEDULED"
    }
]

INITIAL_INTERVIEWS = [
    {
        "interview_id": "INT-8841-01",
        "patient_id": "PT-8841",
        "appointment_id": "APT-8841-01",
        "doctor_id": "doc-1",
        "hospital_id": "HOSP-AIIMS-01",
        "session_id": "kiosk-8841a1",
        "complaint": "Low back pain radiating to right thigh with morning stiffness",
        "symptoms": "Low back ache, right thigh shooting twinges, stiffness after sitting",
        "duration": "2 months (aggravated after lifting weights)",
        "severity": 6,
        "pain_location": "Lower back (Lumbar spine L4-L5)",
        "pain_intensity": 6,
        "medical_system": "allopathy",
        "language": "english",
        "ai_summary": json.dumps({
            "chief_complaint": "Low back pain radiating to right thigh",
            "duration": "2 months",
            "severity": "6 / 10 (Moderate to severe)",
            "character": "Dull ache with sharp shooting twinges",
            "red_flags": [],
            "provisional_impression": "Mechanical Lumbar Spondylosis with mild Sciatica (L4-L5)",
            "recommended_eval": "Lumbar flexion-extension examination, SLR test, physiotherapy referral."
        }),
        "clinical_data": json.dumps({
            "symptom": "Low back pain",
            "site": "Lumbar spine",
            "onset": "2 months ago",
            "character": "Aching and shooting",
            "radiation": "Right posterior thigh",
            "timing": "Worse in morning & prolonged sitting",
            "aggravating": "Bending forward, lifting loads",
            "severity": "6/10"
        }),
        "messages": json.dumps([
            {"role": "ai", "content": "Welcome to MediKiosk. Please describe the primary discomfort you are experiencing today."},
            {"role": "patient", "content": "I have lower back pain radiating down to my right leg for 2 months."},
            {"role": "ai", "content": "Where exactly is the pain located? Please indicate on the 3D mannequin or select from the options."},
            {"role": "patient", "content": "Lower Back (Lumbar spine)"},
            {"role": "ai", "content": "How would you describe the pain character (e.g. sharp, throbbing, dull, burning)?"},
            {"role": "patient", "content": "Dull ache with sudden shooting twinges when bending."}
        ]),
        "red_flags": json.dumps([]),
        "is_completed": 1
    }
]

INITIAL_PAIN_MAPPINGS = [
    {
        "patient_id": "PT-8841",
        "interview_id": "INT-8841-01",
        "patient_gender": "male",
        "body_region": "back",
        "side": "center",
        "location": "lower",
        "pain_intensity": 6,
        "pain_type": "Aching / Sciatica twinge",
        "layman_summary": "Lower Back (Lumbar Spine)",
        "coordinates": json.dumps([0.0, 0.45, 0.75])
    },
    {
        "patient_id": "PT-5481",
        "interview_id": None,
        "patient_gender": "male",
        "body_region": "abdomen",
        "side": "center",
        "location": "upper",
        "pain_intensity": 5,
        "pain_type": "Burning / Sour reflux",
        "layman_summary": "Upper Middle Belly (Heartburn area)",
        "coordinates": json.dumps([0.0, -0.75, 1.35])
    }
]

INITIAL_DOCUMENTS = [
    {
        "document_id": "DOC-8841-01",
        "patient_id": "PT-8841",
        "appointment_id": "APT-8841-01",
        "title": "Lumbar Spine Digital X-Ray & Ortho Impression",
        "filename": "lumbar_xray_report.pdf",
        "file_type": "application/pdf",
        "document_type": "LAB_REPORT",
        "extracted_text": "Digital Radiography: Lumbosacral Spine AP & Lateral View. Finding: Mild disc space narrowing at L4-L5 level with marginal osteophytes. No spondylolisthesis or bony destruction noted. Impression: Early Lumbar Spondylosis.",
        "entities_json": json.dumps({
            "medications": [
                {"name": "Aceclofenac 100mg + Paracetamol 325mg", "dose": "1 Tab", "frequency": "BD after food", "duration": "5 Days"},
                {"name": "Rabeprazole 20mg", "dose": "1 Cap", "frequency": "OD before breakfast", "duration": "7 Days"}
            ],
            "investigations": [
                {"name": "Lumbosacral X-Ray", "value": "L4-L5 disc space narrowing", "unit": "Radiological finding", "status": "Abnormal"}
            ],
            "vitals": {"bp": "128/82 mmHg", "pulse": "76 bpm"},
            "diagnosis": "Early Lumbar Spondylosis with Sciatica"
        }),
        "summary": "Digital X-Ray demonstrates mild L4-L5 disc space narrowing and early spondylotic changes without vertebral fracture.",
        "file_url": "/api/files/samples/sample_prescription.png",
        "status": "completed"
    },
    {
        "document_id": "DOC-5481-01",
        "patient_id": "PT-5481",
        "appointment_id": "APT-5481-01",
        "title": "Upper GI Endoscopy & Prescription Card",
        "filename": "endoscopy_prescription.jpg",
        "file_type": "image/jpeg",
        "document_type": "PRESCRIPTION",
        "extracted_text": "Gastroenterology OPD Slip. Rx: Pantoprazole 40mg OD before food x 14 days, Sucralfate Suspension 10ml TDS x 10 days. Diagnosis: Non-erosive Gastroesophageal Reflux Disease (GERD) with antral gastritis.",
        "entities_json": json.dumps({
            "medications": [
                {"name": "Pantoprazole 40mg", "dose": "40mg", "frequency": "OD before breakfast", "duration": "14 Days"},
                {"name": "Sucralfate Suspension", "dose": "10ml", "frequency": "TDS before meals", "duration": "10 Days"}
            ],
            "investigations": [
                {"name": "Upper GI Endoscopy", "value": "Antral hyperaemia, Grade A Esophagitis", "unit": "Endoscopic observation"}
            ],
            "diagnosis": "GERD & Antral Gastritis"
        }),
        "summary": "Prescription for acid-suppression therapy managing GERD and gastric hyperacidity.",
        "file_url": "/api/files/samples/sample_handwritten.jpeg",
        "status": "completed"
    }
]

INITIAL_CONSULTATIONS = [
    {
        "consultation_id": "CON-8841-99",
        "appointment_id": "APT-8841-PREV",
        "patient_id": "PT-8841",
        "doctor_id": "doc-1",
        "doctor_name": "Dr. Rajeshwar Sharma",
        "diagnosis": "Essential Hypertension & Lumbar Back Strain",
        "prescription_json": json.dumps([
            {"medicine": "Telmisartan 40mg", "dosage": "1 Tab OD Morning", "duration": "30 Days", "instructions": "After breakfast"},
            {"medicine": "Diclofenac Gel 1.16%", "dosage": "Apply gently over lumbar area", "duration": "10 Days", "instructions": "BD topical application"}
        ]),
        "clinical_notes": "BP under control on Telmisartan. Advised lumbar extension exercises and posture correction during desk work.",
        "advice": "Avoid heavy weight lifting. 30 minutes daily brisk walk. Follow up in 1 month.",
        "ayurvedic_notes": json.dumps({"prakriti": "Vata-Kapha", "herb": "Shallaki 500mg & Ashwagandha"}),
        "follow_up_date": "2026-10-15"
    }
]

INITIAL_MEDICAL_HISTORY = [
    {
        "patient_id": "PT-8841",
        "condition": "Essential Hypertension",
        "diagnosed_year": "2019",
        "status": "Controlled on Meds",
        "notes": "Maintained on Telmisartan 40mg OD"
    },
    {
        "patient_id": "PT-8841",
        "condition": "Lumbar Spondylosis",
        "diagnosed_year": "2024",
        "status": "Active / Intermittent flare-ups",
        "notes": "L4-L5 disc space narrowing"
    },
    {
        "patient_id": "PT-5481",
        "condition": "Type-2 Diabetes Mellitus",
        "diagnosed_year": "2018",
        "status": "Controlled",
        "notes": "Metformin 500mg BD"
    }
]

INITIAL_KIOSKS = [
    {
        "kiosk_id": "K-01",
        "hospital_id": "HOSP-AIIMS-01",
        "location": "Main Gate & Casualty Entrance",
        "status": "Online",
        "paper_level": 88,
        "biometric_status": "OK (STQC Certified)",
        "touchscreen_status": "Calibrated (100%)",
        "today_registrations": 462,
        "latency_ms": 22
    },
    {
        "kiosk_id": "K-02",
        "hospital_id": "HOSP-AIIMS-01",
        "location": "East OPD Central Atrium",
        "status": "Online",
        "paper_level": 64,
        "biometric_status": "OK (STQC Certified)",
        "touchscreen_status": "Calibrated (100%)",
        "today_registrations": 388,
        "latency_ms": 31
    },
    {
        "kiosk_id": "K-03",
        "hospital_id": "HOSP-AIIMS-01",
        "location": "Maternal & Child Health Block",
        "status": "Online",
        "paper_level": 92,
        "biometric_status": "OK (STQC Certified)",
        "touchscreen_status": "Calibrated (100%)",
        "today_registrations": 314,
        "latency_ms": 18
    },
    {
        "kiosk_id": "K-04",
        "hospital_id": "HOSP-AIIMS-01",
        "location": "AYUSH & Rehabilitation Wing",
        "status": "Online",
        "paper_level": 42,
        "biometric_status": "OK (STQC Certified)",
        "touchscreen_status": "Calibrated (100%)",
        "today_registrations": 264,
        "latency_ms": 25
    },
    {
        "kiosk_id": "K-05",
        "hospital_id": "HOSP-CIVIL-03",
        "location": "Pune Civil Hospital Central Desk",
        "status": "Online",
        "paper_level": 78,
        "biometric_status": "OK (STQC Certified)",
        "touchscreen_status": "Calibrated (100%)",
        "today_registrations": 195,
        "latency_ms": 28
    }
]

def seed_database():
    init_sqlite_db()

    # 1. Seed Hospitals
    for h in INITIAL_HOSPITALS:
        execute_update(
            """INSERT OR REPLACE INTO hospitals
               (hospital_id, name, code, city, state, region, total_beds, active_kiosks, daily_patient_capacity, contact_number)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (h["hospital_id"], h["name"], h["code"], h["city"], h["state"], h["region"], h["total_beds"], h["active_kiosks"], h["daily_patient_capacity"], h["contact_number"])
        )

    # 2. Seed Users
    for u in INITIAL_USERS:
        execute_update(
            """INSERT OR REPLACE INTO users
               (user_id, username, email, role, password_hash, full_name, hospital_id)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (u["user_id"], u["username"], u["email"], u["role"], u["password_hash"], u["full_name"], u["hospital_id"])
        )

    # 3. Seed Doctors
    for d in INITIAL_DOCTORS:
        execute_update(
            """INSERT OR REPLACE INTO local_master_doctors
               (doctor_id, hospital_id, name, degrees, specialty, department, room_number, floor_wing, status, patients_seen, waiting_count, shift, mobile, email)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (d["doctor_id"], d.get("hospital_id", "HOSP-AIIMS-01"), d["name"], d["degrees"], d["specialty"], d["department"], d["room_number"], d["floor_wing"], d["status"], d["patients_seen"], d["waiting_count"], d["shift"], d["mobile"], d["email"])
        )

    # 4. Seed Patients
    for p in INITIAL_PATIENTS:
        execute_update(
            """INSERT OR REPLACE INTO patients
               (patient_id, user_id, hospital_id, full_name, mobile, email, abha_number, abha_address, aadhaar_number, age, gender, address, symptoms, vitals, past_history_dashvidha, pain_mapping)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (p["patient_id"], p.get("user_id"), p.get("hospital_id", "HOSP-AIIMS-01"), p["full_name"], p["mobile"], p.get("email"), p["abha_number"], p["abha_address"], p["aadhaar_number"], p["age"], p["gender"], p["address"], p["symptoms"], p["vitals"], p["past_history_dashvidha"], p.get("pain_mapping"))
        )

    # 5. Seed Appointments
    for a in INITIAL_APPOINTMENTS:
        execute_update(
            """INSERT OR REPLACE INTO appointments
               (appointment_id, patient_id, doctor_id, hospital_id, department, appointment_date, time_slot, token_number, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (a["appointment_id"], a["patient_id"], a["doctor_id"], a.get("hospital_id", "HOSP-AIIMS-01"), a["department"], a["appointment_date"], a["time_slot"], a["token_number"], a["status"])
        )

    # 6. Seed Interviews
    for it in INITIAL_INTERVIEWS:
        execute_update(
            """INSERT OR REPLACE INTO interviews
               (interview_id, patient_id, appointment_id, doctor_id, hospital_id, session_id, complaint, symptoms, duration, severity, pain_location, pain_intensity, medical_system, language, ai_summary, clinical_data, messages, red_flags, is_completed)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (it["interview_id"], it["patient_id"], it.get("appointment_id"), it.get("doctor_id"), it.get("hospital_id", "HOSP-AIIMS-01"), it["session_id"], it["complaint"], it["symptoms"], it["duration"], it["severity"], it["pain_location"], it["pain_intensity"], it["medical_system"], it["language"], it["ai_summary"], it["clinical_data"], it["messages"], it["red_flags"], it["is_completed"])
        )

    # 7. Seed Pain Mappings
    for pm in INITIAL_PAIN_MAPPINGS:
        execute_update(
            """INSERT OR REPLACE INTO patient_pain_mappings
               (patient_id, interview_id, patient_gender, body_region, side, location, pain_intensity, pain_type, layman_summary, coordinates)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (pm["patient_id"], pm.get("interview_id"), pm.get("patient_gender"), pm["body_region"], pm.get("side"), pm.get("location"), pm.get("pain_intensity", 5), pm.get("pain_type", "Aching"), pm["layman_summary"], pm["coordinates"])
        )

    # 8. Seed Medical Documents
    for doc in INITIAL_DOCUMENTS:
        execute_update(
            """INSERT OR REPLACE INTO medical_documents
               (document_id, patient_id, appointment_id, title, filename, file_type, document_type, extracted_text, entities_json, summary, file_url, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (doc["document_id"], doc["patient_id"], doc.get("appointment_id"), doc["title"], doc["filename"], doc["file_type"], doc["document_type"], doc["extracted_text"], doc["entities_json"], doc["summary"], doc["file_url"], doc["status"])
        )

    # 9. Seed Consultations
    for c in INITIAL_CONSULTATIONS:
        execute_update(
            """INSERT OR REPLACE INTO consultations
               (consultation_id, appointment_id, patient_id, doctor_id, doctor_name, diagnosis, prescription_json, clinical_notes, advice, ayurvedic_notes, follow_up_date)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (c["consultation_id"], c.get("appointment_id"), c["patient_id"], c["doctor_id"], c["doctor_name"], c["diagnosis"], c["prescription_json"], c["clinical_notes"], c["advice"], c.get("ayurvedic_notes"), c.get("follow_up_date"))
        )

    # 10. Seed Medical History
    for mh in INITIAL_MEDICAL_HISTORY:
        execute_update(
            """INSERT OR REPLACE INTO medical_history
               (patient_id, condition, diagnosed_year, status, notes)
               VALUES (?, ?, ?, ?, ?)""",
            (mh["patient_id"], mh["condition"], mh["diagnosed_year"], mh["status"], mh["notes"])
        )

    # 11. Seed Kiosks
    for k in INITIAL_KIOSKS:
        execute_update(
            """INSERT OR REPLACE INTO kiosk_fleet_status
               (kiosk_id, hospital_id, location, status, paper_level, biometric_status, touchscreen_status, today_registrations, latency_ms)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (k["kiosk_id"], k.get("hospital_id", "HOSP-AIIMS-01"), k["location"], k["status"], k["paper_level"], k["biometric_status"], k["touchscreen_status"], k["today_registrations"], k["latency_ms"])
        )

    # 12. Seed Offline Queue Tickets
    initial_tickets = [
        ("TKT-001", 42, "PT-8841", "Ramesh Kumar Sharma", "9810123456", "doc-1", "HOSP-AIIMS-01", "General Medicine", "OPD Room 104", "K-01", "WAITING"),
        ("TKT-002", 18, "PT-1204", "Sunita Devi Patel", "9876543210", "doc-1", "HOSP-AIIMS-01", "General Medicine", "OPD Room 104", "K-02", "WAITING"),
        ("TKT-003", 19, "PT-5481", "Sanjay Balwantrao Shinde", "9822334455", "doc-3", "HOSP-AIIMS-01", "Ayurvedic OPD & Panchakarma", "Room 208", "K-04", "WAITING")
    ]
    for t in initial_tickets:
        execute_update(
            """INSERT OR REPLACE INTO offline_queue_tickets
               (ticket_id, token_number, patient_id, patient_name, mobile, doctor_id, hospital_id, department, room_number, kiosk_id, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            t
        )

    print("[SQLite DB] Initialized & Seeded SQLite Edge DB successfully (medikiosk_edge.db).")

if __name__ == "__main__":
    seed_database()
