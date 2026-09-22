import uuid
from typing import Tuple, Optional, List
from datetime import datetime, timezone
from app.models.schemas import (
    SessionState, SessionPhase, QuestionType, ChatMessage, QuickOption,
    MedicalSystemEnum, ClinicalData, RedFlagDetail
)
from app.engine.multilingual import (
    SYSTEM_SELECT_OPTIONS, LANGUAGE_OPTIONS, CONSENT_OPTIONS,
    DIALOG_TEXTS, normalize_chief_complaint
)
from app.engine.red_flag_detector import RedFlagDetector
from app.engine.ayurveda_engine import AyurvedaEngine
from app.engine.summary_generator import SummaryGenerator

SOCRATES_STEPS = [
    "socrates_site",
    "socrates_onset",
    "socrates_character",
    "socrates_radiation",
    "socrates_associated",
    "socrates_timing",
    "socrates_aggravating",
    "socrates_severity"
]

class SocratesEngine:
    """Core state machine coordinator for Allopathy SOCRATES pathways, language/consent negotiation, and red flag safety."""

    @staticmethod
    def create_initial_session(session_id: str, language: str = "english") -> Tuple[ChatMessage, SessionState]:
        session = SessionState(
            session_id=session_id,
            language=language,
            current_phase=SessionPhase.SELECT_SYSTEM,
            current_question_key="system_select",
            progress_percentage=5
        )

        msg = ChatMessage(
            id=str(uuid.uuid4()),
            role="ai",
            content=DIALOG_TEXTS["english"]["welcome_system"],
            options=SYSTEM_SELECT_OPTIONS,
            question_type=QuestionType.SYSTEM_SELECT,
            language=language
        )
        session.messages.append(msg)
        return msg, session

    @staticmethod
    def process_message(
        session: SessionState,
        message: str = "",
        selected_option: Optional[str] = None
    ) -> Tuple[ChatMessage, SessionState]:
        lang = session.language or "english"
        opt = selected_option or ""
        text = message or ""
        answer = opt or text

        # Record patient statement in own words
        if text and text not in session.clinical_data.patient_own_words:
            session.clinical_data.patient_own_words.append(text)

        # 1. Check for emergency red flags on every input
        has_flag, detected_flags = RedFlagDetector.evaluate(session.clinical_data, f"{text} {opt}")
        if has_flag:
            for flag in detected_flags:
                if not any(f.flag_name == flag.flag_name for f in session.red_flags):
                    session.red_flags.append(flag)
                    if flag.flag_name not in session.clinical_data.red_flags:
                        session.clinical_data.red_flags.append(flag.flag_name)

        # 2. State Machine Transition Dispatcher
        phase = session.current_phase

        # PHASE: SELECT_SYSTEM
        if phase == SessionPhase.SELECT_SYSTEM or opt.startswith("system_"):
            clean_input = f"{opt} {text}".lower().strip()

            ayush_keywords = [
                "system_ayush", "ayush", "ayurveda", "ayurvedic", "traditional", "herbal",
                "आयुर्वेद", "आयुष", "दशविध", "ஆயுர்வேதம்", "ఆయుర్వేదం", "ಆಯುರ್ವೇದ",
                "ആയുർവേദം", "આયુર્વેદ", "আয়ুর্বেদ", "ਆਯੁਰਵੇਦ", "ଓଡ଼ିଆ ଆୟୁର୍ବେଦ", "অসমীয়া আয়ুর্বেদ"
            ]
            allopathy_keywords = [
                "system_allopathy", "allopathy", "allopathic", "modern", "western", "medicine", "socrates",
                "एलोपैथी", "आधुनिक चिकित्सा", "অ্যালোপ্যাথি", "அலோபதி", "అలోపతి", "ಅಲೋಪತಿ",
                "അലോപ്പതി", "અલોપથી", "ਐਲੋਪੈਥੀ"
            ]

            is_ayush = any(k in clean_input for k in ayush_keywords)
            is_allopathy = any(k in clean_input for k in allopathy_keywords)

            if not is_ayush and not is_allopathy:
                msg = ChatMessage(
                    id=str(uuid.uuid4()),
                    role="ai",
                    content="Please choose a medical approach: select 'Allopathy' for modern medicine or 'AYUSH' for Ayurveda / कृपया चिकित्सा पद्धति का चयन करें (एलोपैथी या आयुर्वेद):",
                    options=SYSTEM_SELECT_OPTIONS,
                    question_type=QuestionType.SYSTEM_SELECT,
                    language=lang
                )
                session.messages.append(msg)
                return msg, session

            if is_ayush:
                session.medical_system = MedicalSystemEnum.AYUSH
                session.system_type = "ayush"
            else:
                session.medical_system = MedicalSystemEnum.ALLOPATHY
                session.system_type = "allopathy"

            session.current_phase = SessionPhase.LANGUAGE_SELECT
            session.current_question_key = "language_select"
            session.progress_percentage = 10
            msg = ChatMessage(
                id=str(uuid.uuid4()),
                role="ai",
                content=DIALOG_TEXTS.get(lang, DIALOG_TEXTS["english"])["select_lang"],
                options=LANGUAGE_OPTIONS,
                question_type=QuestionType.LANGUAGE_SELECT,
                language=lang
            )
            session.messages.append(msg)
            return msg, session

        # PHASE: LANGUAGE_SELECT
        if phase == SessionPhase.LANGUAGE_SELECT:
            clean_input = f"{opt} {text}".lower().strip()

            lang_match_map = {
                "english": ["english", "en", "angrezi", "अंग्रेजी"],
                "hindi": ["hindi", "hi", "हिन्दी", "हिंदी"],
                "marathi": ["marathi", "mr", "मराठी"],
                "gujarati": ["gujarati", "gu", "ગુજરાતી", "गुजराती"],
                "tamil": ["tamil", "ta", "தமிழ்", "तमिल"],
                "telugu": ["telugu", "te", "తెలుగు", "तेलुगु"],
                "kannada": ["kannada", "kn", "ಕನ್ನಡ", "कन्नड़"],
                "malayalam": ["malayalam", "ml", "മലയാളം", "मलयालम"],
                "bengali": ["bengali", "bangla", "bn", "বাংলা", "बंगाली"],
                "punjabi": ["punjabi", "pa", "ਪੰਜਾਬੀ", "पंजाबी"],
                "odia": ["odia", "oriya", "or", "ଓଡ଼ିଆ", "उड़िया"],
                "assamese": ["assamese", "as", "অসমীয়া", "असमिया"],
                "urdu": ["urdu", "ur", "اردو", "उर्दू"]
            }

            chosen_lang = None
            for lang_key, keywords in lang_match_map.items():
                if any(k in clean_input for k in keywords):
                    chosen_lang = lang_key
                    break

            if not chosen_lang:
                msg = ChatMessage(
                    id=str(uuid.uuid4()),
                    role="ai",
                    content="Please choose your preferred language from the options below / कृपया अपनी भाषा चुनें:",
                    options=LANGUAGE_OPTIONS,
                    question_type=QuestionType.LANGUAGE_SELECT,
                    language=lang
                )
                session.messages.append(msg)
                return msg, session

            session.language = chosen_lang
            lang = chosen_lang
            session.current_phase = SessionPhase.CONSENT
            session.current_question_key = "consent"
            session.progress_percentage = 15
            msg = ChatMessage(
                id=str(uuid.uuid4()),
                role="ai",
                content=DIALOG_TEXTS.get(lang, DIALOG_TEXTS["english"])["consent"],
                options=CONSENT_OPTIONS.get(lang, CONSENT_OPTIONS["english"]),
                question_type=QuestionType.CONSENT,
                language=lang
            )
            session.messages.append(msg)
            return msg, session

        # PHASE: CONSENT
        if phase == SessionPhase.CONSENT:
            clean_input = f"{opt} {text}".lower().strip()
            no_keywords = [
                "consent_no", "no", "don't agree", "disagree", "refuse", "cancel",
                "नहीं", "नाही", "ના", "இல்லை", "లేదు", "ಇಲ್ಲ", "ഇല്ല", "না", "ਨਹੀਂ", "ନାହିଁ", "নহয়", "نہیں"
            ]
            yes_keywords = [
                "consent_yes", "yes", "agree", "proceed", "start", "begin", "ok", "okay", "sure",
                "हाँ", "हा", "होय", "सहमती", "હા", "ஆம்", "అవును", "ಹೌದು", "അതെ", "হ্যাঁ", "ਹਾਂ", "ହଁ", "হয়", "ہاں"
            ]

            is_no = any(k in clean_input for k in no_keywords)
            is_yes = any(k in clean_input for k in yes_keywords)

            if is_no:
                msg = ChatMessage(
                    id=str(uuid.uuid4()),
                    role="ai",
                    content="No problem. Please approach the hospital reception desk or nursing station for direct in-person assistance.",
                    options=[],
                    question_type=QuestionType.OPEN_TEXT,
                    language=lang
                )
                session.messages.append(msg)
                return msg, session

            if not is_yes:
                msg = ChatMessage(
                    id=str(uuid.uuid4()),
                    role="ai",
                    content=f"Please confirm: Do you agree to begin the intake interview? Say 'Yes' or select an option / {DIALOG_TEXTS.get(lang, DIALOG_TEXTS['english'])['consent']}",
                    options=CONSENT_OPTIONS.get(lang, CONSENT_OPTIONS["english"]),
                    question_type=QuestionType.CONSENT,
                    language=lang
                )
                session.messages.append(msg)
                return msg, session

            session.current_phase = SessionPhase.CHIEF_COMPLAINT
            session.current_question_key = "chief_complaint"
            session.progress_percentage = 20
            msg = ChatMessage(
                id=str(uuid.uuid4()),
                role="ai",
                content=DIALOG_TEXTS.get(lang, DIALOG_TEXTS["english"])["chief_complaint"],
                options=[
                    QuickOption(label="Stomach / Abdominal Pain", value="I have stomach pain", icon="🩺"),
                    QuickOption(label="Chest Pain / Discomfort", value="I have chest pain", icon="❤️"),
                    QuickOption(label="Joint Pain / Stiffness", value="I have severe joint pain", icon="🦴"),
                    QuickOption(label="Acidity / Burning Reflux", value="I have severe burning in chest and sour belching after meals for 1 week", icon="🔥"),
                    QuickOption(label="Headache", value="I have a severe headache", icon="🧠"),
                    QuickOption(label="Fever / Chills", value="I have fever and chills", icon="🌡️")
                ],
                question_type=QuestionType.OPEN_TEXT,
                language=lang
            )
            session.messages.append(msg)
            return msg, session

        # PHASE: CHIEF_COMPLAINT
        if phase == SessionPhase.CHIEF_COMPLAINT:
            complaint_raw = (text or opt).strip()
            if len(complaint_raw) < 3 or complaint_raw.lower() in ["hi", "hello", "ok", "okay", "yes", "no", "hey"]:
                msg = ChatMessage(
                    id=str(uuid.uuid4()),
                    role="ai",
                    content="Please describe the primary symptoms or discomfort you are experiencing today (e.g. chest pain, stomach pain, fever, acidity) / कृपया अपने लक्षण या परेशानी बताएं:",
                    options=[
                        QuickOption(label="Stomach / Abdominal Pain", value="I have stomach pain", icon="🩺"),
                        QuickOption(label="Chest Pain / Discomfort", value="I have chest pain", icon="❤️"),
                        QuickOption(label="Joint Pain / Stiffness", value="I have severe joint pain", icon="🦴"),
                        QuickOption(label="Acidity / Burning Reflux", value="I have severe burning in chest and sour belching after meals for 1 week", icon="🔥"),
                        QuickOption(label="Headache", value="I have a severe headache", icon="🧠"),
                        QuickOption(label="Fever / Chills", value="I have fever and chills", icon="🌡️")
                    ],
                    question_type=QuestionType.OPEN_TEXT,
                    language=lang
                )
                session.messages.append(msg)
                return msg, session

            normalized = normalize_chief_complaint(complaint_raw)
            session.clinical_data.chief_complaint = normalized
            session.clinical_data.symptom = normalized
            session.slots_covered.append("chief_complaint")

            # Route to appropriate medical pathway
            if session.medical_system == MedicalSystemEnum.AYUSH or session.system_type == "ayush":
                return AyurvedaEngine.get_first_question(session)
            else:
                # Allopathy SOCRATES Entry
                session.current_phase = SessionPhase.SOCRATES_QUESTIONS
                session.current_question_key = "socrates_site"
                session.progress_percentage = 25
                msg = ChatMessage(
                    id=str(uuid.uuid4()),
                    role="ai",
                    content=DIALOG_TEXTS.get(lang, DIALOG_TEXTS["english"])["site"],
                    options=[
                        QuickOption(label="Chest / Center of chest", value="Chest / Center of chest"),
                        QuickOption(label="Upper abdomen / Stomach", value="Upper abdomen / Stomach"),
                        QuickOption(label="Lower abdomen / Pelvic area", value="Lower abdomen / Pelvic area"),
                        QuickOption(label="Head / Forehead", value="Head / Forehead"),
                        QuickOption(label="Knee / Joints", value="Knee / Joints"),
                        QuickOption(label="Back / Lower back", value="Back / Lower back")
                    ],
                    question_type=QuestionType.SINGLE_CHOICE,
                    language=lang
                )
                session.messages.append(msg)
                return msg, session

        # PHASE: AYURVEDA DASHAVIDHA
        if phase == SessionPhase.AYURVEDA_DASHAVIDHA:
            return AyurvedaEngine.process_response(session, text, opt)

        # PHASE: SOCRATES QUESTIONS
        if phase == SessionPhase.SOCRATES_QUESTIONS:
            return SocratesEngine._handle_socrates_progression(session, text, opt)

        # PHASE: MEDICAL_HISTORY
        if phase == SessionPhase.MEDICAL_HISTORY:
            if answer and "none" not in answer.lower():
                session.clinical_data.medical_history = [s.strip() for s in answer.split(",") if s.strip()]
            else:
                session.clinical_data.medical_history = []
            session.slots_covered.append("medical_history")

            session.current_phase = SessionPhase.MEDICATION_HISTORY
            session.current_question_key = "medication_history"
            session.progress_percentage = 85
            msg = ChatMessage(
                id=str(uuid.uuid4()),
                role="ai",
                content=DIALOG_TEXTS.get(lang, DIALOG_TEXTS["english"])["medication_history"],
                options=[
                    QuickOption(label="No regular medications", value="No"),
                    QuickOption(label="Blood pressure medicine (Amlodipine/Telmisartan)", value="Blood pressure medicine"),
                    QuickOption(label="Diabetes medicine (Metformin/Insulin)", value="Diabetes medicine"),
                    QuickOption(label="Thyroid tablet (Thyroxine)", value="Thyroid tablet")
                ],
                question_type=QuestionType.SINGLE_CHOICE,
                language=lang
            )
            session.messages.append(msg)
            return msg, session

        # PHASE: MEDICATION_HISTORY
        if phase == SessionPhase.MEDICATION_HISTORY:
            if answer and answer.lower() not in ["no", "none", "नहीं", "नाही", "no regular medications"]:
                session.clinical_data.medication_history = [answer]
            else:
                session.clinical_data.medication_history = []
            session.slots_covered.append("medication_history")

            session.current_phase = SessionPhase.ALLERGIES
            session.current_question_key = "allergies"
            session.progress_percentage = 92
            msg = ChatMessage(
                id=str(uuid.uuid4()),
                role="ai",
                content=DIALOG_TEXTS.get(lang, DIALOG_TEXTS["english"])["allergies"],
                options=[
                    QuickOption(label="No (No known allergies)", value="No (No known allergies)"),
                    QuickOption(label="Penicillin / Antibiotic allergy", value="Penicillin allergy"),
                    QuickOption(label="Sulfa / Painkiller allergy (NSAIDs)", value="NSAID painkiller allergy"),
                    QuickOption(label="Peanuts / Food allergy", value="Food allergy")
                ],
                question_type=QuestionType.SINGLE_CHOICE,
                language=lang
            )
            session.messages.append(msg)
            return msg, session

        # PHASE: ALLERGIES
        if phase == SessionPhase.ALLERGIES:
            if answer and "no known" not in answer.lower() and answer.lower() != "no":
                session.clinical_data.allergies = [answer]
            else:
                session.clinical_data.allergies = []
            session.slots_covered.append("allergies")

            session.current_phase = SessionPhase.REVIEW_CONFIRMATION
            session.current_question_key = "review_confirmation"
            session.progress_percentage = 97
            msg = ChatMessage(
                id=str(uuid.uuid4()),
                role="ai",
                content=DIALOG_TEXTS.get(lang, DIALOG_TEXTS["english"])["review_confirmation"],
                options=[
                    QuickOption(label="Looks Correct • Confirm Summary", value="looks_correct", icon="✓"),
                    QuickOption(label="Need to Edit Details", value="edit_summary", icon="✎")
                ],
                question_type=QuestionType.CONFIRMATION,
                language=lang
            )
            session.messages.append(msg)
            return msg, session

        # PHASE: REVIEW_CONFIRMATION
        if phase == SessionPhase.REVIEW_CONFIRMATION:
            if answer in ["looks_correct", "Looks correct", "confirm", "yes", "हाँ", "होय"]:
                session.current_phase = SessionPhase.COMPLETED
                session.is_completed = True
                session.progress_percentage = 100
                session.doctor_summary = SummaryGenerator.generate_summary(session)
                msg = ChatMessage(
                    id=str(uuid.uuid4()),
                    role="ai",
                    content=DIALOG_TEXTS.get(lang, DIALOG_TEXTS["english"])["completed"],
                    options=[],
                    question_type=QuestionType.OPEN_TEXT,
                    language=lang
                )
                session.messages.append(msg)
                return msg, session

        # Default fallback
        msg = ChatMessage(
            id=str(uuid.uuid4()),
            role="ai",
            content="Thank you. Please let me know if you would like to clarify any further symptoms.",
            options=[],
            question_type=QuestionType.OPEN_TEXT,
            language=lang
        )
        session.messages.append(msg)
        return msg, session

    @staticmethod
    def _handle_socrates_progression(session: SessionState, text: str, opt: str) -> Tuple[ChatMessage, SessionState]:
        answer = opt or text
        curr_q = session.current_question_key or "socrates_site"
        clin = session.clinical_data
        lang = session.language or "english"

        if curr_q == "socrates_site":
            clin.site = answer
            session.slots_covered.append("site")
            session.current_question_key = "socrates_onset"
            session.progress_percentage = 32
            msg = ChatMessage(
                id=str(uuid.uuid4()),
                role="ai",
                content=DIALOG_TEXTS.get(lang, DIALOG_TEXTS["english"])["onset"],
                options=[
                    QuickOption(label="Started today (Sudden onset)", value="Started today (Sudden onset)"),
                    QuickOption(label="Started 2–3 days ago", value="2-3 days ago"),
                    QuickOption(label="For about 1–2 weeks", value="1-2 weeks"),
                    QuickOption(label="Chronic / On and off for months", value="Chronic for months")
                ],
                question_type=QuestionType.SINGLE_CHOICE,
                language=lang
            )
            session.messages.append(msg)
            return msg, session

        elif curr_q == "socrates_onset":
            clin.onset = answer
            clin.duration = answer
            session.slots_covered.append("onset")
            session.current_question_key = "socrates_character"
            session.progress_percentage = 40
            msg = ChatMessage(
                id=str(uuid.uuid4()),
                role="ai",
                content=DIALOG_TEXTS.get(lang, DIALOG_TEXTS["english"])["character"],
                options=[
                    QuickOption(label="Sharp / Stabbing pain", value="Sharp / Stabbing"),
                    QuickOption(label="Dull / Aching pain", value="Dull / Aching"),
                    QuickOption(label="Burning sensation / Acidity", value="Burning / Acidity"),
                    QuickOption(label="Crushing / Heavy pressure", value="Crushing / Heavy pressure"),
                    QuickOption(label="Throbbing / Pulsating", value="Throbbing / Pulsating")
                ],
                question_type=QuestionType.SINGLE_CHOICE,
                language=lang
            )
            session.messages.append(msg)
            return msg, session

        elif curr_q == "socrates_character":
            clin.character = answer
            session.slots_covered.append("character")
            session.current_question_key = "socrates_radiation"
            session.progress_percentage = 48
            msg = ChatMessage(
                id=str(uuid.uuid4()),
                role="ai",
                content=DIALOG_TEXTS.get(lang, DIALOG_TEXTS["english"])["radiation"],
                options=[
                    QuickOption(label="No, Stays in one spot", value="No radiation (localized)"),
                    QuickOption(label="Spreads to Left Arm / Shoulder", value="Left Arm / Shoulder"),
                    QuickOption(label="Spreads to Back / Shoulder blades", value="Back / Shoulder blades"),
                    QuickOption(label="Spreads to Neck / Jaw", value="Neck / Jaw"),
                    QuickOption(label="Spreads down the leg", value="Down the leg (Sciatica)")
                ],
                question_type=QuestionType.SINGLE_CHOICE,
                language=lang
            )
            session.messages.append(msg)
            return msg, session

        elif curr_q == "socrates_radiation":
            clin.radiation = answer
            session.slots_covered.append("radiation")
            session.current_question_key = "socrates_associated"
            session.progress_percentage = 56
            msg = ChatMessage(
                id=str(uuid.uuid4()),
                role="ai",
                content=DIALOG_TEXTS.get(lang, DIALOG_TEXTS["english"])["associated"],
                options=[
                    QuickOption(label="None / Just the primary symptom", value="None"),
                    QuickOption(label="Nausea / Vomiting", value="Nausea / Vomiting"),
                    QuickOption(label="Fever / Chills", value="Fever / Chills"),
                    QuickOption(label="Dizziness / Sweating / Weakness", value="Dizziness / Sweating"),
                    QuickOption(label="Shortness of breath / Cough", value="Shortness of breath")
                ],
                question_type=QuestionType.MULTI_CHOICE,
                language=lang
            )
            session.messages.append(msg)
            return msg, session

        elif curr_q == "socrates_associated":
            if answer and answer.lower() != "none":
                clin.associated_symptoms = [s.strip() for s in answer.split(",") if s.strip()]
            else:
                clin.associated_symptoms = []
            session.slots_covered.append("associated")
            session.current_question_key = "socrates_timing"
            session.progress_percentage = 64
            msg = ChatMessage(
                id=str(uuid.uuid4()),
                role="ai",
                content=DIALOG_TEXTS.get(lang, DIALOG_TEXTS["english"])["timing"],
                options=[
                    QuickOption(label="Constant and continuous", value="Constant and continuous"),
                    QuickOption(label="Comes and goes in waves (Intermittent)", value="Intermittent / Waves"),
                    QuickOption(label="Worse in the morning", value="Worse in morning"),
                    QuickOption(label="Worse at night or after eating", value="Worse at night / after meals")
                ],
                question_type=QuestionType.SINGLE_CHOICE,
                language=lang
            )
            session.messages.append(msg)
            return msg, session

        elif curr_q == "socrates_timing":
            clin.timing = answer
            session.slots_covered.append("timing")
            session.current_question_key = "socrates_aggravating"
            session.progress_percentage = 70
            msg = ChatMessage(
                id=str(uuid.uuid4()),
                role="ai",
                content=DIALOG_TEXTS.get(lang, DIALOG_TEXTS["english"])["aggravating_relieving"],
                options=[
                    QuickOption(label="Worse with food / spicy meals", value="Worse with food / Better with antacid"),
                    QuickOption(label="Worse with physical movement / Better with rest", value="Worse with movement / Better with rest"),
                    QuickOption(label="Worse with stress / Better with sleep", value="Worse with stress"),
                    QuickOption(label="No specific trigger identified", value="No specific trigger")
                ],
                question_type=QuestionType.SINGLE_CHOICE,
                language=lang
            )
            session.messages.append(msg)
            return msg, session

        elif curr_q == "socrates_aggravating":
            clin.aggravating_factors = [answer]
            session.slots_covered.append("aggravating")
            session.current_question_key = "socrates_severity"
            session.progress_percentage = 75
            msg = ChatMessage(
                id=str(uuid.uuid4()),
                role="ai",
                content=DIALOG_TEXTS.get(lang, DIALOG_TEXTS["english"])["severity"],
                options=[],
                question_type=QuestionType.PAIN_SCALE,
                language=lang
            )
            session.messages.append(msg)
            return msg, session

        elif curr_q == "socrates_severity":
            try:
                val = int(''.join(filter(str.isdigit, answer)) or "5")
                clin.severity = max(0, min(10, val))
            except Exception:
                clin.severity = 5
            session.slots_covered.append("severity")

            # Move to past medical history
            session.current_phase = SessionPhase.MEDICAL_HISTORY
            session.current_question_key = "medical_history"
            session.progress_percentage = 80
            msg = ChatMessage(
                id=str(uuid.uuid4()),
                role="ai",
                content=DIALOG_TEXTS.get(lang, DIALOG_TEXTS["english"])["medical_history"],
                options=[
                    QuickOption(label="None of these", value="None of these"),
                    QuickOption(label="Diabetes / High Blood Sugar", value="Diabetes Mellitus"),
                    QuickOption(label="High Blood Pressure / Hypertension", value="Hypertension"),
                    QuickOption(label="Heart Disease / Prior Stent", value="Coronary Artery Disease"),
                    QuickOption(label="Asthma / Breathing issue", value="Asthma"),
                    QuickOption(label="Thyroid disorder", value="Hypothyroidism")
                ],
                question_type=QuestionType.MULTI_CHOICE,
                language=lang
            )
            session.messages.append(msg)
            return msg, session

        # Fallback
        return SocratesEngine.process_message(session, text, opt)
