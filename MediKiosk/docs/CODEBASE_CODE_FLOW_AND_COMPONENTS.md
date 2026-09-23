# 💻 MediKiosk — Exhaustive Codebase & Component Analysis

This document provides a line-by-line, component-by-component architectural breakdown of every module across the entire **MediKiosk** repository, detailing its technical responsibility, state management, props, exports, and design rationale.

---

## 📂 Complete File Catalog

```
MEDIKIOSK/
├── index.html                           # Vite HTML Entry Point
├── package.json                         # Dependencies & npm Scripts
├── vite.config.js                       # Bundler Configuration
├── tailwind.config.js                   # Styling Theme, Fonts & Custom Keyframes
├── postcss.config.js                    # PostCSS Autoprefixer Configuration
├── s.bat                                # 1-Click Windows Launcher Script
├── run.txt                              # Cross-Platform Execution Guide
├── standalone_kiosk.html                # Self-Contained Zero-Setup Browser Terminal
├── mongo_gui_server.py                  # Python MongoDB BSON Studio Web Server
├── mongo_gui.html                       # Frontend GUI for MongoDB Collections
│
├── src/                                 # ⚛️ React 18 Frontend Application
│   ├── main.jsx                         # React Root Mounting
│   ├── App.jsx                          # Tri-Portal Router & State Controller
│   ├── LoginKiosk.jsx                   # Patient Check-In Kiosk Interface
│   ├── PatientDashboard.jsx             # Post-Check-In Patient Session & Token Slip
│   ├── DoctorLogin.jsx                  # Physician Authentication Chamber
│   ├── PhysicianDashboard.jsx           # Doctor Clinical OPD Console & Rx Pad
│   ├── AdminLogin.jsx                   # Admin Credentials & 1-Click Demo Chamber
│   ├── AdminDashboard.jsx               # 7-Tab Hospital Command Center & Analytics
│   ├── index.css                        # Glassmorphism, Equalizer & Kiosk CSS
│   ├── components/
│   │   ├── BiometricModal.jsx           # Animated Fingerprint Scanner Simulator
│   │   ├── OtpModal.jsx                 # 6-Digit OTP Verification Dialog
│   │   ├── NewPatientModal.jsx          # Instant Walk-in Intake & ABHA Creator
│   │   ├── DashavidhaModal.jsx          # Classical 10-Fold Ayurvedic Assessment
│   │   ├── ConsentDetailsModal.jsx      # DPDP Act Statutory Privacy Notice
│   │   └── TouchNumpad.jsx              # Large-Button Onscreen Touchpad
│   └── utils/
│       ├── api.js                       # REST Client with Offline Mock Fallbacks
│       ├── audioTTS.js                  # 3-Tier Multilingual Speech Synthesizer
│       └── translations.js              # Trilingual Dictionary (EN, HI, MR)
│
├── backend/                             # ⚡ FastAPI Enterprise Core Backend
│   ├── main.py                          # FastAPI ASGI Root & Middleware
│   ├── server.py                        # Alternative Production Server Runner
│   ├── requirements.txt                 # Python Dependencies
│   ├── config/
│   │   ├── sqlite_config.py             # SQLite3 Connection & WAL Mode
│   │   ├── mongodb_config.py            # MongoDB Cloud Replica Connector
│   │   ├── redis_config.py              # Redis Caching Layer
│   │   └── jwt_helper.py                # JWT Token Generator & Verifier
│   ├── database/
│   │   ├── medikiosk_edge.db            # Local Zero-Latency SQLite3 Database
│   │   ├── sqlite_edge.sql              # Relational Table Schemas
│   │   └── seed_data.py                 # Database Seeder (Doctors, Patients, Queues)
│   ├── routes/
│   │   ├── patient_routes.py            # Patient Verification & Token Issuance
│   │   ├── doctor_routes.py             # Doctor Queue Management & Calling
│   │   └── admin_routes.py              # Telemetry, Load Balancing & Fleet Control
│   └── services/
│       ├── abdm_service.py              # Mock ABDM 2.0 Gateway
│       ├── biometric_service.py         # STQC Fingerprint Minutiae Matcher
│       ├── email_service.py             # Asynchronous SMTP Notifications
│       ├── queue_service.py             # Departmental Load Balancer
│       └── telemetry_service.py         # Real-Time Analytics Engine
│
├── PatientCaseTaking/                   # 🧍 3D Anatomical Pain Mapping
│   ├── main.py                          # PySide6 Desktop GUI Application
│   ├── requirements.txt                 # Qt, PyOpenGL, PyGLTF Dependencies
│   ├── pain_summary.json                # Structured Pain Localization Output
│   └── mannequin/
│       ├── mannequin_view.py            # 3D OpenGL Viewport & Camera Controller
│       ├── region_detector.py           # Raycasting & 3D Anatomical Classifier
│       ├── model_loader.py              # GLB Mesh Parser & Normal Normalizer
│       ├── diagram_widget.py            # 2D Anatomical Schematic Widget
│       └── models/                      # 3D Binary Meshes (.glb)
│
└── tests/                               # 🧪 Playwright End-to-End Test Suite
    ├── test_kiosk_and_admin.py          # Playwright Test Runner for Google Chrome
    └── screenshots/                     # 10 Visual Regression Test Captures
```

