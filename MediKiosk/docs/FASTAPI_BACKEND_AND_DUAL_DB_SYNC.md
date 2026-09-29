# ⚡ FastAPI Backend, Microservices & Dual Database Synchronization

---

## 📌 Executive Summary

MediKiosk utilizes an enterprise-grade, asynchronous backend architecture powered by **FastAPI (Python 3.10+)**, designed for hospital edge deployment with continuous cloud replication.

The architecture solves two critical healthcare IT challenges in India:
1. **Zero-Latency Offline Resilience**: Terminals continue issuing OPD tokens and verifying biometrics even during total hospital internet outages via a local **SQLite3 Edge Database** (`backend/database/medikiosk_edge.db`).
2. **Centralized Hospital Telemetry**: When network connectivity is healthy, transactions are replicated in real-time to a centralized **MongoDB Cloud Database** (`medikiosk_cloud_db`), enabling cross-departmental queues, doctor chamber sync, and admin analytics.

---

## 🏛️ System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Hospital Kiosk Fleet & Portals                    │
│   ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│   │ Patient Touch Kiosks │  │  Doctor Chambers     │  │  Admin Console   │  │
│   └──────────┬───────────┘  └──────────┬───────────┘  └────────┬─────────┘  │
└──────────────┼─────────────────────────┼───────────────────────┼────────────┘
               │                         │                       │
               ▼                         ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MediKiosk FastAPI REST Server (Port 8000)                │
│                                                                             │
│  ┌───────────────────────┐ ┌────────────────────────┐ ┌──────────────────┐  │
│  │ patient_routes.py     │ │ doctor_routes.py       │ │ admin_routes.py  │  │
│  │ • /verify-identifier  │ │ • /login               │ │ • /login         │  │
│  │ • /send-otp           │ │ • /queue/{doctorId}    │ │ • /telemetry     │  │
│  │ • /verify-otp         │ │ • /call-next           │ │ • /rebalance     │  │
│  │ • /biometric-auth     │ │ • /complete-consult    │ │ • /kiosk/print   │  │
│  │ • /register           │ │ • /mark-seen           │ │ • /doctor/status │  │
│  │ • /issue-ticket       │ │ • /list                │ └──────────────────┘  │
│  │ • /pain-mapping/*     │ └────────────────────────┘                       │
│  └───────────────────────┘                                                  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Microservices Layer                                                    │  │
│  │ • abdm_service.py: Mock ABDM Gateway & ABHA verification               │  │
│  │ • biometric_service.py: ISO/IEC 19794-2 biometric minutiae matcher    │  │
│  │ • email_service.py: SMTP asynchronous token and OTP notification email  │  │
│  │ • queue_service.py: Departmental load balancing & token sequencer      │  │
│  │ • telemetry_service.py: Aggregate KPIs & hourly intake analytics      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└───────────────────────┬──────────────────────────────────┬──────────────────┘
                        │                                  │
                        ▼ (Zero-Latency Local)             ▼ (Auto-Sync Stream)
             ┌─────────────────────┐            ┌─────────────────────┐
             │ SQLite3 Edge Engine │            │ MongoDB Cloud Vault │
             │ (medikiosk_edge.db) │            │ (Cloud Replica Set) │
             └─────────────────────┘            └─────────────────────┘
```

---

## 🗄️ Dual-Database Engine Specification

### 1. SQLite3 Local Edge Database (`medikiosk_edge.db`)
Stored locally on the kiosk terminal hardware at `backend/database/medikiosk_edge.db`:
- **Role**: High-availability, instant write target for patient check-in transactions.
- **Tables**:
  - `patients`: Local cached demographic data, ABHA IDs, Aadhaar hashes, and contact information.
  - `queue_tickets`: Token numbers (`OPD-A-042`), assigned doctor ID, department, room, timestamp, status (`WAITING`, `CALLED`, `SEEN`), and `synced_to_cloud` boolean flag.
  - `doctors`: Doctor roster, specialization, chamber room number, on-duty status, and active queue counts.
  - `telemetry_logs`: Event-level logs of kiosk logins, scan methods, error rates, and response latencies.

### 2. MongoDB Cloud Database (`medikiosk_cloud_db`)
Centralized cloud or server cluster running on `127.0.0.1:27017` (configurable via `.env`):
- **Role**: Longitudinal electronic medical records, cross-chambers synchronization, and hospital-wide governance.
- **Collections**:
  - `queue_tickets`: BSON documents storing all historical and live queue events.
  - `patients`: Full master patient index with encrypted clinical vitals and past encounters.
  - `local_master_doctors`: Verified registry of medical practitioners and credentials.
  - `abdm_health_records`: Standardized FHIR JSON resources (Encounter, DiagnosticReport).

---

## 🛠️ Microservices Subsystems

### 1. Queue Management Service (`queue_service.py`)
- Automatically balances load across available doctor chambers.
- Departmental prefixing: `OPD-A-***` (General Medicine), `OPD-B-***` (AYUSH / Ayurveda), `OPD-C-***` (Cardiology / Emergency), `OPD-N-***` (New Registrations).
- Auto-rebalance algorithm: Redistributes waiting patients when a physician is called to emergency or chamber wait times exceed 20 minutes.

### 2. Biometric Minutiae Service (`biometric_service.py`)
- Emulates STQC-certified biometric sensor integration (Morpho / Mantra MFS100).
- Matches simulated fingerprint templates against encrypted Aadhaar hashes.
- Enforces liveness detection and fake finger rejection safeguards.

### 3. Asynchronous Email & Notification Service (`email_service.py`)
- Uses Python `smtplib` and `email.mime` to dispatch instant check-in confirmations.
- Sends:
  - Digital OPD Token slips with QR codes.
  - OTP verification codes for login authorization.
  - Prescriptions and follow-up consultation reminders.

### 4. ABDM Gateway Service (`abdm_service.py`)
- Adheres to ABDM 2.0 specifications.
- Handles ABHA verification via `v1/auth/init` and `v1/auth/confirmWithAadhaarOtp`.
- Provides digital consent token generation conforming to the DPDP Act 2023.

---

## 📊 Database Administration & MongoDB GUI

The repository includes a dedicated lightweight MongoDB administration GUI:
- Server: `mongo_gui_server.py`
- Frontend: `mongo_gui.html`
- Access: Run `python mongo_gui_server.py` and open `http://localhost:5000` to inspect BSON collections, run queries, and verify edge-to-cloud synchronization status.

---

## 🚀 Running the Backend Server

```powershell
# Navigate to backend directory
cd s:\git_SIH_2026\MEDIKIOSKackend

# Install dependencies
pip install -r requirements.txt

# Launch FastAPI server with Uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger API documentation is immediately available at `http://127.0.0.1:8000/docs`.
