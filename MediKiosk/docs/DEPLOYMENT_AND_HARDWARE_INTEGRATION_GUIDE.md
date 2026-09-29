# 🖥️ MediKiosk — Deployment & Hardware Integration Guide

---

## 🛠️ 1. Hospital Kiosk Hardware Specifications

For hospital procurement teams and system integrators deploying MediKiosk in government or private healthcare centers, the following reference hardware architecture is recommended:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   HOSPITAL KIOSK HARDWARE TERMINAL                     │
├────────────────────────────────┬───────────────────────────────────────┤
│ COMPONENT                      │ RECOMMENDED SPECIFICATION             │
├────────────────────────────────┼───────────────────────────────────────┤
│ **Display Panel**              │ 21.5" to 32" Full HD (1920x1080) LED  │
│ **Touch Interface**            │ Projected Capacitive (PCAP) 10-point  │
│ **Protective Glass**           │ 3mm Vandal-Resistant Tempered Glass   │
│ **Compute Unit**               │ Intel Core i3/i5 or Industrial RK3588 │
│ **Memory & Storage**           │ 8GB DDR4 RAM / 128GB NVMe SSD         │
│ **Biometric Sensor**           │ STQC Level 0 / Level 1 Optical Sensor │
│                                │ (e.g. Mantra MFS100 / Morpho MSO1300) │
│ **Thermal Slip Printer**       │ 80mm High-Speed Auto-Cutter (ESC/POS) │
│ **Audio Output**               │ Dual 5W Amplified Front-Facing Speaker│
│ **Network Connectivity**       │ Dual Gigabit LAN + 4G/5G Failover SIM │
│ **Enclosure Form Factor**      │ Free-Standing Sheet Metal, Powder Coat│
└────────────────────────────────┴───────────────────────────────────────┘
```

---

## 🔒 2. Operating System Kiosk Lockdown

To prevent users or malicious actors from minimizing the browser or accessing the desktop, MediKiosk should be configured in **Dedicated Kiosk Mode**.

### Option A: Windows Assigned Access (Edge / Chrome)
Run the browser in fullscreen kiosk mode with disabled touch gestures:

```batch
"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --kiosk http://localhost:5173 --edge-kiosk-type=fullscreen --no-first-run --disable-pinch --disable-context-menu
```

### Option B: Linux / Ubuntu Kiosk (Systemd + Chromium)
Configure Chromium inside a lightweight X11 window manager (`Openbox` or `Matchbox`):

```bash
chromium-browser --kiosk --noerrdialogs --disable-infobars --disable-features=TranslateUI --check-for-update-interval=31536000 http://localhost:5173
```

---

## 🚀 3. Cross-Device Run Instructions

MediKiosk is engineered with **zero external server dependencies** for its UI demo and runs on every operating system without configuration.

### Method 1: Instant Standalone (No Node.js Needed) ⚡
1. Double-click [`standalone_kiosk.html`](../standalone_kiosk.html) or run [`s.bat`](../s.bat) on Windows.
2. The complete application will execute inside Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari.
3. Press **F11** to toggle Fullscreen Kiosk Mode.

### Method 2: Vite React Development Server
```bash
# 1. Install dependencies
npm install

# 2. Start local server
npm run dev

# 3. Open in browser
http://localhost:5173
```

### Method 3: Multi-Device Wi-Fi Network Mode (Tablets & Phones)
To demo MediKiosk on an iPad, Android tablet, or smartphone connected to the same Wi-Fi network:

```bash
# Start Vite with the host flag
npm run dev -- --host
```
Vite will output a local network address, for example:
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.45:5173/
```
Open `http://192.168.1.45:5173/` on any mobile device or tablet to test touch responsiveness.

---

## 🎤 4. Hackathon Presentation Playbook (3-Minute Demo)

Use this script during Smart India Hackathon jury demonstrations:

| Time | Demo Action | What to Explain to Judges |
| :--- | :--- | :--- |
| **0:00 - 0:30** | **Orientation & Voice** | Switch language to **मराठी (Marathi)** or **हिंदी (Hindi)**. Tap the audio button to show native spoken guidance for rural/illiterate patients. Point out the dynamic sound equalizer. |
| **0:30 - 1:00** | **ABHA ID Self Check-In** | Tap **"⚡ Demo ABHA"** (`14-8892-4412-9031`). Show auto-hyphenation. Check the DPDP Act consent box. Tap "Verify & Get OPD Token". |
| **1:00 - 1:30** | **OTP Verification & Confetti** | Click **"Demo OTP is 123456"**. Show auto-fill, countdown timer, and celebratory confetti burst. Point out verified patient **Ramesh Kumar Sharma**. |
| **1:30 - 2:00** | **Biometric Fingerprint Demo** | Switch to **Aadhaar** tab. Tap **"Use Biometric Fingerprint Scanner"**. Tap the scanner pad to show the animated cyan laser beam sweep and audio pitch escalation. Displays **Sanjay Shinde** and token `OPD-B-019`. |
| **2:00 - 2:30** | **New Patient ABHA Creation** | Tap **"Register as New Patient"**. Tap **"⚡ Auto-fill Demo"**. Click **"Generate ABHA & Register Patient"**. Highlight the instant assignment of a new 14-digit ABHA ID (`14-XXXX-XXXX-XXXX`) and digital handle. |
| **2:30 - 3:00** | **Patient Dashboard & Slip** | Show the OPD Token Card, assigned doctor (`Dr. Sharma, MD`), department (`General Medicine`), room (`Room 104`), and wait time. Click **"Print token slip"** to trigger thermal printer formatting. Point out the 60-second privacy auto-reset. |

---

## 🧪 5. Built-In Demo Credentials Table

| Identifier Type | One-Click Trigger | Demo Value | Expected Patient Profile | Assigned Token |
| :--- | :--- | :--- | :--- | :--- |
| **ABHA ID** | `⚡ Demo ABHA` | `14-8892-4412-9031` | Ramesh Kumar Sharma (42, M) | `OPD-A-042` (Queue #3) |
| **Aadhaar (OTP)** | `⚡ Demo Aadhaar` | `5481 9023 1184` | Sunita Devi Patel (38, F) | `OPD-A-042` (Queue #3) |
| **Aadhaar (Biometric)** | `Tap to Start Scan` | `5481 9023 1184` | Sanjay Balwantrao Shinde (51, M) | `OPD-B-019` (Queue #2) |
| **New Patient Intake** | `⚡ Auto-fill Demo` | Auto-generated | Aarav Dev Sharma (34, M) | `OPD-N-0XX` (Queue #1) |

