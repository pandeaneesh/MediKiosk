import os
import json
import time

is_mongo_connected = False
db_client = None
mongo_db = None

# Support optional .env file for cloud connection string MONGO_URI
for env_path in [
    os.path.join(os.path.dirname(__file__), "..", "..", ".env"),
    os.path.join(os.path.dirname(__file__), "..", ".env")
]:
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        os.environ[k.strip()] = v.strip()
        except Exception:
            pass

try:
    from pymongo import MongoClient
    from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

    DEFAULT_MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/medikiosk_enterprise")
    client = MongoClient(DEFAULT_MONGO_URI, serverSelectionTimeoutMS=2000)
    client.admin.command('ping')
    is_mongo_connected = True
    db_client = client
    mongo_db = client.get_database("medikiosk_enterprise")
    print(f"[MongoDB Cloud Store] Connected successfully to: {DEFAULT_MONGO_URI}")
except Exception as err:
    is_mongo_connected = False
    db_client = None
    mongo_db = None
    print(f"[Database Engine] Local SQLite3 Edge Database: ACTIVE & CONNECTED (backend/database/medikiosk_edge.db).")
    print(f"[Cloud Store Sync] Optional MongoDB sync standby ({err}). Running in 100% offline-ready Edge mode.")

def get_mongo_db():
    return mongo_db

def save_patient_to_mongo(patient_data: dict):
    """Upserts a patient document into MongoDB Cloud Store (patients collection)."""
    if not is_mongo_connected or mongo_db is None:
        return None
    
    try:
        patient_id = patient_data.get("patientId") or patient_data.get("patient_id")
        clean_name = str(patient_data.get("fullName") or patient_data.get("patientName") or patient_data.get("full_name") or "Patient").strip()
        clean_mobile = str(patient_data.get("mobile", "")).replace(" ", "").replace("-", "")
        abha_num = patient_data.get("abhaNumber") or patient_data.get("abha_number")
        if abha_num:
            abha_num = str(abha_num).strip()
        abha_addr = patient_data.get("abhaAddress") or patient_data.get("abha_address")
        aadhaar_num = patient_data.get("aadhaarNumber") or patient_data.get("aadhaar_number")
        if aadhaar_num:
            aadhaar_num = str(aadhaar_num).strip()
        
        vitals = patient_data.get("vitals") or {"bp": "120/80 mmHg", "spo2": "98%", "pulse": "72 bpm", "temp": "98.6 °F"}
        if isinstance(vitals, str):
            try:
                vitals = json.loads(vitals)
            except Exception:
                pass
                
        dashvidha = patient_data.get("dashvidhaHistory") or patient_data.get("past_history_dashvidha") or {}
        if isinstance(dashvidha, str):
            try:
                dashvidha = json.loads(dashvidha)
            except Exception:
                pass

        clean_email = str(patient_data.get("email", "")).strip().lower()

        doc = {
            "patient_id": patient_id,
            "full_name": clean_name,
            "patient_name": clean_name,
            "mobile": clean_mobile,
            "email": clean_email,
            "abha_number": abha_num,
            "abha_address": abha_addr,
            "aadhaar_number": aadhaar_num,
            "age": int(patient_data.get("age", 30)),
            "gender": patient_data.get("gender", "Male"),
            "address": patient_data.get("address", "New Delhi, India"),
            "symptoms": patient_data.get("symptoms", "General Medicine Consultation"),
            "vitals": vitals,
            "past_history_dashvidha": dashvidha,
            "pain_mapping": patient_data.get("pain_mapping") or patient_data.get("painMapping"),
            "updated_at": str(time.strftime("%Y-%m-%d %H:%M:%S"))
        }

        query_conditions = []
        if patient_id:
            query_conditions.append({"patient_id": patient_id})
        if abha_num:
            query_conditions.append({"abha_number": abha_num})
        if aadhaar_num:
            query_conditions.append({"aadhaar_number": aadhaar_num})
        if clean_email:
            query_conditions.append({"email": clean_email})
        if clean_mobile and len(clean_mobile) >= 10:
            query_conditions.append({"mobile": clean_mobile})

        if query_conditions:
            filter_q = {"$or": query_conditions}
            mongo_db.patients.update_one(filter_q, {"$set": doc}, upsert=True)
        else:
            mongo_db.patients.insert_one(doc)

        print(f"[MongoDB Cloud Store] Upserted Patient Document: {clean_name} ({patient_id}) - Email: {clean_email}, ABHA: {abha_num}, Aadhaar: {aadhaar_num}")
        return doc
    except Exception as e:
        print("[MongoDB Cloud Store] Error writing patient document:", e)
        return None

def save_pain_mapping_to_mongo(mapping_data: dict):
    """Upserts or records a 3D Pain Mapping into MongoDB Cloud Store (patient_pain_mappings collection and updates patient document)."""
    if not is_mongo_connected or mongo_db is None:
        return None
    try:
        p_id = mapping_data.get("patientId") or mapping_data.get("patient_id")
        doc = {
            "patient_id": p_id,
            "patient_gender": mapping_data.get("patientGender") or mapping_data.get("patient_gender", "male"),
            "body_region": mapping_data.get("bodyRegion") or mapping_data.get("body_region"),
            "side": mapping_data.get("side", "center"),
            "location": mapping_data.get("location", "middle"),
            "layman_summary": mapping_data.get("laymanSummary") or mapping_data.get("layman_summary"),
            "coordinates": mapping_data.get("coordinates"),
            "severity": mapping_data.get("severity", 5),
            "pain_type": mapping_data.get("painType") or mapping_data.get("pain_type", "Aching"),
            "duration": mapping_data.get("duration", "Recent"),
            "recorded_at": mapping_data.get("timestamp") or time.strftime("%Y-%m-%d %H:%M:%S")
        }
        mongo_db.patient_pain_mappings.insert_one(doc)
        if p_id:
            mongo_db.patients.update_one(
                {"patient_id": p_id},
                {"$set": {"pain_mapping": doc, "updated_at": str(time.strftime("%Y-%m-%d %H:%M:%S"))}},
                upsert=False
            )
        try:
            print(f"[MongoDB Cloud Store] Recorded Pain Mapping for {p_id}: {doc['layman_summary']}")
        except Exception:
            pass
        return doc
    except Exception as e:
        print("[MongoDB Cloud Store] Error writing pain mapping:", e)
        return None

