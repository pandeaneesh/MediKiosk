import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_allopathy_cardiac_journey():
    start_res = client.post("/api/session/start", json={"language": "english"})
    assert start_res.status_code == 200
    s_id = start_res.json()["session_id"]

    # Select Allopathy
    client.post("/api/chat", json={"session_id": s_id, "selected_option": "system_allopathy"})
    # Select English
    client.post("/api/chat", json={"session_id": s_id, "selected_option": "english"})
    # Give consent
    client.post("/api/chat", json={"session_id": s_id, "selected_option": "consent_yes"})
    # Chief Complaint
    chat_res = client.post("/api/chat", json={"session_id": s_id, "message": "I have crushing chest pain radiating to my left arm"})
    
    data = chat_res.json()
    assert data["clinical_data"]["chief_complaint"] == "chest pain"
    # Verify red flag triggered for cardiac symptom
    assert data["red_flag"] is True
    assert len(data["red_flag_details"]) > 0

def test_multilingual_marathi_ayush_journey():
    start_res = client.post("/api/session/start", json={"language": "marathi"})
    s_id = start_res.json()["session_id"]

    # Select AYUSH
    client.post("/api/chat", json={"session_id": s_id, "selected_option": "system_ayush"})
    # Select Marathi
    client.post("/api/chat", json={"session_id": s_id, "selected_option": "marathi"})
    # Consent
    client.post("/api/chat", json={"session_id": s_id, "selected_option": "consent_yes"})
    # Chief complaint
    res = client.post("/api/chat", json={"session_id": s_id, "message": "मला पोटात जळजळ आणि आंबट ढेकर येत आहेत"})
    
    assert res.json()["clinical_data"]["chief_complaint"] == "acidity / indigestion"
    assert res.json()["current_phase"] == "ayurveda_dashavidha"