---

## ⚛️ 1. Frontend Core Modules (`src/`)

### `src/App.jsx`
- **Role**: Root container managing the **Tri-Portal Router**.
- **State**:
  - `portalMode`: `'landing'` | `'patient'` | `'doctor'` | `'admin'`.
  - `authenticatedDoctor`: Stores active physician profile upon verification.
  - `authenticatedAdmin`: Stores active administrator session upon verification.
- **Key Functions**:
  - `handleReturnToMenu()`: Safely restores the portal mode to `'landing'`.
  - `RoleSelectionLanding`: Displays trilingual role buttons (*मरीज़ यहाँ दबाएं*, *डॉक्टर यहाँ दबाएं*, *एडमिन यहाँ दबाएं*).

### `src/LoginKiosk.jsx`
- **Role**: Primary patient touchscreen interface.
- **State**:
  - `language`: `'english'` | `'hindi'` | `'marathi'`.
  - `authMethod`: `'abha'` | `'aadhaar'`.
  - `inputValue`: Formatted 14-digit ABHA or 12-digit Aadhaar number.
  - `dpdpConsent`: Boolean consent state with validation guards.
  - `activeSession`: Authenticated patient object; triggers `<PatientDashboard />`.
  - `modalState`: Controls visibility of OTP, Biometric, New Patient, and Consent modals.
- **Audio Feedback**: Invokes `playChime()` on key presses and `speakInstruction()` on step changes.

### `src/PatientDashboard.jsx`
- **Role**: Post-check-in digital OPD token slip and patient information display.
- **Displays**:
  - Token Number badge (e.g. `OPD-A-042`).
  - Assigned Doctor, Department, and Room Number.
  - Live Queue Status (e.g. "2 Patients Ahead of You").
  - Patient Vitals card (Blood Pressure, SpO2, Pulse, Temperature).
  - 3D Pain mapping indicator & Dashavidha assessment trigger.
  - 1-click Print Receipt and Session Reset buttons.

### `src/DoctorLogin.jsx` & `src/PhysicianDashboard.jsx`
- **Role**: Dedicated outpatient consultation suite for doctors.
- **DoctorLogin**: Allows secure sign-in or 1-click demo selection of registered specialists (e.g., Dr. Rajeshwar Sharma, Senior Consultant Physician).
- **PhysicianDashboard**:
  - **Live OPD Queue**: Displays waiting patient cards with wait times.
  - **Call Next Patient**: Audio chime announces next token.
  - **Clinical Inspector**: Reviews patient vitals, 3D pain spots, and past prescriptions.
  - **Electronic Rx Pad**: Input fields for diagnosis, advice, and medications.
  - **Consultation Lifecycle**: Transitions patient status from `WAITING` → `CALLED` → `SEEN`.

### `src/AdminLogin.jsx` & `src/AdminDashboard.jsx`
- **Role**: Enterprise governance and operations console.
- **AdminLogin**: 1-click role selection (Chief Medical Officer, IT Systems Administrator, Nursing Supervisor).
- **AdminDashboard**: Consolidates 7 operational tabs:
  1. `queues`: Departmental patient loads, chamber capacity bars, emergency alerts, and 1-click queue rebalancing.
  2. `logins`: User & Login Analytics featuring 6 KPI cards, channel breakdown, today's hourly intake curve, and live check-in feed.
  3. `customers`: Customer Analytics featuring 10 KPIs, retention/acquisition rates, 7 regional catchment zones, and top customers directory with live search.
  4. `roster`: Doctor duty status, shift hours, patient tallies, and emergency bay assignments.
  5. `fleet`: Terminal hardware health, thermal receipt paper roll status, and remote network ping.
  6. `abdm`: DPDP consent audit logs, AES-256 encryption status, and data retention policies.
  7. `mongo`: Direct MongoDB Studio viewer querying BSON collections.

