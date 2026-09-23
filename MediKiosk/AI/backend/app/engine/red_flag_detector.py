from typing import List, Dict, Any, Tuple, Optional
from app.models.schemas import ClinicalData, RedFlagDetail, ChatMessage

# Red Flag Rules and Patterns
RED_FLAG_PATTERNS: List[Dict[str, Any]] = [
    {
        "id": "cardiac_emergency",
        "name": "Possible Acute Coronary Syndrome / Cardiac Event",
        "urgency": "CRITICAL",
        "keywords": [
            "chest pain", "crushing", "heavy pressure on chest", "radiating to arm", "radiating to left arm",
            "radiating to jaw", "radiating to neck", "radiating to back", "chest tightness", "chest squeezing",
            "छाती में दर्द", "बाएं हाथ में दर्द", "जबड़े में दर्द", "छातीत दुखणे", "डाव्या हाताकडे दुखणे",
            "நெஞ்சு வலி", "বুকে তীব্র ব্যথা", "છાતીમાં દુખાવો"
        ],
        "radiation_targets": ["left arm", "arm", "shoulder", "jaw", "neck", "back"],
        "description": "Chest pain with potential radiation or severe pressure indicative of acute cardiac ischemia.",
        "recommended_action": "Immediate ECG, cardiac triage, and emergency physician evaluation."
    },
    {
        "id": "stroke_symptoms",
        "name": "Possible Stroke / Acute Neurological Deficit",
        "urgency": "CRITICAL",
        "keywords": [
            "paralysis", "sudden weakness", "one sided weakness", "facial drooping", "slurred speech",
            "unable to speak", "loss of speech", "mouth twisted", "लकवा", "चेहरे का लटकना", "आवाज लड़खड़ाना",
            "पक्षाघात", "तोंड वाकडे होणे", "बोलता न येणे"
        ],
        "description": "Signs of acute focal neurological deficit matching FAST stroke criteria.",
        "recommended_action": "Immediate Code Stroke activation, urgent non-contrast CT head, and stroke team notification."
    },
    {
        "id": "respiratory_distress",
        "name": "Severe Acute Respiratory Distress",
        "urgency": "CRITICAL",
        "keywords": [
            "cannot breathe", "severe difficulty breathing", "gasping for air", "turning blue", "choking",
            "suffocating", "severe asthma attack", "सांस बिल्कुल नहीं आ रही", "दम घुट रहा है",
            "श्वास घेता येत नाही", "दम भरणे"
        ],
        "description": "Acute respiratory compromise requiring immediate airway and oxygenation support.",
        "recommended_action": "Immediate supplemental high-flow oxygen, SpO2 monitoring, and airway assessment."
    },
    {
        "id": "anaphylaxis",
        "name": "Severe Allergic Reaction / Anaphylaxis",
        "urgency": "CRITICAL",
        "keywords": [
            "throat swelling", "swelling in throat", "tongue swollen", "lip swelling", "cannot swallow",
            "severe allergy with breathing difficulty", "गले में सूजन", "जीभ में सूजन", "घशात सूज",
            "श्वास रोखणे"
        ],
        "description": "Airway compromise and systemic anaphylaxis symptoms.",
        "recommended_action": "Immediate IM Epinephrine readiness, airway protection, and emergency resuscitation."
    },
    {
        "id": "thunderclap_headache",
        "name": "Thunderclap Headache / Possible SAH",
        "urgency": "CRITICAL",
        "keywords": [
            "worst headache of life", "sudden severe headache", "thunderclap", "head exploded",
            "stiff neck with fever and headache", "अचानक भयंकर सिरदर्द", "जिंदगी का सबसे तेज सिरदर्द",
            "अचानक अतिशय तीव्र डोकेदुखी"
        ],
        "description": "Sudden peak-intensity headache raising concern for subarachnoid hemorrhage or acute intracranial pathology.",
        "recommended_action": "Urgent emergency medical evaluation and neuroimaging."
    },
    {
        "id": "severe_hemorrhage",
        "name": "Severe Bleeding / Gastrointestinal Hemorrhage",
        "urgency": "CRITICAL",
        "keywords": [
            "vomiting blood", "throwing up blood", "coughing up blood", "black tarry stool", "uncontrolled bleeding",
            "खून की उल्टी", "उल्टी में खून", "काले रंग का मल", "रक्ताची उलटी", "रक्तस्राव"
        ],
        "description": "Active significant gastrointestinal bleeding or hemorrhage.",
        "recommended_action": "Urgent IV access, hemodynamic stabilization, and urgent blood group/crossmatch."
    },
    {
        "id": "loss_of_consciousness",
        "name": "Syncope / Loss of Consciousness / Seizure",
        "urgency": "CRITICAL",
        "keywords": [
            "fainted", "loss of consciousness", "passed out", "blacked out", "seizure", "convulsions",
            "बेहोश हो गया", "बेहोशी", "दौरा पड़ा", "मिरगी", "शुद्ध हरपणे", "फिट येणे"
        ],
        "description": "Transient or ongoing loss of consciousness, syncope, or seizure activity.",
        "recommended_action": "Vital signs check, blood glucose assessment, cardiac monitoring, and neurological evaluation."
    },
    {
        "id": "acute_abdomen",
        "name": "Possible Acute Surgical Abdomen",
        "urgency": "URGENT",
        "keywords": [
            "severe abdominal pain unable to stand", "board like abdomen", "stomach rock hard",
            "severe pain in lower right side", "rigid abdomen", "पेट में असहनीय दर्द", "पोटात प्रचंड वेदना"
        ],
        "description": "Severe localized abdominal tenderness with potential peritoneal signs.",
        "recommended_action": "Urgent surgical consultation, abdominal ultrasound/CT, and NPO status."
    }
]

