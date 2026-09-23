# pyrefly: ignore [missing-import]
import pytest
# pyrefly: ignore [missing-import]
from fastapi.testclient import TestClient
from app.main import app
from app.models.schemas import (
    SessionState, SessionPhase, QuestionType, MedicalSystemEnum, ClinicalData
)
from app.engine.ayurveda_engine import AyurvedaEngine
from app.engine.socrates_engine import SocratesEngine
from app.engine.summary_generator import SummaryGenerator

client = TestClient(app)

def test_ayurveda_session_flow():
    """Verify full end-to-end AYUSH / Ayurveda Dashavidha Pariksha journey."""
    # 1. Start Session
    start_res = client.post("/api/session/start", json={"language": "english"})
    assert start_res.status_code == 200
    s_id = start_res.json()["session_id"]
    assert start_res.json()["ai_message"]["question_type"] == "system_select"

    # 2. Select AYUSH / Ayurveda approach
    res1 = client.post("/api/chat", json={"session_id": s_id, "selected_option": "system_ayush"})
    assert res1.status_code == 200
    assert res1.json()["medical_system"] == "ayush"
    assert res1.json()["ai_message"]["question_type"] == "language_select"

    # 3. Select English
    res2 = client.post("/api/chat", json={"session_id": s_id, "selected_option": "english"})
    assert res2.status_code == 200
    assert res2.json()["current_phase"] == "consent"

    # 4. Give Consent
    res3 = client.post("/api/chat", json={"session_id": s_id, "selected_option": "consent_yes"})
    assert res3.status_code == 200
    assert res3.json()["current_phase"] == "chief_complaint"

    # 5. Chief Complaint (Acidity / Indigestion / Amlapitta)
    res4 = client.post("/api/chat", json={
        "session_id": s_id,
        "message": "I have severe burning in chest and sour belching after meals for 1 week"
    })
    assert res4.status_code == 200
    data = res4.json()
    assert data["clinical_data"]["chief_complaint"] == "acidity / indigestion"
    assert data["current_phase"] == "ayurveda_dashavidha"

    # 6. Symptom Site
    res5 = client.post("/api/chat", json={
        "session_id": s_id,
        "selected_option": "Upper abdomen / Stomach"
    })
    assert res5.status_code == 200
    assert res5.json()["clinical_data"]["site"] == "Upper abdomen / Stomach"

    # 7. Symptom Severity
    res6 = client.post("/api/chat", json={
        "session_id": s_id,
        "selected_option": "6"
    })
    assert res6.status_code == 200
    assert res6.json()["clinical_data"]["severity"] == 6

    # 8. Prakriti Body Build
    res7 = client.post("/api/chat", json={
        "session_id": s_id,
        "selected_option": "Medium / Moderate athletic build"
    })
    assert res7.status_code == 200
    assert "prakriti" in res7.json()["clinical_data"]["dashavidha_pariksha"]

    # 9. Prakriti Temperature
    res8 = client.post("/api/chat", json={
        "session_id": s_id,
        "selected_option": "Prefers cooler environment (Dislikes heat)"
    })
    assert res8.status_code == 200

    # 10. Vikriti Changes
    res9 = client.post("/api/chat", json={
        "session_id": s_id,
        "selected_option": "Excessive body heat, burning sensations, irritability, acid reflux"
    })
    assert res9.status_code == 200
    assert "vikriti" in res9.json()["clinical_data"]["dashavidha_pariksha"]

    # 11. Ahara Appetite
    res10 = client.post("/api/chat", json={
        "session_id": s_id,
        "selected_option": "Very Good / Strong appetite (Tikshnagni)"
    })
    assert res10.status_code == 200
    assert "ahara_shakti" in res10.json()["clinical_data"]["dashavidha_pariksha"]

    # 12. Ahara Post-meal
    res11 = client.post("/api/chat", json={
        "session_id": s_id,
        "selected_option": "Acidity / Burning in chest or throat"
    })
    assert res11.status_code == 200

    # 13. Satmya Intolerance
    res12 = client.post("/api/chat", json={
        "session_id": s_id,
        "selected_option": "Spicy / Hot foods, Oily / Fried foods"
    })
    assert res12.status_code == 200

    # 14. Sattva Emotional
    res13 = client.post("/api/chat", json={
        "session_id": s_id,
        "selected_option": "Generally calm and balanced"
    })
    assert res13.status_code == 200

    # 15. Vyayama Activity
    res14 = client.post("/api/chat", json={
        "session_id": s_id,
        "selected_option": "Moderate endurance / Regular walking or light exercise"
    })
    assert res14.status_code == 200

    # 16. Sara Strength
    res15 = client.post("/api/chat", json={
        "session_id": s_id,
        "selected_option": "Good (Madhyama Sara)"
    })
    assert res15.status_code == 200

    # 17. Samhanana Build
    res16 = client.post("/api/chat", json={
        "session_id": s_id,
        "selected_option": "Well-compacted & Sturdy (Susamhita)"
    })
    assert res16.status_code == 200

    # 18. Vaya Age Stage
    res17 = client.post("/api/chat", json={
        "session_id": s_id,
        "selected_option": "Young adult (18–35 yrs) / Taruna"
    })
    assert res17.status_code == 200
    assert res17.json()["current_phase"] == "medical_history"

    # 19. Medical History
    res18 = client.post("/api/chat", json={
        "session_id": s_id,
        "selected_option": "None of these"
    })
    assert res18.status_code == 200
    assert res18.json()["current_phase"] == "medication_history"

    # 20. Medication History
    res19 = client.post("/api/chat", json={
        "session_id": s_id,
        "selected_option": "No"
    })
    assert res19.status_code == 200
    assert res19.json()["current_phase"] == "allergies"

    # 21. Allergies
    res20 = client.post("/api/chat", json={
        "session_id": s_id,
        "selected_option": "No (No known allergies)"
    })
    assert res20.status_code == 200
    assert res20.json()["current_phase"] == "review_confirmation"

    # 22. Confirm
    res21 = client.post("/api/chat", json={
        "session_id": s_id,
        "selected_option": "looks_correct"
    })
    assert res21.status_code == 200
    data21 = res21.json()
    assert data21["is_completed"] is True
    assert data21["doctor_summary"] is not None

    summary = data21["doctor_summary"]
    assert "AYUSH" in summary["medical_system"]
    assert summary["dashavidha_pariksha"] is not None
    assert any("Prakriti" in k for k in summary["dashavidha_pariksha"])
    assert any("Ahara Shakti" in k for k in summary["dashavidha_pariksha"])
    assert "practitioner" in summary["ai_note"].lower() or "vaidya" in summary["ai_note"].lower()
    # Check strict non-diagnosis policy
    assert "not a diagnosis" in summary["ai_note"].lower()

def test_ayurveda_direct_engine_unit():
    """Unit test for Dashavidha Pariksha slot tracking and extraction."""
    session = SessionState(
        session_id="ayush-unit-1",
        medical_system=MedicalSystemEnum.AYUSH,
        system_type="ayurveda",
        language="english",
        current_phase=SessionPhase.AYURVEDA_DASHAVIDHA,
        current_question_key="ayurveda_prakriti_build"
    )
    session.clinical_data.chief_complaint = "joint pain"

    msg, updated_session = AyurvedaEngine.process_response(
        session,
        "I have a slender light body build, dry skin, and I feel cold very easily",
        "Slender / Thin build, dry skin, feels cold easily (Vata dominant tendencies)"
    )

    dp = updated_session.clinical_data.dashavidha_pariksha
    assert dp.prakriti is not None
    assert "Vata" in dp.prakriti.get("body_build", "")
    assert updated_session.current_question_key.startswith("ayurveda_")
