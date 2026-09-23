# 📊 Hospital Admin Command Center & Analytics Governance Guide

---

## 📌 Executive Summary

The **MediKiosk Admin Command Center** (`src/AdminDashboard.jsx` and `standalone_kiosk.html`) is an executive-level operational console designed for Hospital Superintendents, Medical Directors, and Health Ministry Auditors.

It consolidates all terminal activities across 7 specialized management modules:
1. **Live OPD Queues & Load**: Real-time departmental patient load, chamber wait times, and emergency auto-rebalancing.
2. **User & Login Analytics**: Comprehensive telemetry on patient intake channels, login volumes, and hourly peak curves.
3. **Customer Analytics**: Cohort retention, acquisition rates, geographic catchments, and top chronic care beneficiaries.
4. **Doctor Roster & Chambers**: Active medical specialist registry, duty statuses, consult durations, and patient counts.
5. **Kiosk Fleet Hardware**: Terminal health monitoring, paper roll status, thermal sensors, and remote diagnostic ping.
6. **ABDM & DPDP Compliance**: Real-time audit logs of patient consents, AES-256 encryption status, and data purge cycles.
7. **MongoDB Cloud History Studio**: Integrated BSON collection viewer for direct inspection of cloud records.

---

## 📈 1. User & Login Analytics Breakdown

The User & Login Analytics module tracks authentication events across the hospital's entire check-in fleet:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         User & Login Analytics Dashboard                    │
│                                                                             │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌────────────────┐  │
│  │ Total Logins  │ │ This Month    │ │ This Week     │ │ Today (Peak 94)│  │
│  │ 24,892        │ │ 4,320 (+12.6%)│ │ 1,184 (+8.2%) │ │ 286            │  │
│  └───────────────┘ └───────────────┘ └───────────────┘ └────────────────┘  │
│  ┌───────────────┐ ┌───────────────┐                                        │
│  │ Unique Users  │ │ New This Month│                                        │
│  │ 18,450 (74.1%)│ │ 892 (+14.65%) │                                        │
│  └───────────────┘ └───────────────┘                                        │
│                                                                             │
│  ┌───────────────────────────────────┐ ┌──────────────────────────────────┐  │
│  │ Authentication Channel Breakdown  │ │ Today's Hourly Intake Curve       │  │
│  │ • ABHA ID: 10,952 (44.0%)         │ │ 08:00 - 11:00 AM (Morning Rush)  │  │
│  │ • Aadhaar OTP: 7,716 (31.0%)      │ │ 12:00 - 02:00 PM (Midday Lull)   │  │
│  │ • Biometric Thumb: 4,480 (18.0%)  │ │ 02:00 - 04:00 PM (Afternoon OPD) │  │
│  │ • Walk-in Intake: 1,744 (7.0%)    │ │                                  │  │
│  └───────────────────────────────────┘ └──────────────────────────────────┘  │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Live Patient Check-In Streaming Feed                                   │  │
│  │ Real-time transaction log with timestamps, masked IDs, tokens & kiosks │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Metrics Definitions
- **Total Logins (`24,892`)**: Cumulative patient check-in sessions recorded since kiosk fleet deployment (+18.4% all-time growth).
- **Logins This Month (`4,320`)**: Total authentication sessions processed in the current calendar month (+12.6% MoM).
- **Logins This Week (`1,184`)**: Weekly throughput tracking weekday vs. weekend surge (+8.2% WoW).
- **Logins Today (`286`)**: Real-time intraday count. Peak intake hour recorded at 10:00 AM (94 check-ins/hour).
- **Unique Users Logged In (`18,450`)**: Distinct individual patients authenticated, representing a 74.1% unique-to-repeat ratio.
- **New Users This Month (`892`)**: Newly onboarded patients registering their first hospital visit or creating an ABHA ID (+14.65% vs. previous month).

---

## 👥 2. Customer (Patient) Analytics Breakdown

Customer Analytics transforms raw check-in data into clinical cohort insights and geographic demand patterns:

### Core Customer KPIs
| KPI | Value | Clinical Significance |
| :--- | :--- | :--- |
| **Total Customers** | `18,450` | Total registered patient beneficiaries in hospital records. |
| **New Customers This Month** | `892` | Rate of new patient inflow into the healthcare institution. |
| **Active Customers** | `12,340` | Patients with at least one hospital consultation within the past 90 days. |
| **Inactive Customers** | `6,110` | Patients with no hospital visits for over 90 days (targeted for chronic care outreach). |
| **Returning Customers** | `13,820` | Patients who have visited the facility 2 or more times (demonstrating trust in care). |
| **MoM Customer Growth** | `+14.65%` | Acceleration of patient acquisition compared to the previous 30-day cycle. |
| **Customer Retention Rate** | `78.4%` | High institutional retention driven by automated follow-ups and token visibility. |
| **Customer Acquisition Rate** | `21.6%` | Healthy pipeline of first-time care seekers joining the hospital network. |

### Catchment Demographics (Customers by Location)
The hospital catchment area is mapped into 7 regional demographic zones:
1. **South Delhi**: 4,210 patients (22.8%) — Primary immediate catchment zone.
2. **West Delhi**: 3,450 patients (18.7%) — Metro corridor transit cluster.
3. **East Delhi & Trans-Yamuna**: 2,890 patients (15.7%) — Civil hospital referral catchment.
4. **North & Central Delhi**: 2,420 patients (13.1%) — Historic Old Delhi hub.
5. **Noida / Greater Noida**: 2,180 patients (11.8%) — Expressway commuter zone.
6. **Gurugram (Haryana)**: 1,740 patients (9.4%) — Industrial and corporate worker influx.
7. **Faridabad & Outstation**: 1,560 patients (8.5%) — Interstate rail and bus terminal arrivals.

### Top Customers Directory
Interactive directory of frequent care beneficiaries (e.g. chronic hypertension, diabetic follow-up, post-op rehabilitation):
- Real-time search filter supporting patient name, department, or ABHA ID.
- Displays visit counts, primary department, assigned physician, and care condition.

---

## 📜 3. MongoDB Cloud History Studio

Embedded directly within the Admin Console, Tab 7 provides direct visibility into cloud-synchronized database records:
- **Collection Tabs**: Switch between `queue_tickets`, `patients`, `local_master_doctors`, and `abdm_health_records`.
- **Real-Time Search**: Instant JSON string filter across all document keys.
- **Document Inspector**: 1-click modal rendering raw BSON structures in syntax-highlighted JSON.

---

## 🖨️ 4. Executive Reporting & Audit Export

The Admin Dashboard provides a 1-click **Daily OPD Executive Report** export modal:
- Computes aggregate metrics: Total registrations, ABHA e-KYC rate (92%), emergency red-flag dispatches, and kiosk uptime (99.8%).
- Generates print-ready text formatted for hospital board meetings and Ministry of Health compliance filings.