### `src/components/DashavidhaModal.jsx`
- **Role**: 10-fold classical Ayurvedic clinical evaluation.
- **Features**: Trilingual questionnaire evaluating Prakriti, Vikriti, Sara, Samhanana, Pramana, Satmya, Satva, Ahara-Shakti, Vyayama-Shakti, and Vaya.
- **Output**: Calculates weighted dosha scores and generates holistic herbal and lifestyle advice synced to the patient encounter.

### `src/utils/api.js`
- **Role**: Universal API bridge.
- **Architecture**: Asynchronously fetches endpoints from `http://127.0.0.1:8000/api/v1` with automatic failover to local memory mock data (`KNOWN_PATIENTS`) when running offline or standalone.

---

## ⚡ 2. Backend Modules (`backend/`)

### `backend/main.py`
- **Role**: FastAPI ASGI entry point.
- **Configuration**: Sets up permissive CORS middleware, mounts sub-routers (`/api/v1/patient`, `/api/v1/doctor`, `/api/v1/admin`), triggers database seeding on startup, and exposes OpenAPI Swagger at `/docs`.

### `backend/routes/patient_routes.py`
- **Endpoints**:
  - `POST /verify-identifier`: Validates ABHA or Aadhaar formats against database records.
  - `POST /send-otp`: Dispatches 6-digit OTP via email/SMS.
  - `POST /verify-otp`: Confirms OTP code and returns authentication token.
  - `POST /biometric-auth`: Performs minutiae template matching.
  - `POST /register`: Onboards walk-in patients and generates new ABHA IDs.
  - `POST /issue-ticket`: Allocates next available OPD token and updates doctor queues.
  - `POST /pain-mapping/save`: Stores 3D coordinates and VAS scores in patient record.

### `backend/routes/doctor_routes.py`
- **Endpoints**:
  - `POST /login`: Authenticates doctor credentials.
  - `GET /queue/{doctorId}`: Returns active waiting list for a specific chamber.
  - `POST /call-next`: Calls the next waiting patient and sets status to `CALLED`.
  - `POST /mark-seen`: Concludes consultation and saves prescription.

### `backend/routes/admin_routes.py`
- **Endpoints**:
  - `GET /telemetry`: Aggregates real-time KPIs across all hospital kiosks.
  - `POST /rebalance-queues`: Automatically redistributes patient load across chambers.
  - `POST /kiosk/test-print`: Sends diagnostic test print job to kiosk hardware.

### `backend/database/sqlite_edge.sql` & `backend/config/sqlite_config.py`
- **Schema**: Defines SQLite3 relational tables (`patients`, `queue_tickets`, `doctors`, `telemetry_logs`).
- **Resilience**: Configured with Write-Ahead Logging (`PRAGMA journal_mode=WAL`) and `PRAGMA synchronous=NORMAL` for maximum write speed on solid-state kiosk drives.

---

## 🧍 3. 3D Pain Mapping Subsystem (`PatientCaseTaking/`)

### `PatientCaseTaking/main.py`
- **Role**: Desktop GUI application entry point launching the PySide6 Qt window.
- **Arguments**: `python main.py [gender] [patient_id] [api_base_url]`.
- **Signal**: Connects `mannequin.pain_confirmed` to `on_pain_data_received()`.

### `PatientCaseTaking/mannequin/region_detector.py`
- **Role**: Raycasting and anatomical classifier.
- **Logic**: Projects screen touch coordinates onto the 3D surface model and classifies the afflicted body part (Head, Thorax, Abdomen, Lumbar Spine, Knees, Feet) along with laterality (Left/Right/Medial).

---

## 🧪 4. Automated Testing Suite (`tests/`)

### `tests/test_kiosk_and_admin.py`
- **Engine**: Playwright Python with Google Chrome (`C:\Program Files\Google\Chrome\Application\chrome.exe`).
- **Test Matrix**:
  - Test 1: Tri-Portal Landing page mount & role button detection.
  - Test 2: Patient Kiosk check-in, OTP verification, and OPD token generation (`OPD-A-042`).
  - Test 3: Hospital Admin security login & dashboard mount.
  - Test 4: User & Login Analytics metrics verification (24,892 logins, peak hourly curves).
  - Test 5: Customer Analytics metrics verification (18,450 customers, 7 catchment zones, search filter).
  - Test 6: MongoDB Cloud History Studio inspection and return navigation to Main Menu.
- **Artifacts**: Captures 10 visual regression screenshots in `tests/screenshots/`.
