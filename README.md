# 🏥 MediKiosk — Smart Healthcare, ABDM Check-In, Clinical Triage & Hospital Intelligence

[![Smart India Hackathon](https://img.shields.io/badge/SIH-Smart%20India%20Hackathon%202026-blue?style=for-the-badge&logo=mediamarkt)](https://smartindiahackathon.gov.in)
[![ABDM 2.0 Compliant](https://img.shields.io/badge/ABDM%202.0-Ayushman%20Bharat-emerald?style=for-the-badge&logo=shield)](https://abdm.gov.in)
[![DPDP Act 2023](https://img.shields.io/badge/DPDP%20Act%202023-Consent%20Compliant-indigo?style=for-the-badge&logo=lock)](https://www.meity.gov.in)
[![FastAPI Core](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2+-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Python Tests](https://img.shields.io/badge/Python%20Tests-7%2F7%20Passed-success?style=for-the-badge&logo=python)](https://www.python.org/)

**MediKiosk** is an enterprise-grade, offline-resilient, tri-portal healthcare intake, AI clinical triage, and hospital operations platform designed for Indian public district hospitals, Community Health Centers (CHCs), Primary Health Centers (PHCs), and multi-hospital networks.

Operating across **Patient Kiosks**, **Doctor OPD Chambers**, and **Multi-Hospital Admin Command Centers**, MediKiosk eliminates hours of physical OPD waiting through trilingual voice guidance, conversational AI triage (SOCRATES + AYUSH), 3D anatomical pain mapping, OCR paper document scanning, and dual-database edge-to-cloud synchronization.

---

## 🌟 Core System Portals & Features

```
                               ┌──────────────────────────────────────────────┐
                               │           MediKiosk Master Gateway           │
                               │      (Landing Page / Role Dispatcher)        │
                               └──────────────────────┬───────────────────────┘
                                                      │
             ┌────────────────────────────────────────┼────────────────────────────────────────┐
             │                                        │                                        │
             ▼                                        ▼                                        ▼
 ┌───────────────────────┐                ┌───────────────────────┐                ┌───────────────────────┐
 │   🔵 Patient Portal   │                │   🟢 Doctor Portal    │                │    🟣 Admin Portal    │
 │   & 6-Tab Dashboard   │                │  & Clinical Chamber   │                │   (Single Login)      │
 └───────────┬───────────┘                └───────────┬───────────┘                └───────────┬───────────┘
             │                                        │                                        │
 ┌───────────┴───────────┐                ┌───────────┴───────────┐                ┌───────────┴───────────┐
 │ • OPD Token & Vitals  │                │ • Live Intake Queue   │                │ 🇮🇳 Main/Gov Admin:     │
 │ • AI Interview (SOC)  │                │ • Auto History Packet │                │   National Multi-Hosp │
 │ • 3D Pain Mapping     │                │ • 3D Pain Coordinates │                │   Outbreak Radar      │
 │ • OCR Medical Scanner │                │ • OCR Extracted Labs  │                │   Load Balancing      │
 │ • Book Appointments   │                │ • Dashavidha Pariksha │                │ 🏥 Hospital Admin:    │
 │ • Profile & History   │                │ • Digital Rx Pad      │                │   Local Queues/Roster │
 └───────────────────────┘                └───────────────────────┘                └───────────────────────┘
```

### 1. 🔵 Patient Portal & 6-Tab Interactive Dashboard (`src/PatientDashboard.jsx`)
Strict **`patient_id` data isolation** is enforced across all 6 patient tabs (Patient A never sees Patient B data):
- **1. OPD Token & Live Directions**: Instant queue token generation (`OPD-A-042`), estimated wait time, live sensor vitals (BP, SpO2, Pulse, Temp), and doctor chamber direction cards.
- **2. AI Health Interview (SOCRATES + AYUSH)**:
  - Conversational clinical triage engine assessing *Site, Onset, Character, Radiation, Associations, Timing, Exacerbating/relieving factors, Severity*.
  - Mode selector for **Modern Medicine (Allopathy)** or **Classical Ayurveda (AYUSH)**.
  - Automated **Red-Flag Emergency Detection** (e.g. Acute Coronary Syndrome, severe respiratory distress).
  - Trilingual voice guidance (**English, Hindi, Marathi**).
- **3. 3D Anatomical Pain Mapping & Digital Mannequin**:
  - Interactive spatial 3D body region raycasting (`[x, y, z]` coordinates) and 2D fallback mesh.
  - Visual Analog Scale (VAS 1–10) pain intensity slider, character picker (Throbbing, Sharp, Burning, Dull), and aggravate factor toggles.
- **4. OCR Medical Document Scanner**:
  - Scans physical paper prescriptions, discharge summaries, and laboratory test reports.
  - Automatic entity extraction for medications, clinical findings, dates, and doctor advice.
- **5. Book Appointments**:
  - Real-time departmental doctor directory, live consultation status, and slot reservation.
- **6. Profile & Medical History**:
  - Editable demographic records, emergency contacts, allergy lists, and chronological past consultation history.

---

### 2. 🟢 Doctor Portal & Clinical Consultation Workspace (`src/PhysicianDashboard.jsx`)
- **Live Intake Queue**: Real-time patient queue calling synchronized with the hospital kiosk intake.
- **Automated Clinical History Packet**: Selecting a patient automatically pulls their full clinical record via `api.getPatientClinicalHistory(patientId)`:
  - Chief complaint & SOCRATES AI interview summary.
  - 3D Pain mapping coordinates with 1-click 3D Mannequin inspector.
  - OCR extracted paper records & historical hospital visits.
  - 10-parameter Ayurvedic **Dashavidha Pariksha** (*Prakriti, Vikriti, Sara, Samhanana, Pramana, Satmya, Sattva, Ahara, Vyayama, Vaya*).
- **Interactive Prescription Pad & Sign-Off**:
  - 1-click clinical investigation orders (ECG, Troponin-I, CBC, Blood Sugar, Pantoprazole, etc.).
  - Medication prescription builder (Drug name, dosage, frequency, duration, instructions).
  - Clinical notes and primary diagnosis entry.
  - Completes consultation and updates ticket status to `COMPLETED` in SQLite edge database.

---

### 3. 🟣 Admin Command Center (`src/AdminDashboard.jsx`)
A single unified login screen at `/admin` automatically determines administrator privileges:

#### A. National Multi-Hospital Surveillance (`MAIN_ADMIN` — e.g. `director@mohfw.gov.in`)
- **Apex Facility Comparison**: Real-time cross-facility surveillance across:
  1. **AIIMS New Delhi** (`HOSP-001` — Northern Hub)
  2. **Safdarjung Hospital** (`HOSP-002` — NCR Hub)
  3. **Pune District Civil Hospital** (`HOSP-003` — Western Hub)
  4. **Kasturba Medical College (KMC), Manipal** (`HOSP-004` — Southern Hub)
- **Nationwide Aggregated KPIs**: Total national footfall (`5,420+`), national average wait time (`15.2 mins`), active kiosk fleet status (`16/16 Online`), and active doctor chambers (`60/76 Active`).
- **AI Epidemiological Outbreak Radar**: Real-time disease cluster detection (e.g. Dengue alert in Pune, respiratory surge in NCR).
- **Inter-Hospital Load Balancer**: Automated capacity recommendations and token diversion across neighboring hospitals.

#### B. Local Hospital Command Center (`HOSPITAL_ADMIN` — e.g. `admin@aiims.edu`)
- **Hospital-Scoped Operations**: Scoped to the assigned facility (`HOSP-001` AIIMS New Delhi, etc.).
- **Live OPD Queues & Load**: Real-time department counters, chamber occupancy, and queue rebalancing.
- **User & Customer Analytics**: Login telemetry, method breakdown (ABHA, Aadhaar, Biometric, Email), hourly intake curves, cohort retention (`78.4%`), and catchment demographics.
- **Doctor Roster Management**: On Duty / In Emergency / On Break shift toggling.
- **Kiosk Fleet Diagnostics**: Paper level monitoring, biometric sensor status, latency ping, remote reboot, and test slip printing.
- **ABDM Compliance & MongoDB Vault**: FHIR resource logs and direct MongoDB BSON collection inspector.

---

## ⚡ Dual Database & Offline-First Resilience

```
                                  ┌─────────────────────────────┐
                                  │    Kiosk Touch Terminal     │
                                  └──────────────┬──────────────┘
                                                 │
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │   SQLite3 Edge Database     │  <--- Zero-Latency Local Edge
                                  │    (medikiosk_edge.db)      │       100% Offline Functional
                                  └──────────────┬──────────────┘
                                                 │
                                   [ Auto-Sync Background Worker ]
                                                 │
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │    MongoDB Cloud Replica    │  <--- Cloud Aggregation
                                  │    (medikiosk_cloud_db)     │       ABDM Gateway Node
                                  └─────────────────────────────┘
```

- **Zero-Latency Offline Edge**: Local **SQLite3 Edge Database** (`backend/database/medikiosk_edge.db`) guarantees patient check-in, token issuance, AI interview, and doctor consultations continue without interruption during hospital network outages.
- **Auto-Schema Migrations**: `backend/config/sqlite_config.py` verifies relational integrity and auto-adds missing columns on startup without data loss.
- **Centralized Cloud Sync**: Transactions replicate to **MongoDB** (`medikiosk_cloud_db`) whenever cloud connectivity is active.

---

## 📁 Repository Structure

```
MEDIKIOSK/
├── src/                                # ⚛️ React 18 + Vite Frontend Source
│   ├── App.jsx                         # Tri-Portal Master Router & Role Selector
│   ├── LoginKiosk.jsx                  # Patient Check-In Kiosk Interface & Auth
│   ├── PatientDashboard.jsx            # 6-Tab Complete Patient Portal
│   ├── DoctorLogin.jsx                 # Doctor Authentication & Registration
│   ├── PhysicianDashboard.jsx          # Doctor Clinical Console & Rx Pad
│   ├── AdminLogin.jsx                  # Single Unified Common Admin Login
│   ├── AdminDashboard.jsx              # National Surveillance & Hospital Command Center
│   ├── components/                     # Modals (Biometric, OTP, New Patient, Consent)
│   ├── data/                           # Mock analytics & telemetry dataset
│   └── utils/                          # Async API client (`api.js`), audio TTS, translations
├── backend/                            # ⚡ Python Enterprise Backend Core
│   ├── server.py                       # High-performance multi-threaded API server
│   ├── test_backend.py                 # Automated 7-test backend integration suite
│   ├── config/                         # SQLite (`sqlite_config.py`) & Mongo config
│   ├── database/                       # Schema (`sqlite_edge.sql`) & seeder (`seed_data.py`)
│   ├── models/                         # Pydantic schemas (`schemas.py`)
│   ├── routes/                         # Patient, Doctor, and Admin routes
│   └── services/                       # ABDM, Biometric, Email & Queue services
├── AI/backend/app/engine/              # 🧠 Conversational SOCRATES Triage Engine
├── document intelligent/               # 📄 OCR Document Processing Pipeline
├── PatientCaseTaking/                  # 🧍 3D Anatomical Pain Mapping Module
├── standalone_kiosk.html               # ⚡ Standalone portable offline terminal
├── package.json                        # Node dependencies & build scripts
└── vite.config.js                      # Vite bundler configuration
```

---

## 🚀 Quick Start Guide

### 1. Instant 1-Click Launch (All-In-One Launcher)
Simply execute `./s.bat` in your root terminal:
```powershell
./s.bat
```
*This automatically clears old port conflicts, initializes and seeds the SQLite edge database, starts the Python API backend on port 8000, checks npm dependencies, starts the Vite frontend, and opens `http://localhost:5173` in your browser.*

---

### 2. Manual Developer Mode

#### Step A: Start the Backend API Server
```powershell
cd backend
python server.py      # Automatically seeds SQLite Edge DB & starts server on http://127.0.0.1:8000
```

#### Step B: Start the Frontend Dev Server
```powershell
npm install
npm run dev
```
Open **`http://localhost:5173`** in your web browser.

#### Step C: Build for Production
```powershell
npm run build
```

---

## 🔑 Pre-Configured Demo Credentials

| Portal | Role | Username / Identifier | Password / PIN | Scope / Description |
|---|---|---|---|---|
| **Patient Kiosk** | Patient | `14-8892-4412-9031` (ABHA) or `5481 9023 1184` (Aadhaar) | OTP: `123456` | Access full 6-tab Patient Dashboard (`PT-8841`) |
| **Doctor Portal** | Doctor | `doc-1` (Dr. Rajeshwar Sharma) | PIN: `1234` | General Medicine OPD Room 104 consultation |
| **Doctor Portal** | Doctor (AYUSH) | `doc-2` (Vaidya Ananya Deshpande) | PIN: `1234` | Ayurvedic OPD Room 208 with Dashavidha |
| **Admin Portal** | National Admin | `director@mohfw.gov.in` (or `main_admin`) | `main_admin` | 🇮🇳 National Multi-Hospital Surveillance |
| **Admin Portal** | Hospital Admin | `admin@aiims.edu` (or `hosp_admin`) | `hosp_admin` | 🏥 AIIMS New Delhi (`HOSP-001`) Command Center |

---

## 🧪 Automated Verification & Testing

### 1. Backend Integration Test Suite
```powershell
cd backend
python test_backend.py
```
**Results (7/7 Passed):**
- [x] `test_patient_data_isolation`: Strict data isolation between Patient A (`PT-8841`) and Patient B (`PT-1204`).
- [x] `test_ai_health_interview_socrates`: Multilingual SOCRATES conversation turns & interview saving.
- [x] `test_3d_pain_mapping_storage`: 3D spatial coordinate persistence & VAS scoring.
- [x] `test_ocr_document_extraction`: Prescription and lab report entity extraction.
- [x] `test_doctor_patient_clinical_history`: Complete history packet retrieval for clinician review.
- [x] `test_doctor_consultation_save`: Digital Rx signing and queue ticket completion.
- [x] `test_common_admin_login_and_scoping`: Role determination for `HOSPITAL_ADMIN` and `MAIN_ADMIN`.

### 2. Frontend Production Compilation
```powershell
npm run build
# Output: ✓ 1604 modules transformed, built in 7.25s with 0 errors.
```

---

## 📜 Regulatory & Compliance Standards

- **Ayushman Bharat Digital Mission (ABDM 2.0)**: Compliant with NHA guidelines for ABHA ID, Health Facility Registry (HFR), and Health Professional Registry (HPR).
- **Digital Personal Data Protection (DPDP) Act 2023**: Implements Section 6 itemized consent notice, multi-lingual audio privacy disclosure, and data minimization.
- **AYUSH Clinical Framework**: Standardized *Dashavidha Pariksha* EHR templates according to NCISM guidelines.
- **Security & Privacy**: TLS 1.3 transport encryption, AES-256 local database encryption at rest, and zero third-party telemetry tracking.

---

## 👥 Hackathon Details

- **Project**: MediKiosk — Smart Healthcare & ABDM Outpatient Platform
- **Deployment**: Edge Kiosks • Touch Screens • Clinician Desktops • Hospital LANs
- **Compliance**: ABDM 2.0 & DPDP Act 2023
- **Target Event**: Smart India Hackathon (SIH 2026)
