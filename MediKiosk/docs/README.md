# 📚 MediKiosk Comprehensive Documentation Hub

Welcome to the complete technical, clinical, and operational documentation suite for **MediKiosk — Smart Healthcare, ABDM Check-In, Clinical Triage & Hospital Intelligence Platform**, engineered for the **Smart India Hackathon (SIH 2026)**.

MediKiosk is an enterprise-grade, tri-portal healthcare check-in and clinical workflow terminal built for Indian district hospitals, Community Health Centers (CHCs), and Primary Health Centers (PHCs). It bridges patients, consulting physicians, and hospital administration with the **Ayushman Bharat Digital Mission (ABDM 2.0)** ecosystem in strict compliance with the **Digital Personal Data Protection (DPDP) Act 2023**.

---

## 📑 Master Documentation Index

| # | Document | Scope & Focus Areas |
| :-: | :--- | :--- |
| **1** | **[Project Overview & WH-Analysis](./PROJECT_OVERVIEW_AND_WH_ANALYSIS.md)** | Comprehensive 5W1H breakdown (What, Why, Who, Where, When, How), Indian public healthcare challenges, long OPD queues, patient personas, and value propositions. |
| **2** | **[System Architecture & Tech Stack](./SYSTEM_ARCHITECTURE_AND_TECH_STACK.md)** | Decoupled client-server architecture, Tri-Portal state machine, React 18, Tailwind CSS, 3-tier TTS voice engine, Web Audio synthesis, and edge offline fallbacks. |
| **3** | **[Codebase Analysis & Code Flow](./CODEBASE_CODE_FLOW_AND_COMPONENTS.md)** | Exhaustive file-by-file audit of every single file across frontend (`src/`), backend (`backend/`), and 3D modules (`PatientCaseTaking/`), covering props, hooks, and data models. |
| **4** | **[FastAPI Backend & Dual Database Sync](./FASTAPI_BACKEND_AND_DUAL_DB_SYNC.md)** | Asynchronous Python REST backend, SQLite3 local edge engine (`medikiosk_edge.db`), MongoDB Cloud replica set, microservices (Email SMTP, Biometrics, Queue balancing), and Swagger API. |
| **5** | **[Patient Case Taking & 3D Pain Mapping](./PATIENT_CASE_TAKING_AND_3D_PAIN_MAPPING.md)** | PySide6/OpenGL 3D anatomical mannequin, surface-snapped pain markers, VAS 1-10 pain score, and 10-fold classical Ayurvedic *Dashavidha Pariksha* clinical evaluation. |
| **6** | **[Hospital Admin Analytics & Governance](./ADMIN_ANALYTICS_AND_GOVERNANCE_GUIDE.md)** | 7-tab Hospital Command Center, User & Login Analytics (logins, unique users, hourly curves), Customer Analytics (retention, acquisition, 7 regional catchments, top patients), and Mongo Studio. |
| **7** | **[ABDM 2.0 & DPDP Act 2023 Compliance](./ABDM_AND_DPDP_COMPLIANCE_GUIDE.md)** | National health digital infrastructure compliance, 14-digit ABHA creation, UIDAI biometric authentication standards, itemized consent architecture, and AES-256 data protection. |
| **8** | **[Deployment & Hardware Integration Guide](./DEPLOYMENT_AND_HARDWARE_INTEGRATION_GUIDE.md)** | Touchscreen terminal specifications, zero-setup standalone runner (`standalone_kiosk.html`), dual-screen setup, thermal receipt printers, and 3-minute hackathon demo script. |

---

## 🏛️ Tri-Portal Role Architecture

MediKiosk provides three isolated, role-based portals configured for clinical environments:

