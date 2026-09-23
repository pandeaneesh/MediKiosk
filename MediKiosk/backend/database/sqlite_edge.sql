-- MediKiosk SQLite3 Edge Schema (Offline-first Resilience Engine & Enterprise Tri-Portal Architecture)

CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL, -- 'PATIENT', 'DOCTOR', 'HOSPITAL_ADMIN', 'MAIN_ADMIN'
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    hospital_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hospitals (
    hospital_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    region TEXT NOT NULL,
    total_beds INTEGER DEFAULT 500,
    active_kiosks INTEGER DEFAULT 4,
    daily_patient_capacity INTEGER DEFAULT 2500,
    contact_number TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
    patient_id TEXT PRIMARY KEY,
    user_id TEXT,
    hospital_id TEXT DEFAULT 'HOSP-AIIMS-01',
    full_name TEXT NOT NULL,
    mobile TEXT NOT NULL UNIQUE,
    email TEXT,
    abha_number TEXT UNIQUE,
    abha_address TEXT UNIQUE,
    aadhaar_number TEXT UNIQUE,
    age INTEGER,
    gender TEXT,
    address TEXT,
    symptoms TEXT,
    vitals TEXT, -- JSON string
    past_history_dashvidha TEXT, -- JSON string
    pain_mapping TEXT, -- JSON string
    token_number TEXT,
    summary TEXT,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS local_master_doctors (
    doctor_id TEXT PRIMARY KEY,
    hospital_id TEXT DEFAULT 'HOSP-AIIMS-01',
    name TEXT NOT NULL,
    degrees TEXT,
    specialty TEXT,
    department TEXT NOT NULL,
    room_number TEXT NOT NULL,
    floor_wing TEXT,
    status TEXT DEFAULT 'On Duty',
    patients_seen INTEGER DEFAULT 0,
    waiting_count INTEGER DEFAULT 0,
    shift TEXT,
    mobile TEXT,
    email TEXT,
    avatar TEXT,
    council TEXT,
    reg_number TEXT,
    hpr_id TEXT,
    stream TEXT,
    bio TEXT
);

CREATE TABLE IF NOT EXISTS appointments (
    appointment_id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    doctor_id TEXT NOT NULL,
    hospital_id TEXT DEFAULT 'HOSP-AIIMS-01',
    department TEXT NOT NULL,
    appointment_date TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    token_number TEXT NOT NULL,
    status TEXT DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'WAITING', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY(doctor_id) REFERENCES local_master_doctors(doctor_id),
    FOREIGN KEY(hospital_id) REFERENCES hospitals(hospital_id)
);

CREATE TABLE IF NOT EXISTS interviews (
    interview_id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    appointment_id TEXT,
    doctor_id TEXT,
    hospital_id TEXT DEFAULT 'HOSP-AIIMS-01',
    session_id TEXT UNIQUE,
    complaint TEXT,
    symptoms TEXT,
    duration TEXT,
    severity INTEGER DEFAULT 5,
    pain_location TEXT,
    pain_intensity INTEGER,
    medical_system TEXT DEFAULT 'allopathy', -- 'allopathy' / 'ayush'
    language TEXT DEFAULT 'english',
    ai_summary TEXT, -- JSON string
    clinical_data TEXT, -- JSON string
    messages TEXT, -- JSON string (all questions and patient answers)
    red_flags TEXT, -- JSON string
    is_completed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(patient_id) REFERENCES patients(patient_id)
);

CREATE TABLE IF NOT EXISTS patient_pain_mappings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT NOT NULL,
    interview_id TEXT,
    patient_gender TEXT,
    body_region TEXT NOT NULL,
    side TEXT,
    location TEXT,
    pain_intensity INTEGER DEFAULT 5,
    severity INTEGER DEFAULT 5,
    pain_type TEXT DEFAULT 'Aching',
    duration TEXT DEFAULT 'Recent',
    aggravating_factors TEXT DEFAULT 'None',
    layman_summary TEXT NOT NULL,
    coordinates TEXT, -- JSON string [x, y, z]
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(patient_id) REFERENCES patients(patient_id)
);

CREATE TABLE IF NOT EXISTS medical_documents (
    document_id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    appointment_id TEXT,
    title TEXT NOT NULL,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    document_type TEXT DEFAULT 'PRESCRIPTION', -- 'PRESCRIPTION', 'LAB_REPORT', 'DISCHARGE_SUMMARY', 'OTHER'
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    extracted_text TEXT,
    entities_json TEXT, -- JSON string containing medications, lab tests, vitals
    summary TEXT, -- JSON string or physician summary text
    file_url TEXT,
    status TEXT DEFAULT 'completed', -- 'uploaded', 'processing', 'completed', 'failed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(patient_id) REFERENCES patients(patient_id)
);

CREATE TABLE IF NOT EXISTS consultations (
    consultation_id TEXT PRIMARY KEY,
    appointment_id TEXT,
    patient_id TEXT NOT NULL,
    doctor_id TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    prescription_json TEXT, -- JSON array of prescribed medicines
    clinical_notes TEXT,
    advice TEXT,
    ayurvedic_notes TEXT, -- JSON object for Ayush insights
    follow_up_date TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY(doctor_id) REFERENCES local_master_doctors(doctor_id)
);

CREATE TABLE IF NOT EXISTS medical_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT NOT NULL,
    condition TEXT NOT NULL,
    diagnosed_year TEXT,
    status TEXT DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(patient_id) REFERENCES patients(patient_id)
);

CREATE TABLE IF NOT EXISTS offline_queue_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT UNIQUE NOT NULL,
    token_number INTEGER NOT NULL,
    patient_id TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    doctor_id TEXT NOT NULL,
    hospital_id TEXT DEFAULT 'HOSP-AIIMS-01',
    department TEXT NOT NULL,
    room_number TEXT NOT NULL,
    kiosk_id TEXT NOT NULL,
    status TEXT DEFAULT 'WAITING', -- 'WAITING', 'IN_CHAMBER', 'SEEN', 'CANCELLED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    synced_to_cloud INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS kiosk_fleet_status (
    kiosk_id TEXT PRIMARY KEY,
    hospital_id TEXT DEFAULT 'HOSP-AIIMS-01',
    location TEXT NOT NULL,
    status TEXT DEFAULT 'Online',
    paper_level INTEGER DEFAULT 100,
    biometric_status TEXT DEFAULT 'OK (STQC Certified)',
    touchscreen_status TEXT DEFAULT 'Calibrated (100%)',
    today_registrations INTEGER DEFAULT 0,
    latency_ms INTEGER DEFAULT 20,
    last_ping TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_config (
    config_key TEXT PRIMARY KEY,
    config_value TEXT NOT NULL
);
