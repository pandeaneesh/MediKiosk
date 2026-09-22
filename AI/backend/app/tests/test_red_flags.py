import pytest
from app.models.schemas import ClinicalData
from app.engine.red_flag_detector import RedFlagDetector

def test_chest_pain_radiating_to_arm():
    data = ClinicalData(
        chief_complaint="chest pain",
        radiation="Left Arm / Shoulder",
        severity=9
    )
    has_flag, flags = RedFlagDetector.evaluate(data, "crushing chest pain radiating to left arm")
    assert has_flag is True
    assert any("Cardiac" in f.flag_name or "High Severity" in f.flag_name for f in flags)
    assert any(f.urgency == "CRITICAL" for f in flags)

def test_stroke_fast_symptoms():
    data = ClinicalData(
        chief_complaint="facial drooping and slurred speech"
    )
    has_flag, flags = RedFlagDetector.evaluate(data, "facial drooping and unable to speak")
    assert has_flag is True
    assert any("Stroke" in f.flag_name for f in flags)

def test_anaphylaxis_detection():
    data = ClinicalData(
        chief_complaint="throat swelling after eating nuts"
    )
    has_flag, flags = RedFlagDetector.evaluate(data, "throat swelling cannot breathe")
    assert has_flag is True
    assert any("Anaphylaxis" in f.flag_name for f in flags)

def test_thunderclap_headache():
    data = ClinicalData(
        chief_complaint="worst headache of life",
        severity=10
    )
    has_flag, flags = RedFlagDetector.evaluate(data, "sudden severe worst headache of life")
    assert has_flag is True
    assert any("Thunderclap" in f.flag_name for f in flags)

def test_routine_mild_symptoms_no_false_flag():
    data = ClinicalData(
        chief_complaint="mild cold and runny nose",
        severity=2
    )
    has_flag, flags = RedFlagDetector.evaluate(data, "just a runny nose for two days")
    assert has_flag is False
    assert len(flags) == 0
