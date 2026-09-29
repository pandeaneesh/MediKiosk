# pyrefly: ignore [missing-import]
import pytest
# pyrefly: ignore [missing-import]
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_full_session_flow():
    # 1. Start Session
    start_res = client.post("/api/session/start", json={"language": "english"})
    assert start_res.status_code == 200
    data = start_res.json()
    session_id = data["session_id"]
    assert session_id is not None
    assert data["ai_message"]["question_type"] == "system_select"

    # 1b. Select Allopathy
    chat_res0 = client.post("/api/chat", json={
        "session_id": session_id,
        "selected_option": "system_allopathy"
    })
    assert chat_res0.status_code == 200
    assert chat_res0.json()["ai_message"]["question_type"] == "language_select"

    # 2. Select English
    chat_res1 = client.post("/api/chat", json={
        "session_id": session_id,
        "selected_option": "english"
    })
    assert chat_res1.status_code == 200
    assert chat_res1.json()["current_phase"] == "consent"

    # 3. Give Consent
    chat_res2 = client.post("/api/chat", json={
        "session_id": session_id,
        "selected_option": "consent_yes"
    })
    assert chat_res2.status_code == 200
    assert chat_res2.json()["current_phase"] == "chief_complaint"

    # 4. State Chief Complaint
    chat_res3 = client.post("/api/chat", json={
        "session_id": session_id,
        "message": "I have stomach pain"
    })
    assert chat_res3.status_code == 200
    assert chat_res3.json()["clinical_data"]["chief_complaint"] == "abdominal pain"

    # 5. Get Summary
    summary_res = client.get(f"/api/session/{session_id}/summary")
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert summary["patient_complaint"] == "abdominal pain"
    assert "doctor" in summary["ai_note"].lower() or "practitioner" in summary["ai_note"].lower()

def test_emergency_trigger_endpoint():
    # Start a session
    start_res = client.post("/api/session/start", json={"language": "english"})
    session_id = start_res.json()["session_id"]

    # Trigger emergency
    em_res = client.post("/api/emergency/trigger", json={
        "session_id": session_id,
        "reason": "Test emergency escalation"
    })
    assert em_res.status_code == 200
    assert em_res.json()["status"] == "alert_dispatched"
    assert em_res.json()["alert"]["urgency"] == "CRITICAL"

def test_ocr_injection_endpoint():
    start_res = client.post("/api/session/start", json={"language": "english"})
    session_id = start_res.json()["session_id"]

    ocr_res = client.post("/api/ocr/inject", json={
        "session_id": session_id,
        "document_type": "prescription",
        "extracted_text": "Rx: Tab Metformin 500mg daily. Known allergy: Penicillin. History of Diabetes Mellitus."
    })
    assert ocr_res.status_code == 200
    clin_data = ocr_res.json()["clinical_data"]
    assert "Diabetes Mellitus" in clin_data["medical_history"]
    assert "Penicillin" in clin_data["allergies"]
