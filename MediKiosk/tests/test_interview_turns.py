import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))
from services.gemini_service import gemini_engine

class TestInterviewTurnProgression(unittest.TestCase):
    def test_allopathy_turn_progression(self):
        history = [{"role": "ai", "content": "Welcome..."}]
        allo_steps = [
            ("Allopathy", "chief_complaint", 30),
            ("Abdominal Pain", "onset_duration", 55),
            ("2-3 Days Acute", "severity_character", 75),
            ("Moderate (5/10)", "aggravating_factors", 90),
            ("Worse with movement", "completed", 100)
        ]
        for step, expected_phase, expected_progress in allo_steps:
            history.append({"role": "patient", "content": step})
            turn = gemini_engine.generate_chat_turn(history, "allopathy", "hindi")
            self.assertEqual(turn["phase"], expected_phase)
            self.assertEqual(turn["progress"], expected_progress)
            history.append({"role": "ai", "content": turn["content"]})
        
        # Last turn must be completed
        self.assertTrue(turn["is_completed"])

    def test_ayurveda_turn_progression(self):
        history = [{"role": "ai", "content": "Welcome..."}]
        ayu_steps = [
            ("Ayurveda", "prakriti", 20),
            ("Kapha (कफ)", "vikriti", 30),
            ("Pitta Imbalance (अम्लपित्त)", "agni", 40),
            ("Mandagni (मंदाग्नि)", "koshtha", 50),
            ("Krura Koshtha (क्रूर कोष्ठ)", "sara", 60),
            ("Pravara Sara (प्रवर सार)", "samhanana", 70),
            ("Su-samhanana (सुसंहनन)", "sattva", 80),
            ("Pravara Sattva (प्रवर सत्त्व)", "satmya", 90),
            ("Sarva-satmya (सर्वसात्म्य)", "vyayama_vaya", 95),
            ("Uttama Stamina", "completed", 100)
        ]
        for step, expected_phase, expected_progress in ayu_steps:
            history.append({"role": "patient", "content": step})
            turn = gemini_engine.generate_chat_turn(history, "ayush", "hindi")
            self.assertEqual(turn["phase"], expected_phase)
            self.assertEqual(turn["progress"], expected_progress)
            history.append({"role": "ai", "content": turn["content"]})

        # Last turn must be completed
        self.assertTrue(turn["is_completed"])

if __name__ == "__main__":
    unittest.main()