```
                                  ┌────────────────────────┐
                                  │  RoleSelectionLanding  │
                                  │   (Tri-Portal Entry)   │
                                  └───────────┬────────────┘
                                              │
         ┌────────────────────────────────────┼────────────────────────────────────┐
         ▼                                    ▼                                    ▼
┌──────────────────┐                 ┌──────────────────┐                 ┌──────────────────┐
│  Patient Portal  │                 │  Doctor Chamber  │                 │  Admin Console   │
│  (LoginKiosk)    │                 │ (PhysicianDash)  │                 │ (AdminDashboard) │
└────────┬─────────┘                 └────────┬─────────┘                 └────────┬─────────┘
         │                                    │                                    │
         ├── Trilingual Voice Guidance        ├── Live OPD Queue Calling           ├── 1. Live OPD Queues & Load
         ├── 14-digit ABHA Login              ├── Patient Vitals Inspection        ├── 2. User & Login Analytics
         ├── Aadhaar OTP Authentication       ├── 3D Pain Summary Preview          ├── 3. Customer Analytics
         ├── Fingerprint Scan Simulation      ├── Dashavidha Ayurvedic Profile     ├── 4. Doctor Roster & Chambers
         ├── New Patient ABHA Generator       ├── Clinical Rx Prescription Pad     ├── 5. Kiosk Fleet Hardware
         ├── 3D Anatomical Pain Mapping       └── Consultation Mark-Seen Sync      ├── 6. ABDM & DPDP Compliance
         ├── Dashavidha Ayurvedic Modal                                            └── 7. MongoDB Cloud Studio
         └── Digital OPD Token Slip (OPD-A-042)
```

---

## 📁 Complete Repository Layout

