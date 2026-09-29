# 📜 MediKiosk — ABDM 2.0 & DPDP Act 2023 Regulatory Compliance Guide

---

## 🏛️ 1. Ayushman Bharat Digital Mission (ABDM 2.0) Integration

The **Ayushman Bharat Digital Mission (ABDM)**, established by the National Health Authority (NHA) under the Ministry of Health and Family Welfare (MoHFW), aims to build the digital backbone for India's integrated healthcare ecosystem. MediKiosk is engineered to comply with the ABDM 2.0 milestone standards.

```
       ┌────────────────────────────────────────────────────────┐
       │             ABDM NATIONAL HEALTH ECOSYSTEM             │
       └──────────────────────────────────┬─────────────────────┘
                                          │
        ┌─────────────────────────────────┼─────────────────────────────────┐
        ▼                                 ▼                                 ▼
┌───────────────┐                 ┌───────────────┐                 ┌───────────────┐
│  ABHA Number  │                 │  ABHA Address │                 │  HIP / HIU    │
│  (14-digit)   │                 │  (@abdm PHR)  │                 │  Gateway      │
└───────┬───────┘                 └───────┬───────┘                 └───────┬───────┘
        │                                 │                                 │
        └────────────────────────┬────────┴─────────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │    MEDIKIOSK CLIENT    │
                    │  Self-Service Check-In │
                    └────────────────────────┘
```

### A. ABHA Identification Standards
1. **14-Digit ABHA Number**:
   - Structure: `XX-XXXX-XXXX-XXXX` (e.g., `14-8892-4412-9031`).
   - MediKiosk enforces auto-hyphenated formatting with real-time numeric validation, preventing digit transposition errors during kiosk touch entry.
2. **ABHA Address (PHR Handle)**:
   - Structure: `<username>@abdm` (e.g., `ramesh.sharma@abdm` or `sanjay.shinde@abdm`).
   - Linked to the citizen's Personal Health Record (PHR) app, allowing patients to view diagnostic reports and prescriptions digitally.
3. **Instant ABHA Generation for First-Time Patients**:
   - First-time hospital visitors without an ABHA card can generate an instant 14-digit identifier through the `NewPatientModal` via Aadhaar e-KYC or demographic registration within 2 minutes.

---

## 🔒 2. Digital Personal Data Protection (DPDP) Act 2023 Compliance

The **Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023)** mandates strict legal responsibilities for "Data Fiduciaries" (hospitals) when collecting personal digital data. MediKiosk enforces DPDP compliance by design:

| DPDP Act Statutory Mandate | Section / Principle | MediKiosk Architectural Implementation |
| :--- | :--- | :--- |
| **Notice Requirement** | **Section 5** | Patients are presented with an itemized notice explaining data use in their chosen language (English, Hindi, Marathi) with **one-tap audio read-aloud**. |
| **Affirmative Consent** | **Section 6** | A mandatory checkbox must be explicitly tapped. The "Verify & Get OPD Token" action remains blocked until active consent is recorded. |
| **Purpose Limitation** | **Section 6(1)** | Data collected at the kiosk is strictly limited to today's outpatient consultation and triage queue allocation. |
| **Data Minimization** | **Section 6(1)** | Only basic demographics (Name, Age, Gender, Mobile, Department) are collected. No extraneous commercial data is requested. |
| **Right to Revoke** | **Section 6(4)** | Disclosed clearly in the `ConsentDetailsModal`: patients retain the right to revoke data access permissions via the ABHA mobile app. |
| **Security Safeguards** | **Section 8(5)** | All kiosk-to-server traffic is modeled around **256-bit AES encryption** and **TLS 1.3 cryptographic transport**. |
| **Protection from Shoulder-Surfing** | **Section 8** | Sensitive Aadhaar and mobile digits are masked (`5481 •••• 1184`), and patient dashboards feature an **automatic 60-second privacy reset**. |

---

## 👆 3. Biometric & Aadhaar Authentication Protocol

For patients unable to receive SMS OTPs (e.g., poor rural cellular connectivity or dead mobile batteries), MediKiosk provides biometric verification compliant with UIDAI STQC standards:

- **STQC Optical Scanner Simulation**:
  - Simulates UIDAI Biometric Authentication Protocol v2.5.
  - Features real-time visual feedback with an oscillating cyan laser line (`animate-scan`) and progress indicator.
  - Sound effects synthesize sensory confirmation during the 1.5-second matching phase.
- **Aadhaar Data Masking**:
  - In compliance with UIDAI circulars, full Aadhaar numbers are never displayed on public kiosk screens after input. Displays mask the first 8 digits, revealing only the last 4 digits for identity confirmation.

---

## 📋 4. Evaluation Checklist for Hackathon Judges

Use this matrix to verify regulatory and operational criteria during evaluations:

- [x] **Trilingual Voice Narration**: Speaks instructions aloud in English, Hindi, and Marathi.
- [x] **ABDM ABHA Formatting**: Enforces 14-digit format (`XX-XXXX-XXXX-XXXX`).
- [x] **Aadhaar Formatting**: Enforces 12-digit space separation (`XXXX XXXX XXXX`).
- [x] **DPDP Explicit Consent**: Checkbox gating prevents unauthorized submission.
- [x] **Audio Privacy Disclosure**: Tapping "Hear privacy details" reads statutory safeguards aloud.
- [x] **Accessible On-Screen Keypad**: Eliminates reliance on external hardware keyboards.
- [x] **Emergency SOS Trigger**: One-tap escalation to triage nurse.
- [x] **Token Slip Generation**: Prints paper-ready OPD slips with assigned doctor, room, and queue position.
- [x] **Privacy Timeout**: Automatic session wipe prevents subsequent users from viewing patient records.

