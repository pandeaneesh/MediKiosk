import uuid
from typing import Tuple, Optional, List
from datetime import datetime, timezone
from app.models.schemas import (
    SessionState, SessionPhase, QuestionType, ChatMessage, QuickOption,
    DashavidhaParikshaData, MedicalSystemEnum
)
from app.engine.multilingual import AYURVEDA_QUESTIONS, DIALOG_TEXTS
from app.engine.summary_generator import SummaryGenerator

DASHAVIDHA_SEQUENCE = [
    "ayurveda_site",
    "ayurveda_severity",
    "ayurveda_prakriti_build",
    "ayurveda_prakriti_temp",
    "ayurveda_vikriti",
    "ayurveda_ahara_appetite",
    "ayurveda_ahara_postmeal",
    "ayurveda_satmya",
    "ayurveda_sattva",
    "ayurveda_vyayama",
    "ayurveda_sara",
    "ayurveda_samhanana",
    "ayurveda_vaya"
]

class AyurvedaEngine:
    """Dedicated state machine and clinical data parser for the Ayurvedic Dashavidha Pariksha pathway."""

    @staticmethod
    def get_first_question(session: SessionState) -> Tuple[ChatMessage, SessionState]:
        session.current_phase = SessionPhase.AYURVEDA_DASHAVIDHA
        session.current_question_key = DASHAVIDHA_SEQUENCE[0]
        session.progress_percentage = 20
        return AyurvedaEngine._generate_question_message(session, DASHAVIDHA_SEQUENCE[0])

    @staticmethod
    def process_response(session: SessionState, text: str, selected_option: Optional[str] = None) -> Tuple[ChatMessage, SessionState]:
        answer = selected_option or text
        clin = session.clinical_data
        if not clin.dashavidha_pariksha:
            clin.dashavidha_pariksha = DashavidhaParikshaData()
        dp = clin.dashavidha_pariksha
        lang = session.language or "english"

        # Record patient statement in own words
        if text and text not in clin.patient_own_words:
            clin.patient_own_words.append(text)

        curr_q = session.current_question_key or DASHAVIDHA_SEQUENCE[0]

        # 1. Parse current question answer into Dashavidha / Clinical fields
        if curr_q == "ayurveda_site":
            clin.site = answer
            session.slots_covered.append("site")
        elif curr_q == "ayurveda_severity":
            try:
                # Handle single digits or ratings
                val = int(''.join(filter(str.isdigit, answer)) or "5")
                clin.severity = max(0, min(10, val))
            except Exception:
                clin.severity = 5
            session.slots_covered.append("severity")
        elif curr_q == "ayurveda_prakriti_build":
            if not dp.prakriti:
                dp.prakriti = {}
            dp.prakriti["body_build"] = answer
            session.slots_covered.append("prakriti_build")
        elif curr_q == "ayurveda_prakriti_temp":
            if not dp.prakriti:
                dp.prakriti = {}
            dp.prakriti["temperature_preference"] = answer
            session.slots_covered.append("prakriti_temp")
        elif curr_q == "ayurveda_vikriti":
            if not dp.vikriti:
                dp.vikriti = {}
            dp.vikriti["recent_changes"] = [answer]
            session.slots_covered.append("vikriti")
        elif curr_q == "ayurveda_ahara_appetite":
            if not dp.ahara_shakti:
                dp.ahara_shakti = {}
            dp.ahara_shakti["appetite_level"] = answer
            session.slots_covered.append("ahara_appetite")
        elif curr_q == "ayurveda_ahara_postmeal":
            if not dp.ahara_shakti:
                dp.ahara_shakti = {}
            dp.ahara_shakti["post_meal"] = answer
            session.slots_covered.append("ahara_postmeal")
        elif curr_q == "ayurveda_satmya":
            dp.satmya = [answer]
            session.slots_covered.append("satmya")
        elif curr_q == "ayurveda_sattva":
            dp.satva = answer
            session.slots_covered.append("sattva")
        elif curr_q == "ayurveda_vyayama":
            dp.vyayama_shakti = answer
            session.slots_covered.append("vyayama")
        elif curr_q == "ayurveda_sara":
            dp.sara = answer
            session.slots_covered.append("sara")
        elif curr_q == "ayurveda_samhanana":
            dp.samhanana = answer
            session.slots_covered.append("samhanana")
        elif curr_q == "ayurveda_vaya":
            dp.vaya = answer
            session.slots_covered.append("vaya")

        # 2. Determine next question / phase
        if curr_q in DASHAVIDHA_SEQUENCE:
            idx = DASHAVIDHA_SEQUENCE.index(curr_q)
            if idx + 1 < len(DASHAVIDHA_SEQUENCE):
                next_q = DASHAVIDHA_SEQUENCE[idx + 1]
                session.current_question_key = next_q
                session.progress_percentage = 20 + int(((idx + 1) / len(DASHAVIDHA_SEQUENCE)) * 50)
                return AyurvedaEngine._generate_question_message(session, next_q)
            else:
                # Move to medical history phase
                session.current_phase = SessionPhase.MEDICAL_HISTORY
                session.current_question_key = "medical_history"
                session.progress_percentage = 75
                msg = AyurvedaEngine._create_phase_message(
                    session,
                    DIALOG_TEXTS.get(lang, DIALOG_TEXTS["english"])["medical_history"],
                    QuestionType.MULTI_CHOICE,
                    [
                        QuickOption(label="None of these", value="None of these", subtitle="कोई पुरानी बीमारी नहीं"),
                        QuickOption(label="Diabetes / Prameha", value="Diabetes Mellitus", subtitle="मधुमेह"),
                        QuickOption(label="Hypertension / High BP", value="Hypertension", subtitle="उच्च रक्तचाप"),
                        QuickOption(label="Asthma / Shwasa", value="Asthma", subtitle="दमा / श्वास"),
                        QuickOption(label="Joint Arthritis / Sandhivata", value="Sandhivata", subtitle="संधिवात")
                    ]
                )
                session.messages.append(msg)
                return msg, session

        # Handle post-Dashavidha general clinical history
        if session.current_phase == SessionPhase.MEDICAL_HISTORY:
            if answer and "none" not in answer.lower():
                clin.medical_history = [s.strip() for s in answer.split(",") if s.strip()]
            else:
                clin.medical_history = []
            session.slots_covered.append("medical_history")
            session.current_phase = SessionPhase.MEDICATION_HISTORY
            session.current_question_key = "medication_history"
            session.progress_percentage = 85
            msg = AyurvedaEngine._create_phase_message(
                session,
                DIALOG_TEXTS.get(lang, DIALOG_TEXTS["english"])["medication_history"],
                QuestionType.SINGLE_CHOICE,
                [
                    QuickOption(label="No", value="No", subtitle="No daily medications"),
                    QuickOption(label="Yes, Taking Allopathic medicines", value="Taking Allopathic medicines"),
                    QuickOption(label="Yes, Taking Ayurvedic medicines/formulations", value="Taking Ayurvedic formulations")
                ]
            )
            session.messages.append(msg)
            return msg, session

        if session.current_phase == SessionPhase.MEDICATION_HISTORY:
            if answer and answer.lower() not in ["no", "none", "नहीं", "नाही"]:
                clin.medication_history = [answer]
            else:
                clin.medication_history = []
            session.slots_covered.append("medication_history")
            session.current_phase = SessionPhase.ALLERGIES
            session.current_question_key = "allergies"
            session.progress_percentage = 92
            msg = AyurvedaEngine._create_phase_message(
                session,
                DIALOG_TEXTS.get(lang, DIALOG_TEXTS["english"])["allergies"],
                QuestionType.SINGLE_CHOICE,
                [
                    QuickOption(label="No (No known allergies)", value="No (No known allergies)", subtitle="कोई ज्ञात एलर्जी नहीं"),
                    QuickOption(label="Yes, Drug allergy", value="Drug allergy (e.g. Penicillin, Sulfa)"),
                    QuickOption(label="Yes, Food allergy", value="Food allergy (e.g. Nuts, Lactose, Gluten)")
                ]
            )
            session.messages.append(msg)
            return msg, session

        if session.current_phase == SessionPhase.ALLERGIES:
            if answer and "no known" not in answer.lower() and answer.lower() != "no":
                clin.allergies = [answer]
            else:
                clin.allergies = []
            session.slots_covered.append("allergies")
            session.current_phase = SessionPhase.REVIEW_CONFIRMATION
            session.current_question_key = "review_confirmation"
            session.progress_percentage = 97
            msg = AyurvedaEngine._create_phase_message(
                session,
                DIALOG_TEXTS.get(lang, DIALOG_TEXTS["english"])["review_confirmation"],
                QuestionType.CONFIRMATION,
                [
                    QuickOption(label="Looks Correct • Confirm Summary", value="looks_correct", icon="✓"),
                    QuickOption(label="Need to Edit Details", value="edit_summary", icon="✎")
                ]
            )
            session.messages.append(msg)
            return msg, session

        if session.current_phase == SessionPhase.REVIEW_CONFIRMATION:
            if answer in ["looks_correct", "Looks correct", "confirm", "yes", "हाँ", "होय"]:
                session.current_phase = SessionPhase.COMPLETED
                session.is_completed = True
                session.progress_percentage = 100
                session.doctor_summary = SummaryGenerator.generate_summary(session)
                msg = AyurvedaEngine._create_phase_message(
                    session,
                    DIALOG_TEXTS.get(lang, DIALOG_TEXTS["english"])["completed"],
                    QuestionType.OPEN_TEXT,
                    []
                )
                session.messages.append(msg)
                return msg, session

        # Fallback question if state reached end
        return AyurvedaEngine._generate_question_message(session, DASHAVIDHA_SEQUENCE[0])

    @staticmethod
    def _generate_question_message(session: SessionState, q_key: str) -> Tuple[ChatMessage, SessionState]:
        q_data = AYURVEDA_QUESTIONS.get(q_key, {})
        lang = session.language or "english"
        texts = q_data.get("text", {})
        content = texts.get(lang) or texts.get("english") or "Please provide additional details:"
        options = q_data.get("options", [])
        q_type = q_data.get("type", QuestionType.SINGLE_CHOICE)

        msg = ChatMessage(
            id=str(uuid.uuid4()),
            role="ai",
            content=content,
            options=options,
            question_type=q_type,
            language=lang
        )
        session.messages.append(msg)
        return msg, session

    @staticmethod
    def _create_phase_message(session: SessionState, content: str, q_type: QuestionType, options: List[QuickOption]) -> ChatMessage:
        return ChatMessage(
            id=str(uuid.uuid4()),
            role="ai",
            content=content,
            options=options,
            question_type=q_type,
            language=session.language or "english"
        )