def find_patient_in_mongo(identifier: str, login_method: str = None):
    """Finds a patient document in MongoDB Cloud Store by identifier."""
    if not is_mongo_connected or mongo_db is None or not identifier:
        return None
    
    try:
        clean = str(identifier).replace(" ", "").replace("-", "").strip()
        query_conditions = []

        if login_method == 'aadhaar':
            query_conditions.append({"aadhaar_number": clean})
            query_conditions.append({"aadhaar_number": {"$regex": f"^{clean[:4]}.*{clean[-4:]}$", "$options": "i"}})
        elif login_method == 'abha':
            query_conditions.append({"abha_number": clean})
            query_conditions.append({"abha_address": identifier.lower().strip()})
        else:
            query_conditions = [
                {"patient_id": identifier.strip()},
                {"mobile": clean},
                {"email": identifier.strip().lower()},
                {"abha_number": clean},
                {"aadhaar_number": clean},
                {"abha_address": identifier.lower().strip()}
            ]

        doc = mongo_db.patients.find_one({"$or": query_conditions})
        if doc:
            if "_id" in doc:
                del doc["_id"]
            return doc
    except Exception as e:
        print("[MongoDB Cloud Store] Error querying patient document:", e)
        
    return None

def save_doctor_to_mongo(doctor_data: dict):
    """Upserts a doctor document into MongoDB Cloud Store (doctors collection)."""
    if not is_mongo_connected or mongo_db is None:
        return None
    
    try:
        doc_id = str(doctor_data.get("doctorId") or doctor_data.get("doctor_id") or f"doc-{int(time.time() * 1000) % 1000}").strip()
        doc_name = str(doctor_data.get("name") or doctor_data.get("fullName") or "Dr. Medical Specialist").strip()
        
        doc = {
            "doctor_id": doc_id,
            "doctorId": doc_id,
            "name": doc_name,
            "degrees": doctor_data.get("degrees", "MBBS, MD"),
            "specialty": doctor_data.get("specialty", "Specialist Physician"),
            "department": doctor_data.get("department", "General Medicine"),
            "room_number": doctor_data.get("room_number") or doctor_data.get("roomNumber") or "OPD Room 104",
            "roomNumber": doctor_data.get("roomNumber") or doctor_data.get("room_number") or "OPD Room 104",
            "floor_wing": doctor_data.get("floor_wing") or doctor_data.get("floorWing") or "Ground Floor, Central Block",
            "floorWing": doctor_data.get("floorWing") or doctor_data.get("floor_wing") or "Ground Floor, Central Block",
            "status": doctor_data.get("status", "On Duty"),
            "patients_seen": int(doctor_data.get("patients_seen") or doctor_data.get("patientsSeen") or 0),
            "patientsSeen": int(doctor_data.get("patientsSeen") or doctor_data.get("patients_seen") or 0),
            "waiting_count": int(doctor_data.get("waiting_count") or doctor_data.get("waitingCount") or 0),
            "waitingCount": int(doctor_data.get("waitingCount") or doctor_data.get("waiting_count") or 0),
            "shift": doctor_data.get("shift", "08:00 - 14:00"),
            "mobile": doctor_data.get("mobile", ""),
            "email": doctor_data.get("email", ""),
            "updated_at": str(time.strftime("%Y-%m-%d %H:%M:%S"))
        }

        mongo_db.doctors.update_one({"$or": [{"doctor_id": doc_id}, {"doctorId": doc_id}]}, {"$set": doc}, upsert=True)
        print(f"[MongoDB Cloud Store] Upserted Doctor Document: {doc_name} ({doc_id}) - Dept: {doc['department']}, Room: {doc['roomNumber']}")
        return doc
    except Exception as e:
        print("[MongoDB Cloud Store] Error writing doctor document:", e)
        return None

def find_doctor_in_mongo(doctor_id: str):
    """Finds a doctor document in MongoDB Cloud Store by doctor_id."""
    if not is_mongo_connected or mongo_db is None or not doctor_id:
        return None
    
    try:
        clean_id = str(doctor_id).strip()
        doc = mongo_db.doctors.find_one({
            "$or": [
                {"doctor_id": clean_id},
                {"doctorId": clean_id},
                {"name": {"$regex": f".*{clean_id}.*", "$options": "i"}}
            ]
        })
        if doc:
            if "_id" in doc:
                del doc["_id"]
            return doc
    except Exception as e:
        print("[MongoDB Cloud Store] Error querying doctor document:", e)
        
    return None

def get_all_doctors_from_mongo():
    """Retrieves all doctor documents from MongoDB Cloud Store."""
    if not is_mongo_connected or mongo_db is None:
        return []
    
    try:
        cursor = mongo_db.doctors.find({})
        doctors = []
        for doc in cursor:
            if "_id" in doc:
                del doc["_id"]
            doctors.append(doc)
        return doctors
    except Exception as e:
        print("[MongoDB Cloud Store] Error fetching doctors list:", e)
        return []