```
MEDIKIOSK/
├── standalone_kiosk.html               # ⚡ Zero-setup standalone HTML (Runs offline in any browser)
├── s.bat                               # 🚀 1-Click Windows launcher script
├── run.txt                             # Quick start instructions for all operating systems
├── package.json                        # Frontend npm dependencies (React 18, Vite 6, Tailwind 3.4)
├── vite.config.js                      # Vite bundler configuration
├── tailwind.config.js                  # Tailwind utility rules & custom keyframe animations
├── postcss.config.js                   # PostCSS plugins configuration
├── index.html                          # Entry HTML with typography links (Plus Jakarta Sans & Outfit)
├── README.md                           # Project root documentation with Playwright badges
│
├── docs/                               # 📖 Comprehensive Technical & Clinical Documentation Suite
│   ├── README.md                       # Master documentation index (This file)
│   ├── PROJECT_OVERVIEW_AND_WH_ANALYSIS.md
│   ├── SYSTEM_ARCHITECTURE_AND_TECH_STACK.md
│   ├── CODEBASE_CODE_FLOW_AND_COMPONENTS.md
│   ├── FASTAPI_BACKEND_AND_DUAL_DB_SYNC.md
│   ├── PATIENT_CASE_TAKING_AND_3D_PAIN_MAPPING.md
│   ├── ADMIN_ANALYTICS_AND_GOVERNANCE_GUIDE.md
│   ├── ABDM_AND_DPDP_COMPLIANCE_GUIDE.md
│   └── DEPLOYMENT_AND_HARDWARE_INTEGRATION_GUIDE.md
│
├── src/                                # ⚛️ React 18 Modular Frontend Source
│   ├── main.jsx                        # React DOM mounting root
│   ├── App.jsx                         # Application router & Tri-Portal container
│   ├── LoginKiosk.jsx                  # Patient Kiosk master interface
│   ├── PatientDashboard.jsx            # Post-check-in session view & token slip
│   ├── DoctorLogin.jsx                 # Security login chamber for medical officers
│   ├── PhysicianDashboard.jsx          # Doctor OPD console with live queue calling & Rx
│   ├── AdminLogin.jsx                  # 1-Click demo and credential login for hospital admins
│   ├── AdminDashboard.jsx              # 7-Tab Hospital Command Center & Analytics
│   ├── index.css                       # Global styles, glassmorphism, equalizer & touch scrollbars
│   ├── components/
│   │   ├── BiometricModal.jsx          # Fingerprint scan simulation with laser animation
│   │   ├── OtpModal.jsx                # 6-digit OTP verification dialog with auto-focus
│   │   ├── NewPatientModal.jsx         # Walk-in patient intake & instant ABHA generator
│   │   ├── DashavidhaModal.jsx         # 10-fold classical Ayurvedic clinical evaluation
│   │   ├── ConsentDetailsModal.jsx     # DPDP Act statutory disclosure modal
│   │   └── TouchNumpad.jsx             # On-screen numeric keypad for touchscreen kiosks
│   └── utils/
│       ├── api.js                      # Backend API client with offline fallback
│       ├── audioTTS.js                 # 3-tier multilingual speech synthesis & Web Audio SFX
│       └── translations.js             # Trilingual dictionary (English, Hindi, Marathi)
│
├── backend/                            # ⚡ Python FastAPI Enterprise Core Backend
│   ├── main.py                         # FastAPI application entry point & CORS configuration
│   ├── server.py                       # Alternative server startup script
│   ├── requirements.txt                # Python backend dependencies
│   ├── config/
│   │   ├── sqlite_config.py            # Local SQLite3 edge database connection
│   │   ├── mongodb_config.py           # MongoDB Cloud replica connection
│   │   ├── redis_config.py             # Redis queue caching configuration
│   │   └── jwt_helper.py               # Token generation & doctor authentication
│   ├── database/
│   │   ├── medikiosk_edge.db           # Zero-latency local SQLite3 database file
│   │   ├── sqlite_edge.sql             # Relational schema DDL for offline kiosks
│   │   └── seed_data.py                # Database seeder with sample patients and doctors
│   ├── routes/
│   │   ├── patient_routes.py           # Verification, OTP, biometrics & ticket issuance
│   │   ├── doctor_routes.py            # Consultation queues, calling & status updates
│   │   └── admin_routes.py             # System telemetry & queue rebalancing
│   └── services/
│       ├── abdm_service.py             # Mock ABDM gateway & ABHA verification
│       ├── biometric_service.py        # STQC minutiae matching emulator
│       ├── email_service.py            # Asynchronous SMTP token notification service
│       ├── queue_service.py            # Departmental load balancing & token sequencer
│       └── telemetry_service.py        # Aggregate KPIs & hourly intake analytics
│
├── PatientCaseTaking/                  # 🧍 3D Anatomical Pain Mapping Subsystem
│   ├── main.py                         # PySide6 Qt GUI application entry point
│   ├── requirements.txt                # PySide6, PyOpenGL, PyGLTFLib dependencies
│   ├── pain_summary.json               # Serialized pain coordinates and region output
│   └── mannequin/
│       ├── mannequin_view.py           # 3D OpenGL viewport & orientation controls
│       ├── region_detector.py          # 3D raycasting and anatomical plane classifier
│       ├── model_loader.py             # GLB/GLTF 3D mesh loader & vertex normal parser
│       └── models/                     # 3D Anatomical meshes (.glb)
│
├── tests/                              # 🧪 Playwright Automated Test Suite
│   ├── test_kiosk_and_admin.py         # End-to-end verification suite on Google Chrome
│   └── screenshots/                    # Automated visual regression test captures
│
├── mongo_gui_server.py                 # Lightweight Python MongoDB management server
└── mongo_gui.html                      # In-browser MongoDB BSON collection manager
```

---

## 🚀 Execution Commands

| Component | Command | Port / URL |
| :--- | :--- | :--- |
| **Standalone Kiosk (Zero Setup)** | Double-click `standalone_kiosk.html` or run `s.bat` | `file:///.../standalone_kiosk.html` |
| **Vite Dev Server (Frontend)** | `npm run dev` | `http://localhost:5173` |
| **FastAPI Backend (REST API)** | `cd backend && uvicorn main:app --reload` | `http://localhost:8000/docs` |
| **3D Pain Mapping Mannequin** | `cd PatientCaseTaking && python main.py` | PySide6 Desktop GUI |
| **MongoDB Studio GUI Server** | `python mongo_gui_server.py` | `http://localhost:5000` |
| **Playwright Automated Chrome Tests** | `python tests/test_kiosk_and_admin.py` | Headless Chrome Execution |
