# 🏥 MediKiosk — Multilingual Dual-Pathway Conversational AI Clinical History System

> **Production-Quality Clinical Case-Taking & Triage Assistant** designed for hospital outpatient kiosks to collect structured patient history across **Allopathy (Modern Medicine)** and **AYUSH (Ayurveda)** and generate practitioner-ready summaries.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.115-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Gemini](https://img.shields.io/badge/AI-Gemini%20API-4285F4.svg?logo=google&logoColor=white)](https://ai.google.dev)
[![Bhashini](https://img.shields.io/badge/Voice-Bhashini%20%2B%20Web%20Speech-FF9933.svg)](https://bhashini.gov.in)
[![Tests](https://img.shields.io/badge/Tests-19%2F19%20Passing-brightgreen.svg)]()

---

## 📌 1. Overview & Dual Clinical Pathways

MediKiosk operates as an empathetic **clinical history-taking assistant** (similar to a hospital triage nurse or intake desk), **NOT** as an autonomous diagnostic system.

Patients choose their medical approach on the **first screen** before the clinical interview begins:

### 🩺 Pathway 1: Allopathy / Modern Medicine
* Systematically explores chief complaints using the **SOCRATES** framework:
  * **S**ite, **O**nset, **C**haracter, **R**adiation, **A**ssociated symptoms, **T**iming, **E**xacerbating/relieving factors, and **S**everity (0–10).
* Immediate emergency **Red-Flag triage detection** (acute coronary syndrome, stroke FAST, anaphylaxis, severe sepsis).
* Structured **General Physician / Emergency Handover Summary** exportable to Print, PDF, or JSON.

### 🌿 Pathway 2: AYUSH / Ayurveda
* Incorporates the classical **Dashavidha Pariksha (दशविध परीक्षा)** 10-fold clinical examination framework:
  1. **Prakriti (प्रकृति)**: Natural body constitution and thermal sensitivity tendencies (Vata, Pitta, Kapha).
  2. **Vikriti (विकृति)**: Recent dosha imbalances, digestion variations, and sleep disruptions.
  3. **Sara (सार)**: Tissue vitality and constitutional strength (Uttama, Madhyama, Avara).
  4. **Samhanana (संहनन)**: Structural compactness and skeletal frame.
  5. **Pramana (प्रमाण)**: Anthropometric proportions and body build.
  6. **Satmya (सात्म्य)**: Dietary habituation and food intolerances/triggers.
  7. **Sattva (सत्त्व)**: Mental resilience and emotional temperament under stress.
  8. **Ahara Shakti (आहार शक्ति)**: Appetite capacity (Abhyavaharana) and digestive power (Jarana).
  9. **Vyayama Shakti (व्यायाम शक्ति)**: Physical exertion tolerance and endurance (Karmashakti).
  10. **Vaya (वय)**: Chronological life stage (Bala, Madhyama, Vriddha).
* Strict non-diagnostic compliance: clearly watermarked as *"AI-assisted patient-reported observations requiring Vaidya clinical examination"*.
* Standardized **Ayurvedic Vaidya Handover Summary**.

---

## 🏛️ 2. System Architecture

```
                               ┌─────────────────────────────────────────┐
                               │       MediKiosk Web Interface           │
                               │  (React 19 + Vite + Tailwind CSS)       │
                               │  - First Screen: Allopathy vs AYUSH     │
                               │  - Left: Pathway Badge & Progress Step  │
                               │  - Center: Empathetic AI Chat & Voice   │
                               │  - Right: Real-time Dashavidha / EHR    │
                               └────────────────────┬────────────────────┘
                                                    │ REST API
                                                    ▼
                               ┌─────────────────────────────────────────┐
                               │         FastAPI Backend Engine          │
                               ├────────────────────┬────────────────────┤
                               │  SOCRATES Engine   │  Ayurveda Engine   │
                               │ (Allopathy State   │ (Dashavidha 10-Pt  │
                               │  Machine & Memory) │  State Machine)    │
                               ├────────────────────┼────────────────────┤
                               │ Red-Flag Detector  │ Multilingual Layer │
                               │ (Emergency Triage  │ (EN, HI, MR, GU,   │
                               │  & Safety Alerts)  │  TA, BN Normalizer)│
                               ├────────────────────┼────────────────────┤
                               │ Summary Generator  │ Bhashini Service   │
                               │ (Doctor & Vaidya   │ (Indian Language   │
                               │  EHR Handover)     │  ASR & TTS Bridge) │
                               ├────────────────────┼────────────────────┤
                               │ Gemini Service     │ Session Store      │
                               │ (LLM Slot Extractor│ (In-Memory Kiosk   │
                               │  & Hybrid Driver)  │  State Repository) │
                               └─────────────────────────────────────────┘
```

---

## 📂 3. Repository Structure

```
AI/
├── backend/                        # FastAPI Python Backend
│   ├── app/
│   │   ├── core/
│   │   │   └── config.py           # Application settings & environment configuration
│   │   ├── models/
│   │   │   └── schemas.py          # Pydantic data schemas (ClinicalData, Dashavidha, etc.)
│   │   ├── engine/
│   │   │   ├── socrates_engine.py  # Allopathy SOCRATES state machine & pathway router
│   │   │   ├── ayurveda_engine.py  # Dedicated Ayurvedic Dashavidha Pariksha engine
│   │   │   ├── red_flag_detector.py# Safety layer for red-flag symptom emergency detection
│   │   │   ├── multilingual.py     # Multi-language dialogues (EN, HI, MR, GU, TA, BN)
│   │   │   ├── bhashini_service.py # Bhashini Indian language ASR & TTS integration
│   │   │   ├── gemini_service.py   # Optional Gemini LLM reasoning & semantic slot extractor
│   │   │   ├── summary_generator.py# Structured Doctor / Vaidya summary generator
│   │   │   └── ocr_connector.py    # Prescription & lab document OCR injector
│   │   ├── storage/
│   │   │   └── session_store.py    # Session storage repository
│   │   ├── tests/
│   │   │   ├── test_ayurveda.py    # AYUSH Dashavidha Pariksha unit & E2E tests
│   │   │   ├── test_socrates.py    # SOCRATES state machine unit tests
│   │   │   ├── test_bhashini.py    # Bhashini ASR/TTS unit & fallback tests
│   │   │   ├── test_red_flags.py   # Safety red flag detection tests
│   │   │   ├── test_api.py         # API integration tests
│   │   │   └── test_e2e_simulation.py # E2E patient journeys & multilingual tests
│   │   └── main.py                 # FastAPI application routes & CORS
│   ├── .env                        # Active Environment configuration
│   ├── .env.example                # Documented configuration template
│   └── requirements.txt            # Python dependencies
│
├── frontend/                       # React 19 + TypeScript + Vite Frontend
│   ├── public/
│   │   ├── favicon.svg             # Kiosk favicon
│   │   └── icons.svg               # SVG asset icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── MedicalSystemSelector.tsx # Step 1: Allopathy vs AYUSH selection
│   │   │   ├── LeftPanel.tsx       # Branding, pathway badge, language, dynamic progress
│   │   │   ├── ChatArea.tsx        # Conversation stream, quick-replies, pain scale, voice
│   │   │   ├── RightPanel.tsx      # Real-time EHR & Dashavidha 10-point progress tracker
│   │   │   ├── DoctorSummaryView.tsx # Dual-pathway handover report (Print, PDF, JSON)
│   │   │   ├── EmergencyModal.tsx  # Red-flag safety escalation popup
│   │   │   ├── SummaryConfirmationModal.tsx # Patient review & inline field editor
│   │   │   └── DemoScenariosBar.tsx # 1-click test scenarios (Amlapitta, Sandhivata, Cardiac)
│   │   ├── services/
│   │   │   ├── api.ts              # Backend API client
│   │   │   └── speech.ts           # Web Speech API voice synthesis & recognition
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript interfaces
│   │   ├── App.tsx                 # Main layout & dual-pathway state coordinator
│   │   ├── index.css               # Tailwind CSS & custom clinical animations
│   │   └── main.tsx                # React root bootstrap
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── README.md                       # Master Documentation
```

---

## ⚡ 4. Step-by-Step Execution Guide

### Prerequisites
* **Python**: 3.10, 3.11, or 3.12 installed
* **Node.js**: v18.0.0 or higher (v20+ recommended)
* **Browser**: Google Chrome or Microsoft Edge (recommended for best Web Speech API & voice support)

---

### Step 1: Backend Setup & Launch

1. Open your terminal / PowerShell and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   * **On Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   * **On Linux / macOS:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure your environment file:
   * The `backend/.env` file is pre-configured and ready to use.
   * *(Optional)* If you have API keys for Google Gemini or Bhashini, open `backend/.env` and paste them in (see [Environment Configuration](#-5-environment-configuration-explained)).

5. Start the FastAPI backend server:
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   * The backend will start on: **`http://127.0.0.1:8000`**
   * Interactive Swagger API documentation: **`http://127.0.0.1:8000/docs`**

---

### Step 2: Frontend Setup & Launch

1. Open a **new** terminal window and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   **`http://localhost:5173`**

---

## ⚙️ 5. Environment Configuration Explained

The configuration is managed in [`backend/.env`](file:///d:/Users/Kanha/OneDrive/Desktop/AI/backend/.env) (and templated in [`backend/.env.example`](file:///d:/Users/Kanha/OneDrive/Desktop/AI/backend/.env.example)).

> 💡 **Note**: All keys in `.env` are completely **OPTIONAL**. The system works 100% out of the box using built-in deterministic clinical engines and browser Web Speech APIs.

```env
# ==============================================================================
# MediKiosk Conversational AI Configuration
# ==============================================================================

# 1. Server & Project Metadata
PROJECT_NAME="MediKiosk Conversational AI"
VERSION="1.0.0"

# 2. Google Gemini API (Optional)
# Obtain a free API key at: https://aistudio.google.com/
# - If provided: Enables deep LLM semantic slot extraction and nuanced query reasoning.
# - If omitted: Kiosk runs on high-precision deterministic SOCRATES / Dashavidha engines.
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-2.5-flash"

# 3. Bhashini Indian Languages ASR / TTS (Optional)
# Obtain credentials from: https://bhashini.gov.in/ulca
# - BHASHINI_USER_ID          : Your Bhashini / ULCA Account / Udyat User ID ('userID')
# - BHASHINI_API_KEY          : Your ULCA API Key ('ulcaApiKey')
# - BHASHINI_INFERENCE_API_KEY: (Optional) Separate Bearer / Inference Authorization Key
# - BHASHINI_SERVICE_ID       : (Optional) Interface or model Service ID for ASR / TTS
# - BHASHINI_PIPELINE_ID      : (Optional) Custom Pipeline ID if assigned
# - BHASHINI_INFERENCE_URL    : Inference endpoint (default: https://dhruva-api.bhashini.gov.in/services/inference/pipeline)
BHASHINI_USER_ID=""
BHASHINI_API_KEY=""
BHASHINI_INFERENCE_API_KEY=""
BHASHINI_SERVICE_ID=""
BHASHINI_PIPELINE_ID=""
BHASHINI_INFERENCE_URL="https://dhruva-api.bhashini.gov.in/services/inference/pipeline"

# 4. Hospital Triage Emergency Webhook (Optional)
# Webhook URL called when red-flag critical symptoms are detected.
# Example: https://hospital.local/api/triage/emergency-alert
EMERGENCY_ALERT_WEBHOOK=""

# 5. Localization Defaults
# Default language before patient selection: english, hindi, marathi, gujarati, tamil, bengali
DEFAULT_LANGUAGE="english"
```

---

## 🗣️ 6. Speech-to-Text & Multilingual Voice Features

MediKiosk provides dual-tier voice support tailored for pan-Indian languages:

1. **Bhashini Cloud Voice Bridge (`/api/tts` & `/api/chat`):**
   * Voice synthesis is processed via the Government of India's **Bhashini Dhruva AI pipeline** when credentials are configured in `backend/.env`.
   * Directly generates high-fidelity Indic native-accent audio (base64 WAV/MP3) and plays it smoothly via the kiosk's HTML5 Audio Player.
   * If credentials are blank or the network is unavailable, the system automatically falls back to browser-level speech.

2. **Browser Native Web Speech API:**
   * Uses `SpeechRecognition` for microphone input and `SpeechSynthesis` for voice output.
   * Pre-loads native high-definition Indian language voices (e.g. `Microsoft Swara Online (Natural) - Hindi`, `Google हिन्दी`, `Microsoft Aarohi Online - Marathi`, `Microsoft Valluvar Online - Tamil`, `Microsoft Mohan Online - Telugu`, etc.).
   * Supports **Hands-Free Auto-Listen Mode**: Automatically speaks the AI question and turns on the microphone for the patient's reply.
   * Per-turn transcript clearing prevents answer bleeding across interview turns.

3. **Supported Languages (13 Pan-Indian Languages):**
   * 🇬🇧 **English** (`en-IN`, `en-US`)
   * 🇮🇳 **Hindi / हिन्दी** (`hi-IN`)
   * 🇮🇳 **Marathi / मराठी** (`mr-IN`)
   * 🇮🇳 **Gujarati / ગુજરાતી** (`gu-IN`)
   * 🇮🇳 **Tamil / தமிழ்** (`ta-IN`)
   * 🇮🇳 **Telugu / తెలుగు** (`te-IN`)
   * 🇮🇳 **Kannada / ಕನ್ನಡ** (`kn-IN`)
   * 🇮🇳 **Malayalam / മലയാളം** (`ml-IN`)
   * 🇮🇳 **Bengali / বাংলা** (`bn-IN`)
   * 🇮🇳 **Punjabi / ਪੰਜਾਬੀ** (`pa-IN`)
   * 🇮🇳 **Odia / ଓଡ଼ିଆ** (`or-IN`)
   * 🇮🇳 **Assamese / অসমীয়া** (`as-IN`)
   * 🇮🇳 **Urdu / اردو** (`ur-IN`)

---

## 🧪 7. Automated Testing & Quality Assurance

Run the complete test suite across all clinical engines and API endpoints:

```bash
cd backend
python -m pytest app/tests/ -v
```

### Test Suite Breakdown (19 Passed):
* `test_ayurveda.py`: Complete AYUSH Amlapitta & Sandhivata clinical journeys, 10-point Dashavidha Pariksha extraction, Vaidya summary generation.
* `test_socrates.py`: Allopathy SOCRATES state progression, pain severity scale (0–10) parsing, duplicate question prevention.
* `test_red_flags.py`: Detection of acute coronary syndrome, FAST stroke symptoms, anaphylaxis, and thunderclap headache.
* `test_bhashini.py`: Bhashini ASR/TTS service connectors, 13-language ISO mappings, `/api/tts` endpoint, header building, and graceful fallback.
* `test_api.py`: FastAPI endpoints (`/health`, `/api/chat`, `/api/session/{id}`, `/api/emergency/trigger`, `/api/ocr/inject`).
* `test_e2e_simulation.py`: End-to-end simulated patient journeys in English, Hindi (हिन्दी), and Marathi (मराठी).

To check frontend TypeScript correctness and production build:
```bash
cd frontend
npx tsc --noEmit
npm run build
```

---

## 🛡️ 8. Safety & Non-Diagnostic Clinical Directives

> ⚠️ **Mandatory Clinical Safety Notice**: MediKiosk does not deliver autonomous diagnoses, prescribe medications, or replace certified doctors or Vaidyas.

* **Non-Diagnostic Watermark**: All clinical summaries are explicitly labelled as *"AI-assisted patient-reported observations requiring attending practitioner review and physical examination"*.
* **Emergency Override**: Detection of red-flag symptoms immediately triggers an emergency modal instructing the patient to seek urgent medical care and dispatches a webhook notification to the hospital triage desk.
* **Patient Verification**: Before generating the final handover report, the patient is presented with an editable confirmation modal to review and correct all captured data.
