import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from backend.config import SAMPLES_DIR


def generate_sample_documents():
    """Generates 3 authentic medical document images for immediate testing & demonstration."""
    SAMPLES_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Indian Clinic Prescription
    rx_path = SAMPLES_DIR / "sample_prescription.png"
    if not rx_path.exists():
        img = Image.new("RGB", (900, 1100), color=(253, 253, 252))
        draw = ImageDraw.Draw(img)

        # Header Clinic
        draw.rectangle([0, 0, 900, 140], fill=(26, 75, 132))
        draw.text((40, 25), "MEDIKIOSK HEALTHCARE CLINIC", fill=(255, 255, 255))
        draw.text((40, 60), "Dr. Rajesh Sharma, MD (Internal Medicine), Reg No: MCI-48291", fill=(220, 235, 255))
        draw.text((40, 90), "Contact: +91 98765 43210 | OPD Schedule: Mon-Sat 9AM-2PM", fill=(180, 210, 245))

        # Patient Info Bar
        draw.rectangle([40, 160, 860, 220], outline=(200, 210, 220), fill=(245, 248, 252), width=1)
        draw.text((60, 175), "Patient: Ramesh Chandra (Male, Age: 52 Yrs)", fill=(40, 40, 40))
        draw.text((580, 175), "Date: 10/09/2026", fill=(40, 40, 40))
        draw.text((60, 195), "UHID: MK-2026-8921 | Phone: 98112-XXXXX", fill=(90, 90, 90))

        # Vitals Box
        draw.rectangle([40, 235, 860, 280], outline=(210, 220, 230), fill=(255, 255, 255), width=1)
        draw.text((60, 248), "Vitals:  BP: 150/95 mmHg  |  Pulse: 82 bpm  |  SpO2: 98%  |  Weight: 76 kg", fill=(30, 30, 30))

        # Clinical Notes
        draw.text((50, 300), "Clinical History: Type 2 Diabetes Mellitus x 4 years, Poor Glycemic Control", fill=(60, 60, 60))
        draw.text((50, 325), "Investigations: HbA1c 8.2% (High), Fasting Blood Sugar 162 mg/dL", fill=(60, 60, 60))

        # Rx Symbol
        draw.text((50, 370), "Rx", fill=(26, 75, 132))
        draw.line([40, 410, 860, 410], fill=(26, 75, 132), width=2)

        # Prescriptions Lines
        meds = [
            ("1. Tab Metformin 500 mg", "1-0-1 (After Food)", "Duration: 30 Days"),
            ("2. Tab Glimepiride 1 mg", "1-0-0 (Before Breakfast)", "Duration: 30 Days"),
            ("3. Tab Telmisartan 40 mg", "0-1-0 (After Lunch)", "Duration: 30 Days"),
            ("4. Tab Atorvastatin 10 mg", "0-0-1 (At Bedtime)", "Duration: 30 Days"),
            ("5. Cap Vitamin D3 60000 IU", "Once weekly", "Duration: 8 Weeks"),
        ]

        y = 430
        for name, timing, dur in meds:
            draw.text((60, y), name, fill=(20, 20, 20))
            draw.text((450, y), timing, fill=(50, 50, 50))
            draw.text((700, y), dur, fill=(90, 90, 90))
            draw.line([50, y + 35, 850, y + 35], fill=(235, 240, 245), width=1)
            y += 55

        # Advice & Doctor Signature
        draw.text((50, y + 40), "Advice: 30 mins brisk walking daily. Avoid refined sugar. Review after 1 month with FBS & PPBS.", fill=(50, 50, 50))

        draw.line([600, 1000, 840, 1000], fill=(120, 120, 120), width=1)
        draw.text((620, 1010), "Dr. Rajesh Sharma, MD", fill=(40, 40, 40))
        draw.text((640, 1030), "(Senior Physician)", fill=(100, 100, 100))

        img.save(rx_path)

    # 2. Lab Pathology Report
    lab_path = SAMPLES_DIR / "sample_lab_report.png"
    if not lab_path.exists():
        img = Image.new("RGB", (900, 1100), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # Header
        draw.rectangle([0, 0, 900, 120], fill=(34, 112, 94))
        draw.text((40, 25), "METROPOLIS DIAGNOSTIC & PATHOLOGY LABS", fill=(255, 255, 255))
        draw.text((40, 60), "NABL Accredited Laboratory | ISO 15189:2022 Certified", fill=(210, 245, 235))
        draw.text((40, 85), "Sample Collected: 08/09/2026 | Reported: 09/09/2026", fill=(180, 230, 215))

        # Patient Info
        draw.rectangle([40, 140, 860, 200], outline=(200, 220, 210), fill=(245, 252, 248), width=1)
        draw.text((60, 155), "Patient: Sunita Patel (Female, Age: 48 Yrs)", fill=(40, 40, 40))
        draw.text((580, 155), "Ref By: Dr. P. K. Verma", fill=(40, 40, 40))
        draw.text((60, 175), "Lab ID: LAB-98421 | Specimen: Blood (Fluoride / EDTA / Serum)", fill=(90, 90, 90))

        # Table Header
        draw.rectangle([40, 220, 860, 260], fill=(230, 242, 238))
        draw.text((60, 232), "TEST NAME", fill=(30, 70, 60))
        draw.text((360, 232), "RESULT", fill=(30, 70, 60))
        draw.text((500, 232), "UNITS", fill=(30, 70, 60))
        draw.text((640, 232), "REFERENCE RANGE", fill=(30, 70, 60))

        # Tests
        tests = [
            ("HbA1c (Glycated Hemoglobin)", "8.2", "%", "< 5.7 % Normal"),
            ("Estimated Average Glucose (eAG)", "189", "mg/dL", "70 - 126 mg/dL"),
            ("Fasting Blood Sugar", "154", "mg/dL", "70 - 100 mg/dL"),
            ("Serum Creatinine", "1.1", "mg/dL", "0.6 - 1.2 mg/dL"),
            ("Blood Urea", "28", "mg/dL", "15 - 40 mg/dL"),
            ("Total Cholesterol", "224", "mg/dL", "< 200 mg/dL (Desirable)"),
            ("Triglycerides", "195", "mg/dL", "< 150 mg/dL"),
            ("HDL Cholesterol", "38", "mg/dL", "> 40 mg/dL"),
            ("Hemoglobin", "13.4", "g/dL", "12.0 - 15.0 g/dL"),
            ("Platelet Count", "2.8", "lakhs/cumm", "1.5 - 4.5 lakhs/cumm"),
        ]

        y = 280
        for name, res, units, ref in tests:
            draw.text((60, y), name, fill=(20, 20, 20))
            draw.text((360, y), res, fill=(180, 20, 20) if res in ["8.2", "189", "154", "224", "195", "38"] else (20, 20, 20))
            draw.text((500, y), units, fill=(70, 70, 70))
            draw.text((640, y), ref, fill=(90, 90, 90))
            draw.line([40, y + 30, 860, y + 30], fill=(235, 242, 238), width=1)
            y += 45

        # Footer
        draw.text((60, 980), "End of Pathology Examination Report", fill=(120, 120, 120))
        draw.line([600, 1020, 840, 1020], fill=(120, 120, 120), width=1)
        draw.text((620, 1030), "Dr. Neha Gupta, MD (Path)", fill=(40, 40, 40))

        img.save(lab_path)

    # 3. Hospital Discharge Summary
    disch_path = SAMPLES_DIR / "sample_discharge_summary.png"
    if not disch_path.exists():
        img = Image.new("RGB", (900, 1100), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # Header
        draw.rectangle([0, 0, 900, 130], fill=(18, 52, 86))
        draw.text((40, 25), "APEX MULTISPECIALTY HOSPITAL & RESEARCH CENTRE", fill=(255, 255, 255))
        draw.text((40, 60), "DEPARTMENT OF INTERNAL MEDICINE & CRITICAL CARE", fill=(210, 230, 250))
        draw.text((40, 90), "DISCHARGE SUMMARY / DISCHARGE CARD", fill=(255, 215, 0))

        # Admission / Discharge Details
        draw.rectangle([40, 150, 860, 240], outline=(200, 210, 220), fill=(248, 250, 254), width=1)
        draw.text((60, 165), "Patient Name: Anand Kulkarni | Age: 58 Yrs | Gender: Male", fill=(40, 40, 40))
        draw.text((60, 190), "Date of Admission: 12/04/2025 | Date of Discharge: 16/04/2025", fill=(40, 40, 40))
        draw.text((60, 215), "Consultant: Dr. Arvind Deshmukh, MD | IPD No: IP-48921", fill=(90, 90, 90))

        # Final Diagnosis
        draw.rectangle([40, 260, 860, 310], fill=(235, 242, 252))
        draw.text((60, 275), "FINAL DIAGNOSIS: Type 2 Diabetes Mellitus with Hyperglycemic Episode & Hypertension", fill=(20, 40, 80))

        # Clinical Course
        draw.text((50, 330), "Course in Hospital:", fill=(20, 20, 20))
        draw.text((50, 355), "Patient admitted with severe lethargy and uncontrolled blood sugars (RBS 340 mg/dL).", fill=(50, 50, 50))
        draw.text((50, 380), "Stabilized with IV hydration and sliding scale regular insulin. Vitals stabilized to BP 130/80.", fill=(50, 50, 50))

        # Discharge Medications
        draw.text((50, 430), "Discharge Medications:", fill=(20, 20, 20))
        disch_meds = [
            "• Tab Metformin 500 mg — 1-0-1 (After Meals)",
            "• Tab Glimepiride 2 mg — 1-0-0 (Before Breakfast)",
            "• Tab Amlodipine 5 mg — 0-0-1 (At Bedtime)",
            "• Tab Pantoprazole 40 mg — 1-0-0 (Empty Stomach)",
            "• Tab Paracetamol 650 mg — SOS (For Body ache/fever)"
        ]
        y = 465
        for m in disch_meds:
            draw.text((70, y), m, fill=(30, 30, 30))
            y += 35

        draw.text((50, y + 30), "Condition at Discharge: Hemodynamically Stable, Afebrile, Alert & Oriented.", fill=(40, 40, 40))
        draw.text((50, y + 65), "Follow Up: Review in Medicine OPD after 7 days with Blood Sugar charting.", fill=(40, 40, 40))

        draw.line([600, 1020, 840, 1020], fill=(120, 120, 120), width=1)
        draw.text((620, 1030), "Authorized Medical Officer", fill=(40, 40, 40))

        img.save(disch_path)


if __name__ == "__main__":
    generate_sample_documents()
