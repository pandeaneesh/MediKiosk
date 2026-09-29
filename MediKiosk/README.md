# 🏥 MediKiosk — Smart Healthcare, ABDM Check-In, Clinical Triage & Hospital Intelligence

[![Smart India Hackathon](https://img.shields.io/badge/SIH-Smart%20India%20Hackathon%202026-blue?style=for-the-badge&logo=mediamarkt)](https://smartindiahackathon.gov.in)
[![ABDM 2.0 Compliant](https://img.shields.io/badge/ABDM%202.0-Ayushman%20Bharat-emerald?style=for-the-badge&logo=shield)](https://abdm.gov.in)
[![DPDP Act 2023](https://img.shields.io/badge/DPDP%20Act%202023-Consent%20Compliant-indigo?style=for-the-badge&logo=lock)](https://www.meity.gov.in)
[![FastAPI Core](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r128+-049EF4?style=for-the-badge&logo=threedotjs)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2+-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)

**MediKiosk** is an enterprise-grade, offline-resilient, tri-portal healthcare intake, AI clinical triage, and hospital operations platform designed for Indian public district hospitals, Community Health Centers (CHCs), Primary Health Centers (PHCs), and multi-hospital networks.

Operating across **Patient Touch Kiosks**, **Doctor OPD Chambers**, and **Hospital/National Admin Command Centers**, MediKiosk eliminates hours of physical OPD waiting through trilingual voice guidance, conversational AI triage (SOCRATES + AYUSH), interactive 3D anatomical pain mapping, Classical Ayurvedic Dashavidha Pariksha, OCR document intelligence, and dual-database edge-to-cloud synchronization.

---

## 🌟 Architecture & Tri-Portal Ecosystem

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
 │  & 9-Tab Touch Kiosk  │                │  & Clinical Chamber   │                │   (Single Login)      │
 └───────────┬───────────┘                └───────────┬───────────┘                └───────────┬───────────┘
             │                                        │                                        │
 ┌───────────┴───────────┐                ┌───────────┴───────────┐                ┌───────────┴───────────┐
 │ • OPD Token & Chamber │                │ • Live Intake Queue   │                │ 🇮🇳 Main/Gov Admin:     │
 │ • Dashavidha Pariksha │                │ • Auto History Packet │                │   National Multi-Hosp │
 │ • 3D Pain Mannequin   │                │ • 3D Pain Coordinates │                │   Outbreak Radar      │
 │ • AI Interview (Voice)│                │ • OCR Extracted Labs  │                │   Load Balancing      │
 │ • OCR Medical Scanner │                │ • Dashavidha Pariksha │                │ 🏥 Hospital Admin:    │
 │ • Book Appointments   │                │ • Digital Rx Pad      │                │   Local Queues/Roster │
 │ • Health Profile (ABHA│                │ • Sign-Off & Rx PDF   │                │   Kiosk Fleet Health  │
 │ • Vitals & Wayfinding │                │ • Telemetry Sync (4s) │                │   MongoDB Vault       │
 └───────────────────────┘                └───────────────────────┘                └───────────────────────┘
```

---

## 🚀 Core Features & Capabilities

### 1. 🔵 Patient Portal & Interactive Kiosk (`src/PatientDashboard.jsx`)
Strict **`patient_id` data isolation** is enforced across all 9 patient tabs:
1. **OPD Token & Chamber**: Instant token generation (`OPD-A-042`), live queue position, estimated wait time calculation, and assigned doctor chamber routing.
2. **Dashavidha Pariksha (दशविध परीक्षा)**:
   - Classical 10-fold Ayurvedic diagnostic examination (*Charaka Samhita Vimanasthana 8/94*).
   - Evaluates *Prakriti* (Natural Constitution), *Vikriti* (Current Imbalance), *Sara* (Tissue Quality), *Samhanana* (Compactness), *Pramana* (Anthropometry), *Satmya* (Adaptability), *Sattva* (Mental Resolve), *Ahara Shakti* (Digestive Agni), *Vyayama Shakti* (Endurance), and *Vaya* (Age factor).
   - Generates personalized *Pathya* (diet & lifestyle routine) and auto-transitions to 3D pain localization.
3. **3D Anatomical Pain Localization Mannequin**:
   - WebGL Three.js interactive 3D digital human mannequin with male and female models (`female_base_rev1.glb`, `male_model.glb`).
   - Touch/click raycasting for 3D coordinate mapping (`[x, y, z]`) and instant landmark pinning (chest, abdomen, lower back, knees, cervical spine, temples, etc.).
   - Visual Analog Scale (VAS 1–10) pain intensity slider, character selector (Aching, Throbbing, Sharp, Burning, Dull), and live telemetry transmission to the consulting doctor's chamber.
4. **AI-Assisted Health Interview (SOCRATES + AYUSH + Bhashini Voice)**:
   - Conversational clinical intake engine assessing *Site, Onset, Character, Radiation, Associations, Timing, Exacerbating factors, and Severity*.
   - Multilingual voice synthesis powered by **Bhashini AI** across 13 Indian languages (Hindi, Marathi, English, Gujarati, Tamil, Telugu, Bengali, Kannada, Punjabi, Malayalam, Odia, Assamese, Urdu).
   - Real-time microphone speech dictation and red-flag emergency detection.
5. **Medical Docs & OCR Intelligence**:
   - High-precision OCR document scanner for physical paper prescriptions, laboratory pathology reports, and hospital discharge summaries.
   - 1-click test document scan presets and automated entity extraction (medication names, dosages, frequencies, diagnostic metrics).
6. **Book Appointments**:
   - Real-time specialist directory, available time slots, instant token issue, and past appointment history.
7. **Profile & ABDM 2.0 Medical History**:
   - Editable demographics, ABHA address & number, diagnostic history timeline, and edge persistence.
8. **Recorded Vitals**:
   - Live kiosk sensor readings for Blood Pressure, Pulse, SpO2, Body Temperature, BMI, and Blood Group.
9. **Hospital Route Guide & Modals**:
   - Turn-by-turn indoor wayfinding route to Room 104 with step distance, physical token slip printer, and WhatsApp/SMS digital pass delivery.

---

### 2. 🟢 Doctor Portal & Clinical Consultation Workspace (`src/PhysicianDashboard.jsx`)
- **Live Intake Queue**: Continuous polling with call-next token management and patient queue priority status.
- **Automated Clinical History Packet**: Selecting a patient pulls their complete pre-consultation record:
  - Chief clinical complaint and SOCRATES AI interview summary.
  - Live 3D pain mapping telemetry (body region, quadrant, VAS score, 3D coordinates).
  - Complete 10-parameter Ayurvedic Dashavidha Pariksha findings.
  - OCR extracted paper records, deciphered medications, and lab reports.
- **Interactive Digital Prescription Pad**:
  - 1-click clinical investigation orders (ECG, Troponin-I, CBC, Blood Sugar, Ultrasound, etc.).
  - Medication prescription builder with drug dosage, frequency, duration, and instructions.
  - Clinical notes, differential diagnosis, and instant sign-off with edge state updates.

---

### 3. 🟣 Admin Command Center (`src/AdminDashboard.jsx`)
Single unified login screen automatically detects role permissions:
- **National Multi-Hospital Surveillance (`MAIN_ADMIN`)**:
  - Cross-facility comparative analytics across AIIMS New Delhi (`HOSP-001`), Safdarjung Hospital (`HOSP-002`), Pune District Civil Hospital (`HOSP-003`), and KMC Manipal (`HOSP-004`).
  - National aggregated footfall, average wait times, active kiosk fleet status, and doctor chamber occupancy.
  - AI Epidemiological Outbreak Radar for real-time disease cluster detection.
  - Inter-hospital load balancer with automated patient diversion recommendations.
- **Local Hospital Command Center (`HOSPITAL_ADMIN`)**:
  - Real-time department counters, chamber occupancy, and queue rebalancing.
  - Demographic breakdown, hourly intake curves, and login method analytics (ABHA, Aadhaar, Biometric).
  - Doctor roster shift management (On Duty / Emergency / Break).
  - Hardware fleet diagnostics (printer paper level, biometric sensor status, ping latency).
  - ABDM compliance gateway and direct MongoDB collection inspector.

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
                                   [ Dual-Persistence Sync Layer ]
                                                 │
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │    MongoDB Cloud Replica    │  <--- Cloud Aggregation
                                  │    (medikiosk_cloud_db)     │       ABDM Gateway Node
                                  └─────────────────────────────┘
```

- **Zero-Latency Offline Edge**: Local **SQLite3 Edge Database** (`backend/database/medikiosk_edge.db`) guarantees all patient intake, token generation, 3D pain mapping, and doctor consultations run with zero network lag and zero downtime.
- **Auto-Schema Migrations**: `backend/config/sqlite_config.py` verifies relational integrity and auto-adds missing columns on startup.
- **Cloud Replication**: Dual-persistence layer syncs to **MongoDB** (`medikiosk_cloud_db`) whenever cloud connectivity is active.

---

## 📁 Repository Structure

```
MEDIKIOSK/
├── src/                                # ⚛️ React 18 + Vite Frontend Source
│   ├── App.jsx                         # Tri-Portal Master Router & Role Selector
│   ├── LoginKiosk.jsx                  # Patient Check-In Kiosk Interface & Auth
│   ├── PatientDashboard.jsx            # 9-Tab Integrated Patient Portal
│   ├── DoctorLogin.jsx                 # Doctor Authentication & Registration
│   ├── PhysicianDashboard.jsx          # Doctor Clinical Console & Rx Pad
│   ├── AdminLogin.jsx                  # Single Unified Common Admin Login
│   ├── AdminDashboard.jsx              # National Surveillance & Hospital Command Center
│   ├── components/                     # 3D Mannequin, Dashavidha Modal, Biometric, OTP
│   │   ├── AnatomicalMannequin.jsx     # Three.js 3D WebGL Human Mannequin & Raycaster
│   │   └── DashavidhaModal.jsx         # Classical Ayurvedic 10-Question Diagnostic Modal
│   ├── data/                           # Mock analytics & telemetry dataset
│   └── utils/                          # Async API client (`api.js`), audio TTS, translations
├── backend/                            # ⚡ Python Enterprise Backend Core
│   ├── server.py                       # High-performance multi-threaded API server
│   ├── config/                         # SQLite (`sqlite_config.py`) & Mongo config
│   ├── database/                       # Schema (`sqlite_edge.sql`) & seeder (`seed_data.py`)
│   ├── models/                         # Pydantic schemas (`schemas.py`)
│   ├── routes/                         # Patient, Doctor, and Admin routes
│   └── services/                       # ABDM, Biometric, Email & Queue services
├── public/
│   └── models/                         # 3D GLTF Anatomical Models (Female, Male, Medical)
├── s.bat                               # 🚀 1-Click Multi-Device Edge Launcher
├── package.json                        # Node dependencies & build scripts
└── vite.config.js                      # Vite bundler configuration
```

---

## 🚀 Quick Start Guide

### 1. Instant 1-Click Launch (Recommended)
Simply execute `s.bat` in your root terminal:
```cmd
s.bat
```
*This automatically frees ports 8000 & 5173, initializes and seeds the SQLite edge database, spawns the Python backend server on port 8000, checks npm packages, starts Vite, and launches the browser on `http://localhost:5173`.*

---

### 2. Manual Startup

#### Step A: Initialize Backend Server
```powershell
python backend/server.py
```
*Backend runs on `http://127.0.0.1:8000` with SQLite Edge database seeded.*

#### Step B: Launch Frontend
```powershell
npm install
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

## 🔑 Pre-Configured Demo Credentials

| Portal | Role | Username / Identifier | Password / PIN | Scope / Description |
|---|---|---|---|---|
| **Patient Kiosk** | Patient | `14-8892-4412-9031` (ABHA) or `5481 9023 1184` (Aadhaar) | OTP: `123456` | Access complete 9-Tab Patient Kiosk (`PT-8841`) |
| **Doctor Chamber** | Physician | `dr.rajesh@aiims.edu` | `Doctor@123` | Dr. Rajesh Sharma, MD (Room 104, General Medicine) |
| **Doctor Chamber** | Physician | `dr.sneha@aiims.edu` | `Sneha@123` | Dr. Sneha Patel, MS (Room 108, Orthopedics & Trauma) |
| **Hospital Admin** | Hospital Admin | `admin@aiims.edu` | `Admin@123` | AIIMS New Delhi Local Command Center (`HOSP-001`) |
| **National Admin** | National Admin | `director@mohfw.gov.in` | `GovAdmin@2026` | National Multi-Hospital Surveillance & Outbreak Radar |

---

## 📜 Standards & Compliance
- **Ayushman Bharat Digital Mission (ABDM 2.0)**: Compliant with M1, M2, and M3 milestones for ABHA verification, token generation, and FHIR clinical record exchange.
- **Digital Personal Data Protection Act (DPDP 2023)**: Multilingual explicit consent capture, zero-knowledge biometric hashing, and strict patient-isolated query scoping.
- **Ayush Standard Treatment Guidelines**: Classical *Charaka Samhita* Dashavidha clinical parameter assessment integrated alongside modern SOCRATES triage.

---

© 2026 MediKiosk Smart Healthcare Platform • Built for Indian Public Health Infrastructure
