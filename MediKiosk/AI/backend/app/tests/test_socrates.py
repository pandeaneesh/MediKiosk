import pytest
from app.models.schemas import SessionState, SessionPhase, MedicalSystemEnum
from app.engine.socrates_engine import SocratesEngine

def test_socrates_initial_session():
    msg, session = SocratesEngine.create_initial_session("test-socrates-1", "english")
    assert session.session_id == "test-socrates-1"
    assert session.current_phase == SessionPhase.SELECT_SYSTEM
    assert len(msg.options) >= 2

def test_socrates_step_through():
    # 1. Start session
    _, session = SocratesEngine.create_initial_session("test-socrates-2", "english")
    
    # 2. Select Allopathy
    msg, session = SocratesEngine.process_message(session, selected_option="system_allopathy")
    assert session.medical_system == MedicalSystemEnum.ALLOPATHY
    assert session.current_phase == SessionPhase.LANGUAGE_SELECT

    # 3. Select Hindi
    msg, session = SocratesEngine.process_message(session, selected_option="hindi")
    assert session.language == "hindi"
    assert session.current_phase == SessionPhase.CONSENT

    # 4. Consent
    msg, session = SocratesEngine.process_message(session, selected_option="consent_yes")
    assert session.current_phase == SessionPhase.CHIEF_COMPLAINT

    # 5. Chief Complaint
    msg, session = SocratesEngine.process_message(session, message="मुझे छाती में दर्द हो रहा है")
    assert session.clinical_data.chief_complaint == "chest pain"
    assert session.current_phase == SessionPhase.SOCRATES_QUESTIONS

def test_socrates_rejects_unrelated_noise():
    _, session = SocratesEngine.create_initial_session("test-socrates-reject", "english")
    assert session.current_phase == SessionPhase.SELECT_SYSTEM

    # Unrelated speech / noise must NOT advance state
    msg, session = SocratesEngine.process_message(session, message="John Thomas")
    assert session.current_phase == SessionPhase.SELECT_SYSTEM
    assert "Please choose a medical approach" in msg.content or "Allopathy" in msg.content

    # Speaking valid system name advances state
    msg, session = SocratesEngine.process_message(session, message="I want Ayurveda")
    assert session.medical_system == MedicalSystemEnum.AYUSH
    assert session.current_phase == SessionPhase.LANGUAGE_SELECT
