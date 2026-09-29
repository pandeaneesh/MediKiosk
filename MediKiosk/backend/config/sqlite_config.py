import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "database", "medikiosk_edge.db")
SQL_SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "..", "database", "sqlite_edge.sql")

def get_db_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_sqlite_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if os.path.exists(SQL_SCHEMA_PATH):
        with open(SQL_SCHEMA_PATH, "r", encoding="utf-8") as f:
            sql_script = f.read()
        cursor.executescript(sql_script)
        conn.commit()
        print("[SQLite Engine] Edge database schema & tables initialized successfully.")
    
    # Auto Migration Check for patients
    cursor.execute("PRAGMA table_info(patients)")
    cols = [row["name"] if isinstance(row, sqlite3.Row) else row[1] for row in cursor.fetchall()]
    
    if "abha_number" not in cols:
        cursor.execute("ALTER TABLE patients ADD COLUMN abha_number TEXT;")
        cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_abha_num ON patients(abha_number) WHERE abha_number IS NOT NULL;")
        conn.commit()

    if "abha_address" not in cols:
        cursor.execute("ALTER TABLE patients ADD COLUMN abha_address TEXT;")
        cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_abha_addr ON patients(abha_address) WHERE abha_address IS NOT NULL;")
        conn.commit()

    if "aadhaar_number" not in cols:
        cursor.execute("ALTER TABLE patients ADD COLUMN aadhaar_number TEXT;")
        cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_aadhaar ON patients(aadhaar_number) WHERE aadhaar_number IS NOT NULL;")
        conn.commit()

    if "email" not in cols:
        cursor.execute("ALTER TABLE patients ADD COLUMN email TEXT;")
        conn.commit()

    if "hospital_id" not in cols:
        cursor.execute("ALTER TABLE patients ADD COLUMN hospital_id TEXT DEFAULT 'HOSP-AIIMS-01';")
        conn.commit()

    if "user_id" not in cols:
        cursor.execute("ALTER TABLE patients ADD COLUMN user_id TEXT;")
        conn.commit()

    if "pain_mapping" not in cols:
        cursor.execute("ALTER TABLE patients ADD COLUMN pain_mapping TEXT;")
        conn.commit()
        print("[SQLite Engine] Migrated patients table: added pain_mapping column.")

    if "token_number" not in cols:
        cursor.execute("ALTER TABLE patients ADD COLUMN token_number TEXT;")
        conn.commit()
        print("[SQLite Engine] Migrated patients table: added token_number column.")

    if "summary" not in cols:
        cursor.execute("ALTER TABLE patients ADD COLUMN summary TEXT;")
        conn.commit()
        print("[SQLite Engine] Migrated patients table: added summary column.")

    cursor.execute("""
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
            coordinates TEXT,
            recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    # Auto Migration Check for patient_pain_mappings columns
    cursor.execute("PRAGMA table_info(patient_pain_mappings)")
    pain_cols = [row["name"] if isinstance(row, sqlite3.Row) else row[1] for row in cursor.fetchall()]

    if "severity" not in pain_cols:
        cursor.execute("ALTER TABLE patient_pain_mappings ADD COLUMN severity INTEGER DEFAULT 5;")
        conn.commit()

    if "pain_intensity" not in pain_cols:
        cursor.execute("ALTER TABLE patient_pain_mappings ADD COLUMN pain_intensity INTEGER DEFAULT 5;")
        conn.commit()

    if "pain_type" not in pain_cols:
        cursor.execute("ALTER TABLE patient_pain_mappings ADD COLUMN pain_type TEXT DEFAULT 'Aching';")
        conn.commit()

    if "duration" not in pain_cols:
        cursor.execute("ALTER TABLE patient_pain_mappings ADD COLUMN duration TEXT DEFAULT 'Recent';")
        conn.commit()

    if "aggravating_factors" not in pain_cols:
        cursor.execute("ALTER TABLE patient_pain_mappings ADD COLUMN aggravating_factors TEXT DEFAULT 'None';")
        conn.commit()

    # Auto Migration Check for local_master_doctors
    cursor.execute("PRAGMA table_info(local_master_doctors)")
    doc_cols = [row["name"] if isinstance(row, sqlite3.Row) else row[1] for row in cursor.fetchall()]

    if "hospital_id" not in doc_cols:
        cursor.execute("ALTER TABLE local_master_doctors ADD COLUMN hospital_id TEXT DEFAULT 'HOSP-AIIMS-01';")
        conn.commit()

    if "mobile" not in doc_cols:
        cursor.execute("ALTER TABLE local_master_doctors ADD COLUMN mobile TEXT;")
        conn.commit()

    if "email" not in doc_cols:
        cursor.execute("ALTER TABLE local_master_doctors ADD COLUMN email TEXT;")
        conn.commit()

    if "avatar" not in doc_cols:
        cursor.execute("ALTER TABLE local_master_doctors ADD COLUMN avatar TEXT;")
        conn.commit()

    if "council" not in doc_cols:
        cursor.execute("ALTER TABLE local_master_doctors ADD COLUMN council TEXT;")
        conn.commit()

    if "reg_number" not in doc_cols:
        cursor.execute("ALTER TABLE local_master_doctors ADD COLUMN reg_number TEXT;")
        conn.commit()

    if "hpr_id" not in doc_cols:
        cursor.execute("ALTER TABLE local_master_doctors ADD COLUMN hpr_id TEXT;")
        conn.commit()

    if "stream" not in doc_cols:
        cursor.execute("ALTER TABLE local_master_doctors ADD COLUMN stream TEXT;")
        conn.commit()

    if "bio" not in doc_cols:
        cursor.execute("ALTER TABLE local_master_doctors ADD COLUMN bio TEXT;")
        conn.commit()

    # Auto Migration Check for offline_queue_tickets
    cursor.execute("PRAGMA table_info(offline_queue_tickets)")
    ticket_cols = [row["name"] if isinstance(row, sqlite3.Row) else row[1] for row in cursor.fetchall()]
    if "hospital_id" not in ticket_cols:
        cursor.execute("ALTER TABLE offline_queue_tickets ADD COLUMN hospital_id TEXT DEFAULT 'HOSP-AIIMS-01';")
        conn.commit()

    # Auto Migration Check for kiosk_fleet_status
    cursor.execute("PRAGMA table_info(kiosk_fleet_status)")
    kiosk_cols = [row["name"] if isinstance(row, sqlite3.Row) else row[1] for row in cursor.fetchall()]
    if "hospital_id" not in kiosk_cols:
        cursor.execute("ALTER TABLE kiosk_fleet_status ADD COLUMN hospital_id TEXT DEFAULT 'HOSP-AIIMS-01';")
        conn.commit()

    # Auto Migration Check for patient_pain_mappings
    cursor.execute("PRAGMA table_info(patient_pain_mappings)")
    pm_cols = [row["name"] if isinstance(row, sqlite3.Row) else row[1] for row in cursor.fetchall()]
    if "interview_id" not in pm_cols:
        cursor.execute("ALTER TABLE patient_pain_mappings ADD COLUMN interview_id TEXT;")
        conn.commit()
    if "pain_intensity" not in pm_cols:
        cursor.execute("ALTER TABLE patient_pain_mappings ADD COLUMN pain_intensity INTEGER DEFAULT 5;")
        conn.commit()
    if "pain_type" not in pm_cols:
        cursor.execute("ALTER TABLE patient_pain_mappings ADD COLUMN pain_type TEXT DEFAULT 'Aching';")
        conn.commit()

    conn.close()

def execute_query(query: str, params: tuple = ()):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def execute_update(query: str, params: tuple = ()):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected

if __name__ == "__main__":
    init_sqlite_db()