class RedFlagDetector:
    """Dedicated clinical safety layer for real-time symptom risk assessment."""

    @staticmethod
    def evaluate(clinical_data: ClinicalData, latest_text: str = "") -> Tuple[bool, List[RedFlagDetail]]:
        detected_flags: List[RedFlagDetail] = []
        combined_text = (
            f"{clinical_data.chief_complaint or ''} "
            f"{clinical_data.symptom or ''} "
            f"{clinical_data.site or ''} "
            f"{clinical_data.character or ''} "
            f"{clinical_data.radiation or ''} "
            f"{' '.join(clinical_data.associated_symptoms)} "
            f"{' '.join(clinical_data.patient_own_words)} "
            f"{latest_text or ''}"
        ).lower()

        # Check explicit rules
        for pattern in RED_FLAG_PATTERNS:
            is_matched = False
            # Check keywords
            for kw in pattern["keywords"]:
                if kw in combined_text:
                    is_matched = True
                    break
            
            # Special check for chest pain + radiation
            if not is_matched and "chest" in combined_text and ("pain" in combined_text or "tight" in combined_text):
                if clinical_data.radiation:
                    rad_lower = clinical_data.radiation.lower()
                    if any(target in rad_lower for target in pattern.get("radiation_targets", [])):
                        is_matched = True
                if clinical_data.severity and clinical_data.severity >= 8:
                    is_matched = True

            # Special check for severe pain (9 or 10) + acute onset
            if not is_matched and clinical_data.severity and clinical_data.severity >= 9:
                if any(w in combined_text for w in ["sudden", "severe", "unbearable", "अचानक", "असहनीय"]):
                    detected_flags.append(RedFlagDetail(
                        flag_name=f"High Severity Alert (Score {clinical_data.severity}/10)",
                        description=f"Patient reported acute peak-level severity ({clinical_data.severity}/10).",
                        urgency="URGENT",
                        recommended_action="Expedited clinical evaluation and pain assessment."
                    ))

            if is_matched:
                detected_flags.append(RedFlagDetail(
                    flag_name=pattern["name"],
                    description=pattern["description"],
                    urgency=pattern["urgency"],
                    recommended_action=pattern["recommended_action"]
                ))

        # Deduplicate by flag_name
        unique_flags: List[RedFlagDetail] = []
        seen = set()
        for f in detected_flags:
            if f.flag_name not in seen:
                seen.add(f.flag_name)
                unique_flags.append(f)

        has_red_flags = len(unique_flags) > 0
        return has_red_flags, unique_flags

    @staticmethod
    def get_emergency_message(lang: str = "english", details: Optional[List[RedFlagDetail]] = None) -> str:
        """Generate safe, empathetic, non-diagnostic escalation message."""
        if lang == "hindi":
            return (
                "⚠️ महत्वपूर्ण सूचना: आपके द्वारा बताए गए लक्षणों के आधार पर आपको तत्काल चिकित्सा सहायता की आवश्यकता हो सकती है। "
                "कृपया बिना देरी किए तुरंत अस्पताल के आपातकालीन विभाग (Emergency Staff / Nurse Station) से संपर्क करें। "
                "आपकी अब तक की बातचीत और जानकारी डॉक्टर के लिए सुरक्षित कर ली गई है।"
            )
        elif lang == "marathi":
            return (
                "⚠️ महत्त्वाची सूचना: आपण दिलेल्या लक्षणांवरून आपल्याला तातडीने वैद्यकीय मदतीची आवश्यकता असू शकते. "
                "कृपया विलंब न करता तात्काळ रुग्णालयाच्या आपत्कालीन कक्षाशी (Emergency Staff) संपर्क साधा. "
                "आपली आतापर्यंत नोंदवलेली माहिती डॉक्टरांसाठी सुरक्षित ठेवण्यात आली आहे."
            )
        elif lang == "gujarati":
            return (
                "⚠️ મહત્વપૂર્ણ સૂચના: તમારા લક્ષણોના આધારે તમને તાત્કાલિક તબીબી સારવારની જરૂર પડી શકે છે. "
                "કૃપા કરીને વિલંબ કર્યા વિના તરત જ હોસ્પિટલના ઇમરજન્સી વિભાગનો સંપર્ક કરો. "
                "તમારી અત્યાર સુધીની માહિતી સુરક્ષિત કરી લેવામાં આવી છે."
            )
        elif lang == "tamil":
            return (
                "⚠️ அவசர எச்சரிக்கை: நீங்கள் தெரிவித்த அறிகுறிகளின் அடிப்படையில் உடனடி மருத்துவ சிகிச்சை தேவைப்படலாம். "
                "தயவுசெய்து தாமதமின்றி அவசர சிகிச்சைப் பிரிவை உடனடியாக அணுகவும். "
                "உங்கள் தகவல்கள் மருத்துவருக்காகப் பாதுகாக்கப்பட்டுள்ளது."
            )
        elif lang == "bengali":
            return (
                "⚠️ জরুরি সতর্কতা: আপনার লক্ষণগুলির উপর ভিত্তি করে অবিলম্বে চিকিৎসার প্রয়োজন হতে পারে। "
                "অনুগ্রহ করে দেরি না করে অবিলম্বে হাসপাতালের ইমার্জেন্সি বিভাগের সাথে যোগাযোগ করুন। "
                "আপনার দেওয়া তথ্য ডাক্তারের জন্য সংরক্ষিত করা হয়েছে।"
            )
        else:
            return (
                "⚠️ IMPORTANT SAFETY ALERT: Based on the symptoms reported, immediate medical evaluation may be required. "
                "Please notify the hospital emergency staff or proceed to the urgent care triage immediately. "
                "Your clinical history collected so far has been securely saved for the medical team."
            )
