import sys
import os
import unittest
import json

sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from database.seed_data import seed_database
from config.sqlite_config import execute_query
from services.abdm_service import ABDM2Service
from services.biometric_service import BiometricSTQCProcessor
from services.queue_service import SmartQueueEngine
from services.telemetry_service import TelemetryAnalyticsEngine

from routes.patient_routes import (
    find_patient_in_db,
    save_patient_to_db,
    get_patient_full_history,
    start_ai_interview,
    chat_ai_interview,
    save_ai_interview,
    save_pain_mapping,
    get_pain_mapping,
    save_sample_document_for_patient,
    get_patient_documents,
    book_appointment,
    get_patient_appointments
)
from routes.doctor_routes import (
    find_doctor_in_db,
    get_patient_clinical_history,
    save_consultation
)
from routes.admin_routes import (
    admin_common_login,
    get_hospital_scoped_data,
    get_main_country_telemetry
)
from models.schemas import (
    BookAppointmentRequest,
    StartInterviewRequest,
    InterviewChatRequest,
    SaveInterviewRequest,
    SavePainMappingRequest,
    SaveConsultationRequest,
    AdminLoginRequest
)

class TestMediKioskFullIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        seed_database()

    def test_01_sqlite_seeding(self):
        doctors = execute_query("SELECT * FROM local_master_doctors")
        self.assertGreaterEqual(len(doctors), 5)
        kiosks = execute_query("SELECT * FROM kiosk_fleet_status")
        self.assertGreaterEqual(len(kiosks), 4)
        hospitals = execute_query("SELECT * FROM hospitals")
        self.assertGreaterEqual(len(hospitals), 3)

    def test_02_patient_data_isolation(self):
        """Test Requirement 5: Patient A data must NEVER leak to Patient B."""
        pt_a = find_patient_in_db("PT-8841")
        pt_b = find_patient_in_db("PT-1204")
        self.assertIsNotNone(pt_a)
        self.assertIsNotNone(pt_b)
        self.assertEqual(pt_a["patientId"], "PT-8841")
        self.assertEqual(pt_b["patientId"], "PT-1204")
        self.assertNotEqual(pt_a["fullName"], pt_b["fullName"])

        # History isolation
        hist_a = get_patient_full_history("PT-8841")
        hist_b = get_patient_full_history("PT-1204")
        self.assertEqual(hist_a["patient"]["patientId"], "PT-8841")
        self.assertEqual(hist_b["patient"]["patientId"], "PT-1204")
        
        # Verify documents are strictly separated
        docs_a = get_patient_documents("PT-8841")["documents"]
        for d in docs_a:
            self.assertEqual(d["patientId"], "PT-8841")

    def test_03_ai_health_interview_workflow(self):
        """Test Requirement 3: AI-assisted health interview & storage."""
        start_req = StartInterviewRequest(
            patientId="PT-8841",
            medicalSystem="allopathy",
            language="english"
        )
        res = start_ai_interview(start_req)
        self.assertTrue(res["success"])
        session_id = res["sessionId"]
        self.assertTrue(session_id.startswith("kiosk-"))

        # Save interview
        save_req = SaveInterviewRequest(
            patientId="PT-8841",
            sessionId=session_id,
            complaint="Low back ache with morning stiffness",
            symptoms="L4-L5 lumbar discomfort",
            duration="2 months",
            severity=6,
            painLocation="Lower back",
            painIntensity=6,
            isCompleted=True
        )
        save_res = save_ai_interview(save_req)
        self.assertTrue(save_res["success"])

    def test_04_3d_pain_mapping_digital_mannequin(self):
        """Test Requirement 9 & 10: Digital Mannequin pain localization & visual coords."""
        pain_req = SavePainMappingRequest(
            patientId="PT-8841",
            patientGender="male",
            bodyRegion="back",
            side="center",
            location="lower",
            painIntensity=7,
            painType="Sharp shooting",
            laymanSummary="Lower Back (Lumbar L4-L5)",
            coordinates=[0.0, 0.45, 0.75]
        )
        save_res = save_pain_mapping(pain_req)
        self.assertTrue(save_res["success"])

        get_res = get_pain_mapping("PT-8841")
        self.assertTrue(get_res["success"])
        self.assertEqual(get_res["painMapping"]["bodyRegion"], "back")
        self.assertEqual(get_res["painMapping"]["painIntensity"], 7)

    def test_05_ocr_document_workflow(self):
        """Test Requirement 4: Medical document upload, OCR scanning, and patient association."""
        res = save_sample_document_for_patient({
            "patientId": "PT-8841",
            "sampleType": "LAB_REPORT"
        })
        self.assertTrue(res["success"])
        doc = res["document"]
        self.assertEqual(doc["patientId"], "PT-8841")
        self.assertIn("Total Cholesterol", str(doc["entities"]))

    def test_06_doctor_consultation_packet(self):
        """Test Requirement 6: Automatic full clinical history fetch & consultation save."""
        history = get_patient_clinical_history("PT-8841")
        self.assertTrue(history["success"])
        self.assertEqual(history["patient"]["patientId"], "PT-8841")
        self.assertIsNotNone(history["currentIssue"])
        self.assertIsNotNone(history["painMapping"])
        self.assertGreaterEqual(len(history["documents"]), 1)

        # Save consultation
        cons_req = SaveConsultationRequest(
            patientId="PT-8841",
            doctorId="doc-1",
            doctorName="Dr. Rajeshwar Sharma",
            diagnosis="Lumbar Spondylosis with Sciatica",
            prescription=[
                {"medicine": "Aceclofenac 100mg", "dosage": "1 Tab BD", "duration": "5 Days"},
                {"medicine": "Pregabalin 75mg", "dosage": "1 Cap HS", "duration": "10 Days"}
            ],
            clinicalNotes="Straight Leg Raise (SLR) positive at 60 deg on right side. Advised lumbar physio.",
            advice="Avoid forward bending and heavy lifting."
        )
        cons_res = save_consultation(cons_req)
        self.assertTrue(cons_res["success"])
        self.assertEqual(cons_res["status"], "COMPLETED")

    def test_07_common_admin_login_and_role_redirect(self):
        """Test Requirement 7: ONE Common Admin Login with role-based scoping."""
        # Test 1: Hospital Admin
        hosp_req = AdminLoginRequest(username="admin.medikiosk@gmail.com", password="12345")
        hosp_res = admin_common_login(hosp_req)
        self.assertTrue(hosp_res["success"])
        self.assertEqual(hosp_res["admin"]["role"], "HOSPITAL_ADMIN")
        self.assertEqual(hosp_res["admin"]["hospitalId"], "HOSP-AIIMS-01")

        # Hospital Scoped data
        hosp_data = get_hospital_scoped_data("HOSP-AIIMS-01")
        self.assertTrue(hosp_data["success"])
        self.assertEqual(hosp_data["hospital"]["hospital_id"], "HOSP-AIIMS-01")

        # Test 2: Main / Government Admin
        main_req = AdminLoginRequest(username="gov.director@abdm.gov.in", password="12345")
        main_res = admin_common_login(main_req)
        self.assertTrue(main_res["success"])
        self.assertEqual(main_res["admin"]["role"], "MAIN_ADMIN")

        # Country-wide Telemetry
        country_data = get_main_country_telemetry()
        self.assertTrue(country_data["success"])
        self.assertGreaterEqual(country_data["nationalOverview"]["totalHospitals"], 3)
        self.assertGreaterEqual(len(country_data["hospitals"]), 3)

if __name__ == "__main__":
    unittest.main()
