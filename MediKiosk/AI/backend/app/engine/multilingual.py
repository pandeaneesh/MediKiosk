from typing import Dict, Any, List, Optional
from app.models.schemas import QuickOption, QuestionType

SYSTEM_SELECT_OPTIONS = [
    QuickOption(
        label="Allopathy (Modern Medicine)",
        value="system_allopathy",
        subtitle="Standard clinical assessment & SOCRATES symptom analysis",
        icon="🩺"
    ),
    QuickOption(
        label="AYUSH (Ayurveda)",
        value="system_ayush",
        subtitle="Ayurvedic assessment & classical Dashavidha Pariksha",
        icon="🌿"
    )
]

LANGUAGE_OPTIONS = [
    QuickOption(label="English", value="english", subtitle="English", icon="🌐"),
    QuickOption(label="हिन्दी (Hindi)", value="hindi", subtitle="हिन्दी में जारी रखें", icon="🇮🇳"),
    QuickOption(label="मराठी (Marathi)", value="marathi", subtitle="मराठीत पुढे जा", icon="🚩"),
    QuickOption(label="ગુજરાતી (Gujarati)", value="gujarati", subtitle="ગુજરાતીમાં આગળ વધો", icon="🌸"),
    QuickOption(label="தமிழ் (Tamil)", value="tamil", subtitle="தமிழில் தொடரவும்", icon="🌿"),
    QuickOption(label="తెలుగు (Telugu)", value="telugu", subtitle="తెలుగులో కొనసాగించండి", icon="🌾"),
    QuickOption(label="ಕನ್ನಡ (Kannada)", value="kannada", subtitle="ಕನ್ನಡದಲ್ಲಿ ಮುಂದುವರಿಯಿರಿ", icon="🐘"),
    QuickOption(label="മലയാളം (Malayalam)", value="malayalam", subtitle="മലയാളത്തിൽ തുടരുക", icon="🌴"),
    QuickOption(label="বাংলা (Bengali)", value="bengali", subtitle="বাংলায় এগিয়ে যান", icon="🌊"),
    QuickOption(label="ਪੰਜਾਬੀ (Punjabi)", value="punjabi", subtitle="ਪੰਜਾਬੀ ਵਿੱਚ ਜਾਰੀ ਰੱਖੋ", icon="🌾"),
    QuickOption(label="ଓଡ଼ିଆ (Odia)", value="odia", subtitle="ଓଡ଼ିଆରେ ଆଗକୁ ବଢନ୍ତୁ", icon="🛕"),
    QuickOption(label="অসমীয়া (Assamese)", value="assamese", subtitle="অসমীয়াত আগবাঢ়ক", icon="🍃"),
    QuickOption(label="اردو (Urdu)", value="urdu", subtitle="اردو میں جاری رکھیں", icon="🌙")
]

CONSENT_OPTIONS: Dict[str, List[QuickOption]] = {
    "english": [
        QuickOption(label="Yes, I Agree & Begin", value="consent_yes", icon="✓"),
        QuickOption(label="No, Connect Me to Staff", value="consent_no", icon="✕")
    ],
    "hindi": [
        QuickOption(label="हाँ, मैं सहमत हूँ और शुरू करें", value="consent_yes", icon="✓"),
        QuickOption(label="नहीं, मुझे स्टाफ से मिलना है", value="consent_no", icon="✕")
    ],
    "marathi": [
        QuickOption(label="होय, मी सहमत आहे व सुरू करा", value="consent_yes", icon="✓"),
        QuickOption(label="नाही, मला कर्मचाऱ्यांशी बोलायचे आहे", value="consent_no", icon="✕")
    ],
    "gujarati": [
        QuickOption(label="હા, હું સંમત છું અને શરૂ કરો", value="consent_yes", icon="✓"),
        QuickOption(label="ના, મને સ્ટાફ સાથે મળાવો", value="consent_no", icon="✕")
    ],
    "tamil": [
        QuickOption(label="ஆம், நான் ஒப்புக்கொள்கிறேன்", value="consent_yes", icon="✓"),
        QuickOption(label="இல்லை, ஊழியரை அழைக்கவும்", value="consent_no", icon="✕")
    ],
    "telugu": [
        QuickOption(label="అవును, నేను అంగీకరిస్తున్నాను", value="consent_yes", icon="✓"),
        QuickOption(label="లేదు, సిబ్బందిని కలవాలి", value="consent_no", icon="✕")
    ],
    "kannada": [
        QuickOption(label="ಹೌದು, ನಾನು ಸಮ್ಮತಿಸುತ್ತೇನೆ", value="consent_yes", icon="✓"),
        QuickOption(label="ಇಲ್ಲ, ಸಿಬ್ಬಂದಿಯೊಂದಿಗೆ ಮಾತನಾಡಬೇಕು", value="consent_no", icon="✕")
    ],
    "malayalam": [
        QuickOption(label="അതെ, ഞാൻ സമ്മതിക്കുന്നു", value="consent_yes", icon="✓"),
        QuickOption(label="ഇല്ല, ജീവനക്കാരോട് സംസാരിക്കണം", value="consent_no", icon="✕")
    ],
    "bengali": [
        QuickOption(label="হ্যাঁ, আমি সম্মত ও শুরু করুন", value="consent_yes", icon="✓"),
        QuickOption(label="না, কর্মীদের সাথে কথা বলতে চাই", value="consent_no", icon="✕")
    ],
    "punjabi": [
        QuickOption(label="ਹਾਂ, ਮੈਂ ਸਹਿਮਤ ਹਾਂ ਅਤੇ ਸ਼ੁਰੂ ਕਰੋ", value="consent_yes", icon="✓"),
        QuickOption(label="ਨਹੀਂ, ਮੈਨੂੰ ਸਟਾਫ਼ ਨਾਲ ਮਿਲਣਾ ਹੈ", value="consent_no", icon="✕")
    ],
    "odia": [
        QuickOption(label="ହଁ, ମୁଁ ସହମତ ଏବଂ ଆରମ୍ଭ କରନ୍ତୁ", value="consent_yes", icon="✓"),
        QuickOption(label="ନାହିଁ, କର୍ମଚାରୀଙ୍କ ସହ କଥା ହେବାକୁ ଚାହେଁ", value="consent_no", icon="✕")
    ],
    "assamese": [
        QuickOption(label="হয়, মই সন্মত আৰু আৰম্ভ কৰক", value="consent_yes", icon="✓"),
        QuickOption(label="নহয়, কৰ্মচাৰীৰ সৈতে কথা পাতিব বিচাৰো", value="consent_no", icon="✕")
    ],
    "urdu": [
        QuickOption(label="ہاں، میں متفق ہوں اور شروع کریں", value="consent_yes", icon="✓"),
        QuickOption(label="نہیں، مجھے عملے سے ملنا ہے", value="consent_no", icon="✕")
    ]
}

DIALOG_TEXTS: Dict[str, Dict[str, str]] = {
    "english": {
        "welcome_system": "Welcome to MediKiosk. Please select your preferred medical system to begin the interview / चिकित्सा पद्धति का चयन करें:",
        "select_lang": "Please select your preferred language for the conversation:",
        "consent": "MediKiosk is an AI triage and history-taking assistant. It does not provide medical diagnoses or prescriptions. The information you provide will be securely compiled for your examining doctor. Do you consent to proceed?",
        "chief_complaint": "Please describe the main health issue or discomfort you are experiencing today in your own words:",
        "site": "Where specifically is this discomfort or symptom located in your body?",
        "onset": "When did this issue first start, and did it begin suddenly or gradually?",
        "character": "How would you describe the feeling or sensation (e.g. sharp, burning, dull, throbbing)?",
        "radiation": "Does this pain or discomfort spread or radiate to any other area (such as your arm, back, neck, or shoulder)?",
        "associated": "Are you experiencing any other related symptoms along with this (e.g. nausea, dizziness, fever, sweating)?",
        "timing": "How does the discomfort behave over time (is it constant, or does it come and go in waves)?",
        "aggravating_relieving": "Does anything specific make the symptom worse (like certain food, movement) or better (like rest or medicine)?",
        "severity": "On a scale from 0 (no pain) to 10 (worst possible unbearable pain), how severe is your discomfort right now?",
        "medical_history": "Do you have any existing long-term medical conditions (e.g. hypertension, diabetes, asthma, thyroid)?",
        "medication_history": "Are you currently taking any daily medicines, tablets, or Ayurvedic formulations?",
        "allergies": "Do you have any known allergies to medicines, foods, or other substances?",
        "review_confirmation": "Thank you. I have recorded your health summary. Please review the summary on screen. Does this information look accurate?",
        "completed": "Thank you! Your clinical summary has been compiled and transmitted to the doctor's consultation desk. Please take your seat in the waiting area."
    },
    "hindi": {
        "welcome_system": "मेडीकिओस्क (MediKiosk) में आपका स्वागत है। कृपया अपनी पसंदीदा चिकित्सा पद्धति का चयन करें:",
        "select_lang": "कृपया बातचीत के लिए अपनी पसंदीदा भाषा चुनें:",
        "consent": "मेडीकिओस्क एक एआई सहायक है जो आपकी स्वास्थ्य जानकारी एकत्रित कर डॉक्टर के लिए तैयार करता है। यह स्वयं दवा या अंतिम निदान नहीं देता है। क्या आप आगे बढ़ने के लिए सहमत हैं?",
        "chief_complaint": "कृपया अपने शब्दों में बताएं कि आज आपको क्या मुख्य समस्या या तकलीफ महसूस हो रही है:",
        "site": "यह तकलीफ या दर्द शरीर के किस हिस्से में हो रहा है?",
        "onset": "यह समस्या कब शुरू हुई, और क्या यह अचानक शुरू हुई या धीरे-धीरे?",
        "character": "इस दर्द या तकलीफ का अहसास कैसा है (जैसे जलन, चुभन, भारीपन, या मीठा दर्द)?",
        "radiation": "क्या यह दर्द शरीर के किसी अन्य हिस्से (जैसे कंधे, हाथ, पीठ या जबड़े) की तरफ फैलता है?",
        "associated": "क्या इसके साथ आपको अन्य लक्षण भी महसूस हो रहे हैं (जैसे उल्टी, चक्कर, पसीना, या बुखार)?",
        "timing": "यह दर्द समय के साथ कैसा रहता है (लगातार बना रहता है या आता-जाता है)?",
        "aggravating_relieving": "क्या किसी खास चीज से यह बढ़ता या घटता है (जैसे खाना खाने से, चलने से या आराम करने से)?",
        "severity": "0 (बिल्कुल दर्द नहीं) से 10 (असहनीय दर्द) के पैमाने पर आपका दर्द कितना तीव्र है?",
        "medical_history": "क्या आपको पहले से कोई पुरानी बीमारी है (जैसे बीपी, शुगर/डायबिटीज, थायराइड, अस्थमा)?",
        "medication_history": "क्या आप रोजाना कोई नियमित दवाइयां या आयुर्वेदिक औषधियां ले रहे हैं?",
        "allergies": "क्या आपको किसी दवा, खाने की चीज या अन्य वस्तु से कोई एलर्जी है?",
        "review_confirmation": "धन्यवाद। आपकी जानकारी सुरक्षित रूप से दर्ज कर ली गई है। कृपया स्क्रीन पर विवरण जांच लें। क्या यह जानकारी सही है?",
        "completed": "धन्यवाद! आपका स्वास्थ्य विवरण तैयार कर डॉक्टर के डेस्क पर भेज दिया गया है। कृपया प्रतीक्षालय में अपना स्थान ग्रहण करें।"
    },
    "marathi": {
        "welcome_system": "मेडीकिओस्क (MediKiosk) मध्ये आपले स्वागत आहे. कृपया आपली पसंतीची उपचार पद्धती निवडा:",
        "select_lang": "कृपया संभाषणासाठी आपली भाषा निवडा:",
        "consent": "मेडीकिओस्क हे एक एआई सहाय्यक आहे जे आपल्या लक्षणांची माहिती डॉक्टरांसाठी गोळा करते. हे स्वतः औषधोपचार किंवा निदान करत नाही. आपण पुढे जाण्यास सहमत आहात का?",
        "chief_complaint": "कृपया सांगा की आज आपल्याला नेमका काय त्रास किंवा समस्या होत आहे:",
        "site": "हा त्रास शरीराच्या नेमक्या कोणत्या भागात होत आहे?",
        "onset": "हा त्रास कधी सुरू झाला आणि तो अचानक सुरू झाला की हळूहळू?",
        "character": "या वेदनेचे किंवा त्रासाचे स्वरूप कसे आहे?",
        "radiation": "हा त्रास शरीराच्या इतर भागात (उदा. हात, पाठ, खांदा) पसरतो का?",
        "associated": "यासोबत आपल्याला इतर काही लक्षणे जाणवत आहेत का?",
        "timing": "हा त्रास सतत होतो की अधूनमधून येतो?",
        "aggravating_relieving": "विशिष्ट गोष्टीमुळे त्रास वाढतो किंवा कमी होतो का?",
        "severity": "० ते १० च्या प्रमाणात हा त्रास किती तीव्र आहे?",
        "medical_history": "आपल्याला पूर्वीचे काही जुने आजार आहेत का (उदा. मधुमेह, बीपी)?",
        "medication_history": "आपण सध्या काही नियमित औषधे घेत आहात का?",
        "allergies": "आपल्याला कोणत्याही औषधांची किंवा अन्नाची ॲलर्जी आहे का?",
        "review_confirmation": "धन्यवाद. आपली माहिती नोंदवली गेली आहे. कृपया ही माहिती तपासून घ्या.",
        "completed": "धन्यवाद! आपली माहिती डॉक्टरांकडे पाठवली आहे. कृपया प्रतीक्षालयात बसा."
    },
    "gujarati": {
        "welcome_system": "મેડીકિઓસ્ક (MediKiosk) માં આપનું સ્વાગત છે. કૃપા કરીને તમારી પસંદગીની તબીબી પદ્ધતિ પસંદ કરો:",
        "select_lang": "કૃપા કરીને વાતચીત માટે તમારી ભાષા પસંદ કરો:",
        "consent": "મેડીકિઓસ્ક એ એક AI સહાયક છે જે ડૉક્ટર માટે તમારી વિગતો એકત્રિત કરે છે. શું તમે આગળ વધવા સંમત છો?",
        "chief_complaint": "કૃપા કરીને જણાવો કે આજે તમને મુખ્ય કઈ તકલીફ થઈ રહી છે:",
        "site": "આ દુખાવો કે તકલીફ શરીરના કયા ભાગમાં થઈ રહી છે?",
        "onset": "આ તકલીફ ક્યારે શરૂ થઈ?",
        "character": "આ દુખાવાનો પ્રકાર કેવો છે?",
        "radiation": "શું આ દુખાવો શરીરના અન્ય કોઈ ભાગમાં ફેલાય છે?",
        "associated": "શું તેની સાથે અન્ય કોઈ લક્ષણો છે?",
        "timing": "આ તકલીફ સતત રહે છે કે આવ-જા કરે છે?",
        "aggravating_relieving": "શું કોઈ ચોક્કસ વસ્તુથી આમાં ફેરફાર થાય છે?",
        "severity": "૦ થી ૧૦ ના સ્કેલ પર તમારો દુખાવો કેટલો છે?",
        "medical_history": "શું તમને અગાઉની કોઈ બીમારી છે (ડાયાબિટીસ, બીપી)?",
        "medication_history": "શું તમે હાલમાં કોઈ નિયમિત દવા લો છો?",
        "allergies": "શું તમને કોઈ દવા કે વસ્તુની એલર્જી છે?",
        "review_confirmation": "આભાર. તમારી માહિતી નોંધાઈ ગઈ છે. કૃપા કરીને ચકાસો.",
        "completed": "આભાર! તમારી વિગતો ડૉક્ટર પાસે મોકલી દેવામાં આવી છે."
    },
    "tamil": {
        "welcome_system": "MediKiosk-க்கு உங்களை வரவேற்கிறோம். மருத்துவ முறையைத் தேர்ந்தெடுக்கவும்:",
        "select_lang": "உங்கள் விருப்ப மொழியைத் தேர்ந்தெடுக்கவும்:",
        "consent": "MediKiosk ஒரு AI உதவியாளர். உங்கள் விவரங்களை மருத்துவரிடம் ஒப்படைக்க சேகரிக்கிறோம். தொடர சம்மதமா?",
        "chief_complaint": "இன்று உங்களுக்கு உள்ள முக்கிய உடல்நலப் பிரச்சனையை விவரிக்கவும்:",
        "site": "இந்த வலி அல்லது உபாதை உடலின் எந்தப் பகுதியில் உள்ளது?",
        "onset": "இது எப்போது தொடங்கியது?",
        "character": "இந்த வலியின் தன்மை எப்படி உள்ளது?",
        "radiation": "இந்த வலி உடலின் பிற பகுதிகளுக்குப் பரவுகிறதா?",
        "associated": "இதனுடன் வேறு ஏதேனும் அறிகுறிகள் உள்ளதா?",
        "timing": "இந்த வலி தொடர்ந்து உள்ளதா அல்லது வந்து போகிறதா?",
        "aggravating_relieving": "எதுவும் செய்தால் வலி அதிகமாகிறதா அல்லது குறைகிறதா?",
        "severity": "0 முதல் 10 வரை உங்கள் வலி எவ்வளவு உள்ளது?",
        "medical_history": "உங்களுக்கு முந்தைய நீண்டகால நோய்கள் ஏதேனும் உள்ளதா?",
        "medication_history": "தினசரி மருந்துகள் ஏதேனும் எடுத்துக்கொள்கிறீர்களா?",
        "allergies": "உங்களுக்கு மருந்து அல்லது உணவு ஒவ்வாமை உள்ளதா?",
        "review_confirmation": "நன்றி. உங்கள் விவரங்கள் பதிவு செய்யப்பட்டுள்ளன. சரிபார்க்கவும்.",
        "completed": "நன்றி! உங்கள் மருத்துவச் சுருக்கம் மருத்துவருக்கு அனுப்பப்பட்டுள்ளது."
    },
    "telugu": {
        "welcome_system": "మెడికియోస్క్ (MediKiosk) కు స్వాగతం. దయచేసి మీ వైద్య విధానాన్ని ఎంచుకోండి:",
        "select_lang": "సంభాషణ కోసం మీ ప్రాధాన్య భాషను ఎంచుకోండి:",
        "consent": "మెడికియోస్క్ ఒక AI సహాయకుడు. డాక్టర్ కోసం మీ ఆరోగ్య వివరాలను సేకరిస్తుంది. కొనసాగించడానికి అంగీకరిస్తున్నారా?",
        "chief_complaint": "ఈరోజు మీకు ఉన్న ప్రధాన సమస్య లేదా అసౌకర్యాన్ని మీ మాటల్లో తెలపండి:",
        "site": "ఈ నొప్పి లేదా అసౌకర్యం శరీరంలో ఎక్కడ ఉంది?",
        "onset": "ఈ సమస్య ఎప్పుడు ప్రారంభమైంది?",
        "character": "ఈ నొప్పి స్వభావం ఎలా ఉంది?",
        "radiation": "ఈ నొప్పి శరీరంలోని ఇతర భాగాలకు వ్యాపిస్తుందా?",
        "associated": "దీనితో పాటు ఇతర లక్షణాలు ఏమైనా ఉన్నాయా?",
        "timing": "ఈ నొప్పి నిరంతరం ఉంటుందా లేదా వచ్చి పోతుంటుందా?",
        "aggravating_relieving": "ఏదైనా నిర్దిష్ట చర్యతో నొప్పి పెరుగుతుందా లేదా తగ్గుతుందా?",
        "severity": "0 నుండి 10 స్కేల్ పై మీ నొప్పి తీవ్రత ఎంత?",
        "medical_history": "మీకు ముందుగా ఉన్న దీర్ఘకాలిక వ్యాధులు ఏమైనా ఉన్నాయా (బీపీ, షుగర్)?",
        "medication_history": "మీరు రోజూ ఏదైనా మందులు వాడుతున్నారా?",
        "allergies": "మీకు ఏదైనా మందులు లేదా ఆహార అలెర్జీ ఉందా?",
        "review_confirmation": "ధన్యవాదాలు. మీ సమాచారం నమోదు చేయబడింది. దయచేసి తనిఖీ చేయండి.",
        "completed": "ధన్యవాదాలు! మీ నివేదిక డాక్టర్ వద్దకు పంపబడింది."
    },
    "kannada": {
        "welcome_system": "ಮೆಡಿಕಿಯೋಸ್ಕ್ (MediKiosk) ಗೆ ಸುಸ್ವಾಗತ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಚಿಕಿತ್ಸಾ ವಿಧಾನವನ್ನು ಆಯ್ಕೆಮಾಡಿ:",
        "select_lang": "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ:",
        "consent": "ಮೆಡಿಕಿಯೋಸ್ಕ್ ಒಂದು AI ಸಹಾಯಕ. ನಿಮ್ಮ ವಿವರಗಳನ್ನು ವೈದ್ಯರಿಗಾಗಿ ಸಂಗ್ರಹಿಸಲಾಗುತ್ತದೆ. ಮುಂದುವರಿಯಲು ಒಪ್ಪಿಗೆಯಿದೆಯೇ?",
        "chief_complaint": "ಇಂದು ನಿಮ್ಮ ಮುಖ್ಯ ಆರೋಗ್ಯ ಸಮಸ್ಯೆ ಅಥವಾ ತೊಂದರೆಯನ್ನು ನಿಮ್ಮ ಮಾತುಗಳಲ್ಲಿ ವಿವರಿಸಿ:",
        "site": "ಈ ನೋವು ಅಥವಾ ತೊಂದರೆ ದೇಹದ ಯಾವ ಭಾಗದಲ್ಲಿದೆ?",
        "onset": "ಈ ಸಮಸ್ಯೆ ಯಾವಾಗ ಪ್ರಾರಂಭವಾಯಿತು?",
        "character": "ಈ ನೋವಿನ ಸ್ವರೂಪ ಹೇಗಿದೆ?",
        "radiation": "ಈ ನೋವು ದೇಹದ ಇತರ ಭಾಗಗಳಿಗೆ ಹರಡುತ್ತದೆಯೇ?",
        "associated": "ಇದರೊಂದಿಗೆ ಬೇರೆ ಯಾವುದೇ ಲಕ್ಷಣಗಳಿವೆಯೇ?",
        "timing": "ಈ ನೋವು ನಿರಂತರವಾಗಿದೆಯೇ ಅಥವಾ ಬಂದು ಹೋಗುತ್ತದೆಯೇ?",
        "aggravating_relieving": "ಯಾವುದಾದರೂ ನಿರ್ದಿಷ್ಟ ಕ್ರಿಯೆಯಿಂದ ನೋವು ಹೆಚ್ಚುತ್ತದೆಯೇ ಅಥವಾ ಕಡಿಮೆಯಾಗುತ್ತದೆಯೇ?",
        "severity": "೦ ರಿಂದ ೧೦ ರ ಮಾಪಕದಲ್ಲಿ ನಿಮ್ಮ ನೋವಿನ ತೀವ್ರತೆ ಎಷ್ಟಿದೆ?",
        "medical_history": "ನಿಮಗೆ ಯಾವುದೇ ದೀರ್ಘಕಾಲದ ಕಾಯಿಲೆಗಳಿವೆಯೇ (ಬಿಪಿ, ಸಕ್ಕರೆ ಕಾಯಿಲೆ)?",
        "medication_history": "ನೀವು ಪ್ರಸ್ತುತ ಯಾವುದೇ ದೈನಂದಿನ ಔಷಧಿಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುತ್ತಿದ್ದೀರಾ?",
        "allergies": "ನಿಮಗೆ ಯಾವುದೇ ಔಷಧಿ ಅಥವಾ ಆಹಾರದ ಅಲರ್ಜಿ ಇದೆಯೇ?",
        "review_confirmation": "ಧನ್ಯವಾದಗಳು. ನಿಮ್ಮ ಮಾಹಿತಿ ದಾಖಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ.",
        "completed": "ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ವಿವರಗಳನ್ನು ವೈದ್ಯರಿಗೆ ಕಳುಹಿಸಲಾಗಿದೆ."
    },
    "malayalam": {
        "welcome_system": "മെഡികിയോസ്കിലേക്ക് (MediKiosk) സ്വാഗതം. നിങ്ങളുടെ ചികിത്സാ രീതി തിരഞ്ഞെടുക്കുക:",
        "select_lang": "സംഭാഷണത്തിനുള്ള ഭാഷ തിരഞ്ഞെടുക്കുക:",
        "consent": "മെഡികിയോസ്ക് ഒരു AI സഹായിയാണ്. വിവരങ്ങൾ ഡോക്ടർക്കായി തയ്യാറാക്കുന്നു. തുടരാൻ സമ്മതമാണോ?",
        "chief_complaint": "ഇന്ന് നിങ്ങൾ അനുഭവിക്കുന്ന പ്രധാന ആരോഗ്യപ്രശ്നം വിവരിക്കുക:",
        "site": "ഈ വേദന അല്ലെങ്കിൽ ബുദ്ധിമുട്ട് ശരീരത്തിൽ എവിടെയാണ്?",
        "onset": "ഇത് എപ്പോഴാണ് തുടങ്ങിയത്?",
        "character": "ഈ വേദനയുടെ സ്വഭാവം എങ്ങനെയുള്ളതാണ്?",
        "radiation": "ഈ വേദന ശരീരത്തിന്റെ മറ്റ് ഭാഗങ്ങളിലേക്ക് വ്യാപിക്കുന്നുണ്ടോ?",
        "associated": "ഇതിനൊപ്പം മറ്റ് ലക്ഷണങ്ങൾ എന്തെങ്കിലും ഉണ്ടോ?",
        "timing": "ഇത് തുടർച്ചയായി ഉണ്ടോ അതോ വന്നും പോയും ഇരിക്കുകയാണോ?",
        "aggravating_relieving": "എന്തെങ്കിലും ചെയ്യുമ്പോൾ വേദന കൂടുകയോ കുറയുകയോ ചെയ്യുന്നുണ്ടോ?",
        "severity": "0 മുതൽ 10 വരെയുള്ള സ്കെയിലിൽ വേദനയുടെ തീവ്രത എത്രയാണ്?",
        "medical_history": "നിങ്ങൾക്ക് മറ്റ് അസുഖങ്ങൾ വല്ലതും ഉണ്ടോ (പ്രമേഹം, പ്രഷർ)?",
        "medication_history": "നിങ്ങൾ സ്ഥിരമായി മരുന്നുകൾ കഴിക്കുന്നുണ്ടോ?",
        "allergies": "നിങ്ങൾക്ക് മരുന്നുകളോടോ ഭക്ഷണത്തോടോ അലർജി ഉണ്ടോ?",
        "review_confirmation": "നന്ദി. വിവരങ്ങൾ രേഖപ്പെടുത്തിയിട്ടുണ്ട്. ദയവായി പരിശോധിക്കുക.",
        "completed": "നന്ദി! നിങ്ങളുടെ ആരോഗ്യവിവരങ്ങൾ ഡോക്ടർക്ക് കൈമാറി."
    },
    "bengali": {
        "welcome_system": "MediKiosk-এ স্বাগতম। আপনার পছন্দের চিকিৎসা পদ্ধতি নির্বাচন করুন:",
        "select_lang": "কথা বলার জন্য আপনার ভাষা নির্বাচন করুন:",
        "consent": "MediKiosk একটি AI সহকারী যা ডাক্তারের জন্য আপনার স্বাস্থ্য বিবরণ সংগ্রহ করে। আপনি কি সম্মত আছেন?",
        "chief_complaint": "আজ আপনার কী শারীরিক সমস্যা হচ্ছে তা সংক্ষেপে বলুন:",
        "site": "এই সমস্যাটি শরীরের কোন অংশে হচ্ছে?",
        "onset": "এটি কখন শুরু হয়েছিল?",
        "character": "এই অনুভূতির ধরন কেমন?",
        "radiation": "এই ব্যথা কি শরীরের অন্য কোথাও ছড়িয়ে পড়ছে?",
        "associated": "এর সাথে অন্য কোনো উপসর্গ আছে কি?",
        "timing": "এটি কি সারাক্ষণ থাকে নাকি মাঝে মাঝে হয়?",
        "aggravating_relieving": "কিছু করলে কি এটি বাড়ে বা কমে?",
        "severity": "০ থেকে ১০ স্কেলে আপনার কষ্ট কতটা তীব্র?",
        "medical_history": "আপনার কি কোনো পুরনো রোগ আছে (যেমন ডায়াবেটিস, প্রেসার)?",
        "medication_history": "আপনি কি কোনো নিয়মিত ওষুধ খাচ্ছেন?",
        "allergies": "আপনার কোনো ওষুধ বা খাবারের অ্যালার্জি আছে কি?",
        "review_confirmation": "ধন্যবাদ। আপনার বিবরণ নথিভুক্ত হয়েছে। অনুগ্রহ করে দেখে নিন।",
        "completed": "ধন্যবাদ! আপনার স্বাস্থ্য বিবরণ ডাক্তারের কাছে পাঠানো হয়েছে।"
    },
    "punjabi": {
        "welcome_system": "ਮੈਡੀਕਿਓਸਕ (MediKiosk) ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਇਲਾਜ ਪ੍ਰਣਾਲੀ ਚੁਣੋ:",
        "select_lang": "ਗੱਲਬਾਤ ਲਈ ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ:",
        "consent": "ਮੈਡੀਕਿਓਸਕ ਇੱਕ AI ਸਹਾਇਕ ਹੈ ਜੋ ਡਾਕਟਰ ਲਈ ਜਾਣਕਾਰੀ ਇਕੱਠੀ ਕਰਦਾ ਹੈ। ਕੀ ਤੁਸੀਂ ਸਹਿਮਤ ਹੋ?",
        "chief_complaint": "ਕਿਰਪਾ ਕਰਕੇ ਦੱਸੋ ਕਿ ਅੱਜ ਤੁਹਾਨੂੰ ਮੁੱਖ ਤੌਰ 'ਤੇ ਕੀ ਤਕਲੀਫ ਹੈ:",
        "site": "ਇਹ ਦਰਦ ਜਾਂ ਤਕਲੀਫ ਸਰੀਰ ਦੇ ਕਿਸ ਹਿੱਸੇ ਵਿੱਚ ਹੈ?",
        "onset": "ਇਹ ਸਮੱਸਿਆ ਕਦੋਂ ਸ਼ੁਰੂ ਹੋਈ?",
        "character": "ਇਸ ਦਰਦ ਦਾ ਅਹਿਸਾਸ ਕਿਹੋ ਜਿਹਾ ਹੈ?",
        "radiation": "ਕੀ ਇਹ ਦਰਦ ਸਰੀਰ ਦੇ ਹੋਰ ਹਿੱਸਿਆਂ ਵਿੱਚ ਫੈਲਦਾ ਹੈ?",
        "associated": "ਕੀ ਇਸ ਨਾਲ ਕੋਈ ਹੋਰ ਲੱਛਣ ਵੀ ਹਨ?",
        "timing": "ਕੀ ਇਹ ਦਰਦ ਲਗਾਤਾਰ ਰਹਿੰਦਾ ਹੈ ਜਾਂ ਆਉਂਦਾ-ਜਾਂਦਾ ਹੈ?",
        "aggravating_relieving": "ਕੀ ਕਿਸੇ ਖਾਸ ਚੀਜ਼ ਨਾਲ ਇਹ ਵਧਦਾ ਜਾਂ ਘਟਦਾ ਹੈ?",
        "severity": "0 ਤੋਂ 10 ਦੇ ਪੈਮਾਨੇ 'ਤੇ ਤੁਹਾਡਾ ਦਰਦ ਕਿੰਨਾ ਹੈ?",
        "medical_history": "ਕੀ ਤੁਹਾਨੂੰ ਕੋਈ ਪੁਰਾਣੀ ਬਿਮਾਰੀ ਹੈ (ਜਿਵੇਂ ਸ਼ੂਗਰ, ਬੀ.ਪੀ.)?",
        "medication_history": "ਕੀ ਤੁਸੀਂ ਕੋਈ ਰੋਜ਼ਾਨਾ ਦਵਾਈਆਂ ਲੈ ਰਹੇ ਹੋ?",
        "allergies": "ਕੀ ਤੁਹਾਨੂੰ ਕਿਸੇ ਦਵਾਈ ਜਾਂ ਖਾਣ-ਪੀਣ ਤੋਂ ਐਲਰਜੀ ਹੈ?",
        "review_confirmation": "ਧੰਨਵਾਦ। ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਦਰਜ ਕਰ ਲਈ ਗਈ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਜਾਂਚ ਕਰੋ।",
        "completed": "ਧੰਨਵਾਦ! ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਡਾਕਟਰ ਨੂੰ ਭੇਜ ਦਿੱਤੀ ਗਈ ਹੈ।"
    },
    "odia": {
        "welcome_system": "ମେଡିକିଓସ୍କ (MediKiosk) କୁ ଆପଣଙ୍କୁ ସ୍ୱାଗତ। ଚିକିତ୍ସା ପଦ୍ଧତି ଚୟନ କରନ୍ତୁ:",
        "select_lang": "କଥାବାର୍ତ୍ତା ପାଇଁ ନିଜର ଭାଷା ଚୟନ କରନ୍ତୁ:",
        "consent": "ମେଡିକିଓସ୍କ ଏକ AI ସହାୟକ ଯାହା ଡାକ୍ତରଙ୍କ ପାଇଁ ତଥ୍ୟ ସଂଗ୍ରହ କରେ। ଆପଣ ଆଗକୁ ବଢିବାକୁ ସହମତ କି?",
        "chief_complaint": "ଆଜି ଆପଣଙ୍କର ମୁଖ୍ୟ ସ୍ୱାସ୍ଥ୍ୟ ସମସ୍ୟା କଣ ଅଛି କୁହନ୍ତୁ:",
        "site": "ଏହି ଯନ୍ତ୍ରଣା ଶରୀରର କେଉଁ ଅଂଶରେ ହେଉଛି?",
        "onset": "ଏହା କେବେଠାରୁ ଆରମ୍ଭ ହେଲା?",
        "character": "ଏହି ଯନ୍ତ୍ରଣାର ଅନୁଭୂତି କିପରି?",
        "radiation": "ଏହି ଯନ୍ତ୍ରଣା ଅନ୍ୟ ଅଂଶକୁ ବ୍ୟାପୁଛି କି?",
        "associated": "ଏହା ସହିତ ଅନ୍ୟ କୌଣସି ଲକ୍ଷଣ ଅଛି କି?",
        "timing": "ଏହା କ୍ରମାଗତ ଭାବରେ ହେଉଛି କି ଆସି ଯାଉଛି?",
        "aggravating_relieving": "କୌଣସି କାରଣରୁ ଏହା ବଢୁଛି କି କମୁଛି?",
        "severity": "୦ ରୁ ୧୦ ମାପରେ ଯନ୍ତ୍ରଣାର ତୀବ୍ରତା କେତେ?",
        "medical_history": "ଆପଣଙ୍କର ପୂର୍ବରୁ କୌଣସି ରୋଗ ଅଛି କି (ଡାଇବେଟିସ, ବିପି)?",
        "medication_history": "ଆପଣ ନିୟମିତ କୌଣସି ଔଷଧ ଖାଉଛନ୍ତି କି?",
        "allergies": "କୌଣସି ଔଷଧ ବା ଖାଦ୍ୟରୁ ଆଲର୍ଜି ଅଛି କି?",
        "review_confirmation": "ଧନ୍ୟବାଦ। ଆପଣଙ୍କ ତଥ୍ୟ ଲିପିବଦ୍ଧ ହୋଇଛି। ଦୟାକରି ଯାଞ୍ଚ କରନ୍ତୁ।",
        "completed": "ଧନ୍ୟବାଦ! ଆପଣଙ୍କ ବିବରଣୀ ଡାକ୍ତରଙ୍କ ନିକଟକୁ ପଠାଯାଇଛି।"
    },
    "assamese": {
        "welcome_system": "MediKiosk লৈ স্বাগতম। আপোনাৰ চিকিৎসা পদ্ধতি বাছক:",
        "select_lang": "কথা-বতৰাৰ বাবে ভাষা নিৰ্বাচন কৰক:",
        "consent": "MediKiosk হৈছে এটা AI সহায়ক যিয়ে ডাক্তৰৰ বাবে তথ্য সংগ্ৰহ কৰে। আপুনি সন্মত নেকি?",
        "chief_complaint": "আজি আপোনাৰ মূল স্বাস্থ্য সমস্যাটোৰ বিষয়ে কওক:",
        "site": "এই বিষ বা অসুবিধাটো শৰীৰৰ কোন অংশত হৈছে?",
        "onset": "এইটো কেতিয়া আৰম্ভ হৈছিল?",
        "character": "এই বিষৰ অনুভূতি কেনেকুৱা?",
        "radiation": "এই বিষ শৰীৰৰ আন অংশলৈ বিয়পি পৰে নেকি?",
        "associated": "ইয়াৰ লগত আন কিবা লক্ষণ দেখা দিছে নেকি?",
        "timing": "এইটো একেৰাহে থাকে নে আহি-গৈ থাকে?",
        "aggravating_relieving": "কোনো বিশেষ কাৰণত ই বৃদ্ধি বা হ্ৰাস পায় নেকি?",
        "severity": "০ ৰ পৰা ১০ ৰ স্কেলত আপোনাৰ বিষ কিমান তীব্ৰ?",
        "medical_history": "আপোনাৰ পূৰ্বৰ কোনো পুৰণি ৰোগ আছে নেকি?",
        "medication_history": "আপুনি নিয়মীয়াকৈ কোনো ঔষধ খাই আছে নেকি?",
        "allergies": "আপোনাৰ কোনো ঔষধ বা খাদ্যৰ এলাৰ্জী আছে নেকি?",
        "review_confirmation": "ধন্যবাদ। আপোনাৰ তথ্য সংৰক্ষণ কৰা হৈছে। অনুগ্ৰহ কৰি পৰীক্ষা কৰক।",
        "completed": "ধন্যবাদ! আপোনাৰ তথ্য ডাক্তৰলৈ প্ৰেৰণ কৰা হৈছে।"
    },
    "urdu": {
        "welcome_system": "میڈی کیوسک (MediKiosk) میں خوش آمدید۔ اپنا طریقہ علاج منتخب کریں:",
        "select_lang": "بات چیت کے لیے اپنی پسندیدہ زبان منتخب کریں:",
        "consent": "میڈی کیوسک ایک AI معاون ہے جو ڈاکٹر کے لیے آپ کی معلومات جمع کرتا ہے۔ کیا آپ متفق ہیں؟",
        "chief_complaint": "آج آپ کو کیا بنیادی تکلیف یا مسئلہ درپیش ہے؟",
        "site": "یہ درد یا تکلیف جسم کے کس حصے میں ہو رہی ہے؟",
        "onset": "یہ مسئلہ کب شروع ہوا؟",
        "character": "اس درد کی کیفیت کیسی ہے (جیسے جلن یا تیز درد)؟",
        "radiation": "کیا یہ درد جسم کے کسی دوسرے حصے کی طرف پھیلتا ہے؟",
        "associated": "کیا اس کے ساتھ کوئی اور علامات بھی ہیں؟",
        "timing": "کیا یہ درد مسلسل رہتا ہے یا آتا جاتا رہتا ہے؟",
        "aggravating_relieving": "کیا کسی خاص چیز سے یہ بڑھتا یا کم ہوتا ہے؟",
        "severity": "0 سے 10 کے پیمانے پر آپ کے درد کی شدت کتنی ہے؟",
        "medical_history": "کیا آپ کو پہلے سے کوئی بیماری ہے (جیسے شوگر، بلڈ پریشر)؟",
        "medication_history": "کیا آپ روزانہ کوئی دوائیں لے رہے ہیں؟",
        "allergies": "کیا آپ کو کسی دوا یا خوراک سے الرجی ہے؟",
        "review_confirmation": "شکریہ۔ آپ کی معلومات درج کر لی گئی ہیں۔ برائے کرم چیک کریں۔",
        "completed": "شکریہ! آپ کی معلومات ڈاکٹر کے ڈیسک پر بھیج دی گئی ہیں۔"
    }
}

# Ayurvedic Dashavidha questions and options
AYURVEDA_QUESTIONS: Dict[str, Dict[str, Any]] = {
    "ayurveda_site": {
        "text": {
            "english": "Where is the primary site of your discomfort or manifestation?",
            "hindi": "यह समस्या या तकलीफ शरीर के किस हिस्से में सबसे अधिक महसूस हो रही है?",
            "marathi": "हा त्रास शरीराच्या कोणत्या भागात जास्त जाणवत आहे?",
            "gujarati": "આ તકલીફ શરીરના કયા મુખ્ય ભાગમાં સૌથી વધુ અનુભવાય છે?",
            "tamil": "இந்த உபாதை உடலின் எந்த முக்கிய பகுதியில் அதிகம் உள்ளது?",
            "telugu": "ఈ సమస్య శరీరంలోని ఏ ప్రధాన భాగంలో ఎక్కువగా ఉంది?",
            "kannada": "ಈ ತೊಂದರೆ ದೇಹದ ಯಾವ ಮುಖ್ಯ ಭಾಗದಲ್ಲಿ ಹೆಚ್ಚಾಗಿದೆ?",
            "malayalam": "ഈ ബുദ്ധിമുട്ട് ശരീരത്തിന്റെ ഏത് ഭാഗത്താണ് കൂടുതൽ?",
            "bengali": "এই সমস্যাটি শরীরের কোন প্রধান অংশে সবচেয়ে বেশি অনুভূত হচ্ছে?",
            "punjabi": "ਇਹ ਤਕਲੀਫ ਸਰੀਰ ਦੇ ਕਿਸ ਹਿੱਸੇ ਵਿੱਚ ਸਭ ਤੋਂ ਵੱਧ ਮਹਿਸੂਸ ਹੋ ਰਹੀ ਹੈ?",
            "odia": "ଏହି ସମସ୍ୟା ଶରୀରର କେଉଁ ଅଂଶରେ ସବୁଠାରୁ ଅଧିକ ଅନୁଭୂତ ହେଉଛି?",
            "assamese": "এই সমস্যাটো শৰীৰৰ কোন অংশত আটাইতকৈ বেছি অনুভৱ হৈছে?",
            "urdu": "یہ تکلیف جسم کے کس حصے میں سب سے زیادہ محسوس ہو رہی ہے؟"
        },
        "options": [
            QuickOption(label="Upper abdomen / Stomach", value="Upper abdomen / Stomach", subtitle="आमाशय / पक्वाशय"),
            QuickOption(label="Chest / Throat / Esophagus", value="Chest / Throat / Esophagus", subtitle="उरःस्थान / कंठ"),
            QuickOption(label="Joints / Lower Back / Knees", value="Joints / Lower Back / Knees", subtitle="संधि / कटी"),
            QuickOption(label="Head / Temples / Forehead", value="Head / Temples / Forehead", subtitle="शिरःशूल"),
            QuickOption(label="Whole Body / Generalized", value="Whole Body / Generalized", subtitle="सर्वशरीर")
        ],
        "type": QuestionType.SINGLE_CHOICE
    },
    "ayurveda_severity": {
        "text": {
            "english": "On a scale of 0 to 10, how intense is your symptom severity right now?",
            "hindi": "0 से 10 के पैमाने पर आपकी तकलीफ की तीव्रता कितनी है?",
            "marathi": "० ते १० च्या प्रमाणात आपल्या त्रासाची तीव्रता किती आहे?",
            "gujarati": "૦ થી ૧૦ ના સ્કેલ પર તમારી તકલીફ કેટલી તીવ્ર છે?",
            "tamil": "0 முதல் 10 வரை உங்கள் வலி அல்லது சிரமத்தின் தீவிரம் எவ்வளவு?",
            "telugu": "0 నుండి 10 స్కేల్ పై మీ బాధ తీవ్రత ఎంత?",
            "kannada": "೦ ರಿಂದ ೧೦ ರ ಮಾಪಕದಲ್ಲಿ ನಿಮ್ಮ ತೊಂದರೆಯ ತೀವ್ರತೆ ಎಷ್ಟಿದೆ?",
            "malayalam": "0 മുതൽ 10 വരെയുള്ള സ്കെയിലിൽ നിങ്ങളുടെ അസ്വസ്ഥത എത്രയാണ്?",
            "bengali": "০ থেকে ১০ স্কেলে আপনার কষ্টের তীব্রতা কতটা?",
            "punjabi": "0 ਤੋਂ 10 ਦੇ ਪੈਮਾਨੇ 'ਤੇ ਤੁਹਾਡੀ ਤਕਲੀਫ ਕਿੰਨੀ ਤੀਬਰ ਹੈ?",
            "odia": "୦ ରୁ ୧୦ ମାପରେ ଆପଣଙ୍କ କଷ୍ଟର ତୀବ୍ରତା କେତେ?",
            "assamese": "০ ৰ পৰা ১০ ৰ স্কেলত আপোনাৰ কষ্ট কিমান তীব্ৰ?",
            "urdu": "0 سے 10 کے پیمانے پر آپ کی تکلیف کتنی شدید ہے؟"
        },
        "type": QuestionType.PAIN_SCALE
    },
    "ayurveda_prakriti_build": {
        "text": {
            "english": "1. Prakriti (प्रकृति - Natural Constitution): Which best describes your natural body build and skin tendency since youth?",
            "hindi": "१. प्रकृति (शारीरिक गठन): युवावस्था से आपकी स्वाभाविक शारीरिक बनावट और त्वचा का स्वभाव कैसा रहा है?",
            "marathi": "१. प्रकृति (शारीरिक ठेवण): आपली स्वाभाविक शारीरिक ठेवण आणि त्वचा कशी आहे?",
            "gujarati": "૧. પ્રકૃતિ (શારીરિક બંધારણ): તમારી સ્વાભાવિક શરીર રચના અને ત્વચા કેવી છે?",
            "tamil": "1. பிரகிருதி (இயற்கை உடலமைப்பு): உங்கள் இயல்பான உடல் கட்டமைப்பு மற்றும் தோல் தன்மை எப்படி?",
            "telugu": "1. ప్రకృతి (శరీర నిర్మాణం): మీ సహజ శరీర నిర్మాణం మరియు చర్మం స్వభావం ఎలాంటిది?",
            "kannada": "೧. ಪ್ರಕೃತಿ (ದೇಹ ರಚನೆ): ನಿಮ್ಮ ನೈಸರ್ಗಿಕ ದೇಹದ ರಚನೆ ಮತ್ತು ಚರ್ಮದ ಲಕ್ಷಣ ಹೇಗಿದೆ?",
            "malayalam": "1. പ്രകൃതി (ശരീര ഘടന): നിങ്ങളുടെ സ്വാഭാവിക ശരീര പ്രകൃതി എങ്ങനെയുള്ളതാണ്?",
            "bengali": "১. প্রকৃতি (শারীরিক গঠন): আপনার স্বাভাবিক শারীরিক গঠন ও ত্বকের ধরন কেমন?",
            "punjabi": "1. ਪ੍ਰਕ੍ਰਿਤੀ (ਸਰੀਰਕ ਬਣਤਰ): ਤੁਹਾਡੀ ਕੁਦਰਤੀ ਸਰੀਰਕ ਬਣਤਰ ਕਿਹੋ ਜਿਹੀ ਹੈ?",
            "odia": "୧. ପ୍ରକୃତି (ଶାରୀରିକ ଗଠନ): ଆପଣଙ୍କର ସ୍ୱାଭାବିକ ଶରୀର ଗଠନ କିପରି?",
            "assamese": "১. প্রকৃতি (শাৰীৰিক গঠন): আপোনাৰ স্বাভাৱিক শৰীৰৰ গঠন কেনেকুৱা?",
            "urdu": "1. پرکرتی (جسمانی ساخت): آپ کی قدرتی جسمانی ساخت کیسی ہے؟"
        },
        "options": [
            QuickOption(label="Slender / Thin build, dry skin, feels cold easily (Vata dominant)", value="Slender / Thin build, dry skin, feels cold easily (Vata dominant)", subtitle="वात प्रधान लक्षण"),
            QuickOption(label="Medium athletic build, warm body, moderate weight (Pitta dominant)", value="Medium athletic build, warm body, moderate weight (Pitta dominant)", subtitle="पित्त प्रधान लक्षण"),
            QuickOption(label="Broad sturdy frame, soft smooth skin, gains weight easily (Kapha dominant)", value="Broad sturdy frame, soft smooth skin, gains weight easily (Kapha dominant)", subtitle="कफ प्रधान लक्षण")
        ],
        "type": QuestionType.SINGLE_CHOICE
    },
    "ayurveda_prakriti_temp": {
        "text": {
            "english": "Prakriti Thermal Sensitivity: What climate or temperature do you naturally prefer?",
            "hindi": "प्रकृति (तापमान संवेदनशीलता): आप स्वाभाविक रूप से किस प्रकार के मौसम या तापमान को पसंद करते हैं?",
            "marathi": "प्रकृति (तापमान संवेदनशीलता): आपल्याला कोणते तापमान अधिक अनुकूल वाटते?",
            "gujarati": "પ્રકૃતિ (તાપમાન સંવેદનશીલતા): તમને કેવું વાતાવરણ અનુકૂળ રહે છે?",
            "tamil": "பிரகிருதி (வெப்பநிலை விருப்பம்): உங்களுக்கு எந்த காலநிலை இயல்பாகப் பிடிக்கும்?",
            "telugu": "ప్రకృతి (వాతావరణం): మీరు సహజంగా ఎలాంటి వాతావరణాన్ని ఇష్టపడతారు?",
            "kannada": "ಪ್ರಕೃತಿ (ತಾಪಮಾನ): ನೀವು ಸಾಮಾನ್ಯವಾಗಿ ಯಾವ ವಾತಾವರಣವನ್ನು ಇಷ್ಟಪಡುತ್ತೀರಿ?",
            "malayalam": "പ്രകൃതി (താപനില): നിങ്ങൾക്ക് ഏത് കാലാവസ്ഥയാണ് അനുയോജ്യം?",
            "bengali": "প্রকৃতি (তাপমাত্রা সংবেদনশীলতা): আপনি কোন ধরনের আবহাওয়া পছন্দ করেন?",
            "punjabi": "ਪ੍ਰਕ੍ਰਿਤੀ (ਤਾਪਮਾਨ): ਤੁਸੀਂ ਕੁਦਰਤੀ ਤੌਰ 'ਤੇ ਕਿਹੋ ਜਿਹਾ ਮੌਸਮ ਪਸੰਦ ਕਰਦੇ ਹੋ?",
            "odia": "ପ୍ରକୃତି (ତାପମାତ୍ରା): ଆପଣ ସ୍ୱାଭାବିକ ଭାବେ କେଉଁ ପାଣିପାଗ ପସନ୍ଦ କରନ୍ତି?",
            "assamese": "প্রকৃতি (তাপমাত্ৰা): আপুনি কেনেকুৱা বতৰ পছন্দ কৰে?",
            "urdu": "آپ قدرتی طور پر کس قسم کا موسم یا درجہ حرارت پسند کرتے ہیں؟"
        },
        "options": [
            QuickOption(label="Prefers cooler environment (Dislikes heat)", value="Prefers cooler environment (Dislikes heat)", subtitle="पित्त संवेदनशीलता"),
            QuickOption(label="Prefers warm environment (Dislikes cold / breeze)", value="Prefers warm environment (Dislikes cold / breeze)", subtitle="वात-कफ संवेदनशीलता"),
            QuickOption(label="Comfortable in all seasons / Balanced", value="Comfortable in all seasons / Balanced", subtitle="सम शीतोष्ण")
        ],
        "type": QuestionType.SINGLE_CHOICE
    },
    "ayurveda_vikriti": {
        "text": {
            "english": "2. Vikriti (विकृति - Recent Imbalance): What recent departures or imbalances have you noticed lately?",
            "hindi": "२. विकृति (दोष असंतुलन): हाल के दिनों में आपको किस प्रकार के असंतुलन या बदलाव महसूस हो रहे हैं?",
            "marathi": "२. विकृति (दोष बदल): अलीकडच्या काळात आपल्याला कोणते बदल किंवा असंतुलन जाणवत आहे?",
            "gujarati": "૨. વિકૃતિ (દોષ અસંતુલન): તાજેતરમાં તમને શરીરમાં કેવા ફેરફાર કે અસંતુલન જણાય છે?",
            "tamil": "2. விக்ருதி (சமீபத்திய தோஷ மாறுபாடு): சமீபத்தில் என்ன மாற்றங்களை உணர்கிறீர்கள்?",
            "telugu": "2. వికృతి (ఇటీవలి అసమతుల్యత): ఇటీవల శరీరంలో ఎలాంటి మార్పులు గమనించారు?",
            "kannada": "೨. ವಿಕೃತಿ (ದೋಷ ಬದಲಾವಣೆ): ಇತ್ತೀಚೆಗೆ ನೀವು ಯಾವ ಬದಲಾವಣೆಗಳನ್ನು ಗಮನಿಸಿದ್ದೀರಿ?",
            "malayalam": "2. വികൃതി (ദോഷ വ്യതിയാനം): അടുത്ത കാലത്തായി എന്ത് മാറ്റങ്ങളാണ് അനുഭവപ്പെടുന്നത്?",
            "bengali": "২. বিকৃতি (দোষের ভারসাম্যহীনতা): সম্প্রতি আপনার শরীরে কী পরিবর্তন লক্ষ্য করছেন?",
            "punjabi": "2. ਵਿਕ੍ਰਿਤੀ (ਦੋਸ਼ ਅਸੰਤੁਲਨ): ਹਾਲ ਹੀ ਵਿੱਚ ਤੁਸੀਂ ਸਰੀਰ ਵਿੱਚ ਕੀ ਬਦਲਾਅ ਮਹਿਸੂਸ ਕੀਤੇ ਹਨ?",
            "odia": "୨. ବିକୃତି (ଦୋଷ ଅସନ୍ତୁଳନ): ସମ୍ପ୍ରତି ଶରୀରରେ କି ପରିବର୍ତ୍ତନ ଅନୁଭବ କରୁଛନ୍ତି?",
            "assamese": "২. বিকৃতি (দোষৰ পৰিৱৰ্তন): শেহতীয়াকৈ আপুনি কিবা পৰিৱৰ্তন লক্ষ্য কৰিছে নেকি?",
            "urdu": "2. وکروتی (حالیہ بگاڑ): حالیہ دنوں میں آپ نے کیا تبدیلیاں محسوس کی ہیں؟"
        },
        "options": [
            QuickOption(label="Excessive body heat, burning sensations, acid reflux (Pitta Imbalance)", value="Excessive body heat, burning sensations, acid reflux (Pitta Imbalance)", subtitle="पित्त प्रकोप"),
            QuickOption(label="Body stiffness, joint aches, gas/bloating, dryness (Vata Imbalance)", value="Body stiffness, joint aches, gas/bloating, dryness (Vata Imbalance)", subtitle="वात प्रकोप"),
            QuickOption(label="Heaviness, sluggishness, mucus congestion, lethargy (Kapha Imbalance)", value="Heaviness, sluggishness, mucus congestion, lethargy (Kapha Imbalance)", subtitle="कफ प्रकोप")
        ],
        "type": QuestionType.SINGLE_CHOICE
    },
    "ayurveda_ahara_appetite": {
        "text": {
            "english": "3. Ahara Shakti (आहार शक्ति - Agni & Appetite): How is your natural hunger and digestive fire (Agni)?",
            "hindi": "३. आहार शक्ति (अग्नि व भूख): आपकी भूख और पाचन शक्ति (अग्नि) का स्तर कैसा है?",
            "marathi": "३. आहार शक्ति (भूक व पचन): आपली भूक आणि पचनशक्ती कशी आहे?",
            "gujarati": "૩. આહાર શક્તિ (અગ્નિ અને ભૂખ): તમારી ભૂખ અને પાચનશક્તિ કેવી છે?",
            "tamil": "3. ஆகார சக்தி (பசி மற்றும் ஜீரண சக்தி): உங்கள் பசி மற்றும் செரிமானத் திறன் எப்படி உள்ளது?",
            "telugu": "3. ఆహార శక్తి (జీర్ణశక్తి): మీ ఆకలి మరియు జీర్ణశక్తి ఎలా ఉంది?",
            "kannada": "೩. ಆಹಾರ ಶಕ್ತಿ (ಹಸಿವು ಮತ್ತು ಜೀರ್ಣಕ್ರಿಯೆ): ನಿಮ್ಮ ಹಸಿವು ಮತ್ತು ಜೀರ್ಣಶಕ್ತಿ ಹೇಗಿದೆ?",
            "malayalam": "3. ആഹാര ശക്തി (ദഹന ശേഷി): നിങ്ങളുടെ വിശപ്പും ദഹന ശേഷിയും എങ്ങനെ?",
            "bengali": "৩. আহার শক্তি (ক্ষুধা ও হজম ক্ষমতা): আপনার স্বাভাবিক ক্ষুধা ও হজমের অবস্থা কেমন?",
            "punjabi": "3. ਆਹਾਰ ਸ਼ਕਤੀ (ਭੁੱਖ ਅਤੇ ਪਾਚਨ): ਤੁਹਾਡੀ ਭੁੱਖ ਅਤੇ ਪਾਚਨ ਸ਼ਕਤੀ ਕਿਹੋ ਜਿਹੀ ਹੈ?",
            "odia": "୩. ଆହାର ଶକ୍ତି (ଭୋକ ଓ ହଜମ): ଆପଣଙ୍କ ଭୋକ ଏବଂ ହଜମ ଶକ୍ତି କିପରି?",
            "assamese": "৩. আহাৰ শক্তি (ভোক আৰু হজম): আপোনাৰ ভোক আৰু হজম শক্তি কেনেকুৱা?",
            "urdu": "3. آہار شکتی (بھوک اور ہاضمہ): آپ کی بھوک اور ہاضمے کی طاقت کیسی ہے؟"
        },
        "options": [
            QuickOption(label="Strong hunger, digests on schedule (Sama Agni / Tikshna Agni)", value="Strong hunger, digests on schedule", subtitle="सम / तीक्ष्णाग्नि"),
            QuickOption(label="Irregular appetite, gas/bloating after meals (Visham Agni)", value="Irregular appetite, gas/bloating after meals", subtitle="विषमाग्नि"),
            QuickOption(label="Slow weak digestion, heaviness for hours (Manda Agni)", value="Slow weak digestion, heaviness for hours", subtitle="मंदाग्नि")
        ],
        "type": QuestionType.SINGLE_CHOICE
    },
    "ayurveda_ahara_postmeal": {
        "text": {
            "english": "Ahara Shakti (Jarana Shakti): How do you feel 1-2 hours after eating a normal meal?",
            "hindi": "आहार शक्ति (पाचन काल): सामान्य भोजन करने के १-२ घंटे बाद आप कैसा महसूस करते हैं?",
            "marathi": "आहार शक्ति (पचन काळ): जेवणानंतर १-२ तासांनी आपल्याला कसे वाटते?",
            "gujarati": "આહાર શક્તિ: સામાન્ય ભોજન પછી ૧-૨ કલાકે તમને કેવું લાગે છે?",
            "tamil": "ஆகார சக்தி: உணவு உண்ட 1-2 மணி நேரத்திற்குப் பிறகு எப்படி உணர்கிறீர்கள்?",
            "telugu": "ఆహార శక్తి: భోజనం చేసిన 1-2 గంటల తర్వాత మీకు ఎలా అనిపిస్తుంది?",
            "kannada": "ಆಹಾರ ಶಕ್ತಿ: ಊಟದ ನಂತರ ೧-೨ ಗಂಟೆಗಳ ನಂತರ ನಿಮಗೆ ಹೇಗನಿಸುತ್ತದೆ?",
            "malayalam": "ആഹാര ശക്തി: ഭക്ഷണം കഴിഞ്ഞ് 1-2 മണിക്കൂറിന് ശേഷം എന്ത് തോന്നുന്നു?",
            "bengali": "আহার শক্তি: খাওয়ার ১-২ ঘণ্টা পর আপনি কেমন অনুভব করেন?",
            "punjabi": "ਆਹਾਰ ਸ਼ਕਤੀ: ਖਾਣਾ ਖਾਣ ਤੋਂ 1-2 ਘੰਟੇ ਬਾਅਦ ਤੁਹਾਨੂੰ ਕਿਵੇਂ ਲੱਗਦਾ ਹੈ?",
            "odia": "ଆହାର ଶକ୍ତି: ଖାଇବାର ୧-୨ ଘଣ୍ଟା ପରେ ଆପଣ କିପରି ଅନୁଭବ କରନ୍ତି?",
            "assamese": "আহাৰ শক্তি: খোৱাৰ ১-২ ঘণ্টা পিছত আপুনি কেনে অনুভৱ কৰে?",
            "urdu": "کھانے کے 1-2 گھنٹے بعد آپ کیسا محسوس کرتے ہیں؟"
        },
        "options": [
            QuickOption(label="Comfortable, light, energized (Good Jarana Shakti)", value="Comfortable, light, energized", subtitle="उत्तम जरण शक्ति"),
            QuickOption(label="Sour acid reflux, burning, or headache", value="Sour acid reflux, burning, or headache", subtitle="अम्लोद्गार / पित्त"),
            QuickOption(label="Heavy stomach, bloating, lethargy", value="Heavy stomach, bloating, lethargy", subtitle="आटोप / जडत्व")
        ],
        "type": QuestionType.SINGLE_CHOICE
    },
    "ayurveda_satmya": {
        "text": {
            "english": "4. Satmya (सात्म्य - Dietary Suitability): Which dietary habits or tastes suit your system best without causing discomfort?",
            "hindi": "४. सात्म्य (अनुकूल आहार): किस प्रकार का खान-पान आपके शरीर को सबसे अधिक अनुकूल रहता है?",
            "marathi": "४. सात्म्य (अनुकूल आहार): कोणते अन्न आपल्या प्रकृतीला जास्त मानवते?",
            "gujarati": "૪. સાત્મ્ય (અનુકૂળ આહાર): કેવો ખોરાક તમારા શરીરને સૌથી વધુ માફક આવે છે?",
            "tamil": "4. சாத்மியா (உணவு ஒவ்வாமை/ஒப்புதல்): எந்த உணவு உங்களுக்கு ஒத்துப்போகிறது?",
            "telugu": "4. సాత్మ్య (అనుకూల ఆహారం): ఎలాంటి ఆహారం మీకు బాగా సరిపడుతుంది?",
            "kannada": "೪. ಸಾತ್ಮ್ಯ (ಅನುಕೂಲ ಆಹಾರ): ಯಾವ ರೀತಿಯ ಆಹಾರ ನಿಮ್ಮ ದೇಹಕ್ಕೆ ಹೆಚ್ಚು ಹೊಂದುತ್ತದೆ?",
            "malayalam": "4. സാത്മ്യം (അനുയോജ്യമായ ഭക്ഷണം): ഏത് ഭക്ഷണമാണ് ശരീരത്തിന് ഇണങ്ങുന്നത്?",
            "bengali": "৪. সাত্ম্য (অনুকূল আহার): কোন ধরনের খাবার আপনার শরীরে ভালো সহ্য হয়?",
            "punjabi": "4. ਸਾਤਮਯ (ਅਨੁਕੂਲ ਖੁਰਾਕ): ਕਿਹੋ ਜਿਹਾ ਖਾਣਾ ਤੁਹਾਡੇ ਸਰੀਰ ਲਈ ਢੁਕਵਾਂ ਹੈ?",
            "odia": "୪. ସାତ୍ମ୍ୟ (ଅନୁକୂଳ ଖାଦ୍ୟ): କେଉଁ ଖାଦ୍ୟ ଆପଣଙ୍କ ଶରୀରକୁ ଭଲ ସୁଟ୍ କରେ?",
            "assamese": "৪. সাAtm্য (অনুকূল খাদ্য): কেনেকুৱা খাদ্য আপোনাৰ শৰীৰৰ বাবে উপযোগী?",
            "urdu": "4. ساتھمیہ (موافق غذا): کس قسم کی خوراک آپ کے جسم کو موافق رہتی ہے؟"
        },
        "options": [
            QuickOption(label="Warm, cooked, freshly prepared home meals (Snigdha / Ushna Satmya)", value="Warm freshly prepared home meals", subtitle="उष्ण स्निग्ध सात्म्य"),
            QuickOption(label="Cooling fluids, fresh milk, sweet fruits (Sheeta Satmya)", value="Cooling fluids, fresh milk, sweet fruits", subtitle="शीत सात्म्य"),
            QuickOption(label="Spicy, sour, oily foods cause immediate discomfort/burning", value="Spicy, sour, oily foods trigger symptoms", subtitle="कटु-अम्ल असात्म्य")
        ],
        "type": QuestionType.SINGLE_CHOICE
    },
    "ayurveda_sattva": {
        "text": {
            "english": "5. Sattva (सत्त्व - Mental Resilience): How is your mental fortitude, sleep quality, and stress response under pressure?",
            "hindi": "५. सत्त्व (मानसिक बल व स्वभाव): मानसिक तनाव और दबाव में आपका धैर्य और नींद की गुणवत्ता कैसी रहती है?",
            "marathi": "५. सत्त्व (मानसिक बळ): तणावाच्या प्रसंगी आपले मानसिक धैर्य व झोप कशी असते?",
            "gujarati": "૫. સત્ત્વ (માનસિક બળ): માનસિક તણાવમાં તમારી ધીરજ અને ઊંઘ કેવી રહે છે?",
            "tamil": "5. சத்வ (மன உறுதி): மன அழுத்தம் மற்றும் தூக்கத்தின் தரம் எப்படி உள்ளது?",
            "telugu": "5. సత్త్వ (మానసిక స్థైర్యం): ఒత్తిడి సమయంలో మీ మానసిక ధైర్యం మరియు నిద్ర ఎలా ఉంటాయి?",
            "kannada": "೫. ಸತ್ತ್ವ (ಮಾನಸಿಕ ಶಕ್ತಿ): ಒತ್ತಡದ ಸಮಯದಲ್ಲಿ ನಿಮ್ಮ ಮನೋಬಲ ಮತ್ತು ನಿದ್ರೆ ಹೇಗಿರುತ್ತದೆ?",
            "malayalam": "5. സത്ത്വം (മനോധൈര്യം): മാനസിക സമ്മർദ്ദത്തിലും ഉറക്കത്തിലും ഉള്ള അവസ്ഥ?",
            "bengali": "৫. সত্ত্ব (মানসিক বল): মানসিক চাপ ও ঘুমের অবস্থা কেমন থাকে?",
            "punjabi": "5. ਸਤਵ (ਮਾਨਸਿਕ ਬਲ): ਤਣਾਅ ਵਿੱਚ ਤੁਹਾਡਾ ਮਨੋਬਲ ਅਤੇ ਨੀਂਦ ਕਿਹੋ ਜਿਹੀ ਰਹਿੰਦੀ ਹੈ?",
            "odia": "୫. ସତ୍ତ୍ୱ (ମାନସିକ ଶକ୍ତି): ଚାପ ସମୟରେ ଆପଣଙ୍କ ଧୈର୍ଯ୍ୟ ଏବଂ ନିଦ୍ରା କିପରି ରହେ?",
            "assamese": "৫. সত্ত্ব (মানসিক শক্তি): মানসিক চাপত আপোনাৰ ধৈৰ্য্য আৰু টোপনি কেনেকুৱা হয়?",
            "urdu": "5. ستوا (دماغی طاقت): ذہنی دباؤ اور نیند کی کیفیت کیسی رہتی ہے؟"
        },
        "options": [
            QuickOption(label="Calm, resilient under stress, sound uninterrupted sleep (Pravara / High Sattva)", value="Calm, resilient, sound sleep", subtitle="प्रवर सत्त्व"),
            QuickOption(label="Moderate resilience, occasional worry or disturbed sleep (Madhyama Sattva)", value="Moderate resilience, occasional worry", subtitle="मध्यम सत्त्व"),
            QuickOption(label="Easily anxious, anxious palpitations, shallow light sleep (Avara Sattva)", value="Easily anxious, light disturbed sleep", subtitle="अवर सत्त्व")
        ],
        "type": QuestionType.SINGLE_CHOICE
    },
    "ayurveda_vyayama": {
        "text": {
            "english": "6. Vyayama Shakti (व्यायाम शक्ति - Physical Stamina): What is your physical exercise tolerance and daily stamina level?",
            "hindi": "६. व्यायाम शक्ति (शारीरिक श्रम क्षमता): आपकी शारीरिक कार्यक्षमता और दैनिक ऊर्जा का स्तर कैसा है?",
            "marathi": "६. व्यायाम शक्ति (श्रम क्षमता): आपली शारीरिक क्षमता व दैनंदिन ताकद कशी आहे?",
            "gujarati": "૬. વ્યાયામ શક્તિ (શારીરિક ક્ષમતા): તમારી દૈનિક કાર્યક્ષમતા અને શક્તિ કેવી છે?",
            "tamil": "6. వ్యాయామ శక్తి (శారీరక సామర్థ్యం): உங்கள் உடல் உழைப்புத் திறன் எப்படி உள்ளது?",
            "telugu": "6. వ్యాయామ శక్తి: మీ శారీరక శ్రమ మరియు రోజువారీ శక్తి స్థాయి ఎలా ఉంది?",
            "kannada": "೬. ವ್ಯಾಯಾಮ ಶಕ್ತಿ: ನಿಮ್ಮ ದೈಹಿಕ ಸಾಮರ್ಥ್ಯ ಮತ್ತು ದಿನನಿತ್ಯದ ಶಕ್ತಿ ಹೇಗಿದೆ?",
            "malayalam": "6. വ്യായാമ ശക്തി: നിങ്ങളുടെ ശാരീരിക അധ്വാന ശേഷി എങ്ങനെ?",
            "bengali": "৬. ব্যায়াম শক্তি: আপনার শারীরিক পরিশ্রম ও দৈনিক শক্তির স্তর কেমন?",
            "punjabi": "6. ਵਿਆਯਾਮ ਸ਼ਕਤੀ: ਤੁਹਾਡੀ ਸਰੀਰਕ ਮਿਹਨਤ ਦੀ ਸਮਰੱਥਾ ਕਿੰਨੀ ਹੈ?",
            "odia": "୬. ବ୍ୟାୟାମ ଶକ୍ତି: ଆପଣଙ୍କ ଶାରୀରିକ ପରିଶ୍ରମ କରିବାର କ୍ଷମତା କିପରି?",
            "assamese": "৬. ব্যায়াম শক্তি: আপোনাৰ শাৰীৰিক পৰিশ্ৰমৰ ক্ষমতা কেনেকুৱা?",
            "urdu": "6. ورزش کی طاقت: آپ کی جسمانی مشقت اور روزمرہ کی توانائی کیسی ہے؟"
        },
        "options": [
            QuickOption(label="High stamina, tolerates heavy physical work without quick exhaustion (Pravara)", value="High stamina, handles heavy work well", subtitle="उत्तम व्यायाम शक्ति"),
            QuickOption(label="Moderate capacity, tired after normal day work (Madhyama)", value="Moderate capacity, standard stamina", subtitle="मध्यम व्यायाम शक्ति"),
            QuickOption(label="Gets fatigued quickly with mild exertion (Avara)", value="Fatigues quickly with mild exertion", subtitle="अवर व्यायाम शक्ति")
        ],
        "type": QuestionType.SINGLE_CHOICE
    },
    "ayurveda_sara": {
        "text": {
            "english": "7. Sara (सार - Tissue Vitality): How would you describe your overall muscle tone, joint stability, and complexion luster?",
            "hindi": "७. सार (धातु सारता व बल): आपकी मांसपेशियों की दृढ़ता, जोड़ों की मजबूती और चेहरे की चमक कैसी है?",
            "marathi": "७. सार (धातु सारता): आपले स्नायू, सांधे आणि शरीराचे तेज कसे आहे?",
            "gujarati": "૭. સાર (ધાતુ સારતા): તમારા સ્નાયુઓ, સાંધાઓ અને ત્વચાનું તેજ કેવું છે?",
            "tamil": "7. சார (உடல் திசுக்கள்): உங்கள் தசை பலம் மற்றும் மூட்டுகளின் உறுதி எப்படி?",
            "telugu": "7. సార (ధాతు బలం): మీ కండరాల దృఢత్వం మరియు కీళ్ల బలం ఎలా ఉంది?",
            "kannada": "೭. ಸಾರ (ಧಾತು ಶಕ್ತಿ): ನಿಮ್ಮ ಸ್ನಾಯುಗಳ ಬಲ ಮತ್ತು ಕೀಲುಗಳ ಸ್ಥಿರತೆ ಹೇಗಿದೆ?",
            "malayalam": "7. സാരം: നിങ്ങളുടെ പേശികളുടെയും സന്ധികളുടെയും ബലം എങ്ങനെ?",
            "bengali": "৭. সার (ধাতু শক্তি): আপনার মাংসপেশি ও অস্থিসন্ধির দৃঢ়তা কেমন?",
            "punjabi": "7. ਸਾਰ: ਤੁਹਾਡੀਆਂ ਮਾਸਪੇਸ਼ੀਆਂ ਅਤੇ ਜੋੜਾਂ ਦੀ ਮਜ਼ਬੂਤੀ ਕਿਹੋ ਜਿਹੀ ਹੈ?",
            "odia": "୭. ସାର: ଆପଣଙ୍କ ମାଂସପେଶୀ ଏବଂ ଗଣ୍ଠିର ଦୃଢତା କିପରି?",
            "assamese": "৭. সাৰ: আপোনাৰ পেশী আৰু গাঁঠিৰ শক্তি কেনেকুৱা?",
            "urdu": "7. سار: آپ کے پٹھوں اور جوڑوں کی مضبوطی کیسی ہے؟"
        },
        "options": [
            QuickOption(label="Strong firm muscles, radiant complexion, firm joints (Pravara Sara)", value="Firm muscles, radiant complexion", subtitle="प्रवर सारता"),
            QuickOption(label="Moderate tissue tone and stability (Madhyama Sara)", value="Moderate tissue tone", subtitle="मध्यम सारता"),
            QuickOption(label="Soft, loose joints, pale or prone to early fatigue (Avara Sara)", value="Loose joints, prone to fatigue", subtitle="अवर सारता")
        ],
        "type": QuestionType.SINGLE_CHOICE
    },
    "ayurveda_samhanana": {
        "text": {
            "english": "8. Samhanana (संहनन - Frame Compactness): How compact and well-knit is your bone and skeletal frame?",
            "hindi": "८. संहनन (शारीरिक सुदृढ़ता): आपकी हड्डियों और शरीर की बनावट कितनी सुगठित और सुदृढ़ है?",
            "marathi": "८. संहनन (हाडांची रचना): आपली हाडे व शरीराची रचना किती सुदृढ आहे?",
            "gujarati": "૮. સંહનન: તમારી હાડકાં અને શરીરની રચના કેટલી સુદૃઢ છે?",
            "tamil": "8. സംഹനനം: உங்கள் எலும்பு மற்றும் உடல் கட்டமைப்பு எவ்வளவு உறுதியானது?",
            "telugu": "8. సంహనన: మీ శరీర ఎముకల నిర్మాణం ఎంత దృఢంగా ఉంది?",
            "kannada": "೮. ಸಂಹನನ: ನಿಮ್ಮ ಮೂಳೆ ಮತ್ತು ದೇಹದ ರಚನೆ ಎಷ್ಟು ಸದೃಢವಾಗಿದೆ?",
            "malayalam": "8. സംഹനനം: നിങ്ങളുടെ അസ്ഥികളുടെയും ശരീരത്തിന്റെയും ഘടന എത്രത്തോളം ഉറപ്പുള്ളതാണ്?",
            "bengali": "৮. সংহনন: আপনার হাড় ও শরীরের গঠন কতটা সুদৃঢ়?",
            "punjabi": "8. ਸੰਹਨਨ: ਤੁਹਾਡੀਆਂ ਹੱਡੀਆਂ ਅਤੇ ਸਰੀਰ ਦਾ ਢਾਂਚਾ ਕਿੰਨਾ ਮਜ਼ਬੂਤ ਹੈ?",
            "odia": "୮. ସଂହନନ: ଆପଣଙ୍କ ହାଡ଼ ଏବଂ ଶରୀର ଗଠନ କେତେ ସୁଦୃଢ?",
            "assamese": "৮. সংহনন: আপোনাৰ হাড় আৰু শৰীৰৰ গঠন কিমান সুদৃঢ়?",
            "urdu": "8. سنہنن: آپ کی ہڈیوں اور جسمانی ڈھانچے کی مضبوطی کیسی ہے؟"
        },
        "options": [
            QuickOption(label="Well-knit, symmetrical, compact robust structure (Su-samhata)", value="Compact robust structure", subtitle="सुसंहत संहनन"),
            QuickOption(label="Average proportional frame (Madhyama)", value="Average proportional frame", subtitle="मध्यम संहनन"),
            QuickOption(label="Loose, asymmetric, or fragile frame (Heena)", value="Loose fragile frame", subtitle="हीन संहनन")
        ],
        "type": QuestionType.SINGLE_CHOICE
    },
    "ayurveda_vaya": {
        "text": {
            "english": "9. Vaya (वय - Chronological Life Stage): Which age group or life phase do you belong to?",
            "hindi": "९. वय (आयु वर्ग): आप किस आयु वर्ग या जीवन चरण में आते हैं?",
            "marathi": "९. वय (वयाचा टप्पा): आपण कोणत्या वयोगटात मोडता?",
            "gujarati": "૯. વય (ઉંમર): તમે કયા વયજૂથમાં આવો છો?",
            "tamil": "9. வய (வயது பிரிவு): நீங்கள் எந்த வயதினரைச் சேர்ந்தவர்?",
            "telugu": "9. వయస్సు: మీరు ఏ వయస్సు వర్గానికి చెందినవారు?",
            "kannada": "೯. ವಯಸ್ಸು: ನೀವು ಯಾವ ವಯಸ್ಸಿನ ಗುಂಪಿಗೆ ಸೇರಿದವರು?",
            "malayalam": "9. വയസ്സ്: നിങ്ങൾ ഏത് പ്രായപരിധിയിൽ പെടുന്നു?",
            "bengali": "৯. বয়স: আপনি কোন বয়সের আওতাভুক্ত?",
            "punjabi": "9. ਉਮਰ: ਤੁਸੀਂ ਕਿਸ ਉਮਰ ਵਰਗ ਵਿੱਚ ਆਉਂਦੇ ਹੋ?",
            "odia": "୯. ବୟସ: ଆପଣ କେଉଁ ବୟସ ବର୍ଗରେ ଆସନ୍ତି?",
            "assamese": "৯. বয়স: আপুনি কোন বয়সৰ শাখাত পৰে?",
            "urdu": "9. عمر: آپ کا تعلق کس عمر کے طبقے سے ہے؟"
        },
        "options": [
            QuickOption(label="Youth / Early Adult (16–30 yrs) (Bala / Youvana)", value="Youth (16-30 yrs)", subtitle="बाल्य / युवावस्था (कफ-पित्त)"),
            QuickOption(label="Middle Age (31–60 yrs) (Madhyama Vaya)", value="Middle Age (31-60 yrs)", subtitle="मध्यमावस्था (पित्त प्रधान)"),
            QuickOption(label="Senior / Elder (>60 yrs) (Vriddha Vaya)", value="Senior (>60 yrs)", subtitle="वृद्धावस्था (वात प्रधान)")
        ],
        "type": QuestionType.SINGLE_CHOICE
    }
}


def normalize_chief_complaint(text: str) -> str:
    """
    Standardize colloquial/multilingual chief complaint phrases across 13 Indian languages + English
    to canonical clinical symptom categories.
    """
    if not text:
        return "Not specified"

    lower_text = text.strip().lower()

    # 1. Cardiac / Chest Pain
    chest_keywords = [
        "chest pain", "crushing chest", "heart pain", "cardiac pain", "angina",
        "छाती में दर्द", "सीने में दर्द", "दिल में दर्द", "छाती दर्द", "सीने का दर्द",
        "छातीत दुखणे", "छातीत वेदना", "छाती दुखी",
        "છાતીમાં દુખાવો", "છાતીમાં દર્દ", "છાતીનો દુખાવો",
        "நெஞ்சு வலி", "மார்பு வலி", "நெஞ்சுவலி",
        "ఛాతీ నొప్పి", "గుండె నొప్పి", "ఛాతీలో నొప్పి",
        "ಎದೆ ನೋವು", "ಎದೆಯಲ್ಲಿ ನೋವು", "ಹೃದಯ ನೋವು",
        "നെഞ്ചുവേദന", "നെഞ്ചിൽ വേദന", "നെഞ്ചു വേദന",
        "বুকে ব্যথা", "বুকের যন্ত্রণা", "বুকে চাপ",
        "ਛਾਤੀ ਵਿੱਚ ਦਰਦ", "ਛਾਤੀ ਦਾ ਦਰਦ",
        "ଛାତିରେ ଯନ୍ତ୍ରଣା", "ଛାତି ଦରଜ", "ଛାତି ବିନ୍ଧା",
        "বুকুত বিষ", "বুকুৰ বিষ",
        "سینے میں درد", "دل میں درد"
    ]
    if any(k in lower_text for k in chest_keywords):
        return "chest pain"

    # 2. Acidity / Indigestion / Amlapitta (tested extensively in Ayurveda/Allopathy)
    acidity_keywords = [
        "acidity", "heartburn", "indigestion", "sour belching", "acid reflux",
        "burning in chest", "burning in stomach", "amlapitta", "bloating", "belching", "sour burp",
        "एसिडिटी", "जलन", "खट्टी डकार", "पेट में जलन", "बदहजमी", "अपच", "खट्टी डकारें", "अम्लपित्त",
        "आम्लपित्त", "जळजळ", "आंबट ढेकर", "पोटात जळजळ", "अपचन", "पित्त",
        "એસિડિટી", "બળતરા", "ખાટા ઓડકાર", "અપચો", "છાતીમાં બળતરા", "એસિડીટી",
        "நெஞ்செரிச்சல்", "அசிடிட்டி", "புளித்த ஏப்பம்", "செரிமானமின்மை", "அமிலத்தன்மை",
        "ఎసిడిటీ", "గుండెల్లో మంట", "పుల్లటి తేన్పులు", "అజీర్ణం", "కడుపులో మంట",
        "ಅಸಿಡಿಟಿ", "ಎದೆಯುರಿ", "ಹುಳಿತೇಗು", "ಅಜೀರ್ಣ", "ಹೊಟ್ಟೆಯಲ್ಲಿ ಉರಿ",
        "അസിഡിറ്റി", "നെഞ്ചെരിച്ചിൽ", "പുളിച്ചുതികട്ടൽ", "ദഹനക്കേട്", "വയറ്റിൽ പുകച്ചിൽ",
        "অম্লপিত্ত", "অ্যাসিডিটি", "বুক জ্বালা", "টক ঢেকুর", "বদহজম", "পেটে জ্বালা",
        "ਐਸਿਡਿਟੀ", "ਛਾਤੀ ਵਿੱਚ ਜਲਣ", "ਖੱਟੇ ਡਕਾਰ", "ਬਦਹਜ਼ਮੀ", "ਤੇਜ਼ਾਬੀਅਤ",
        "ଅମ୍ଳପିତ୍ତ", "ଏସିଡିଟି", "ଛାତି ଜଳାପୋଡ଼ା", "ଖଟା ଢେକୁର", "ଅଜୀର୍ଣ୍ଣ", "ପେଟ ଜଳିବା",
        "অম্লপিত্ত", "এচিডিটি", "বুকু পোৰণি", "টেঙা উগাৰ", "অজীৰ্ণ", "পেটৰ জ্বলা",
        "تیزابیت", "سینے کی جلن", "کھٹی ڈکاریں", "بدہضمی", "پیٹ کی جلن"
    ]
    if any(k in lower_text for k in acidity_keywords):
        return "acidity / indigestion"

    # 3. Abdominal / Stomach Pain
    abdominal_keywords = [
        "stomach pain", "abdominal pain", "belly ache", "stomach ache", "tummy pain", "abdomen pain",
        "belly pain", "cramps in stomach",
        "पेट दर्द", "पेट में दर्द", "उदर शूल",
        "पोटात दुखणे", "पोटदुखी", "पोटात वेदना",
        "પેટમાં દુખાવો", "પેટનો દુખાવો", "પેટમાં દર્દ",
        "வயிற்று வலி", "வயிறு வலி", "வயிற்றுவலி",
        "కడుపు నొప్పి", "కడుపులో నొప్పి",
        "ಹೊಟ್ಟೆ ನೋವು", "ಹೊಟ್ಟೆಯಲ್ಲಿ ನೋವು",
        "വയറുവേദന", "വയറ്റിൽ വേദന", "വയറു വേദന",
        "পেটে ব্যথা", "পেট ব্যথা", "উদর বেদনা",
        "ਪੇਟ ਵਿੱਚ ਦਰਦ", "ਢਿੱਡ ਵਿੱਚ ਦਰਦ", "ਪੇਟ ਦਰਦ",
        "ପେଟ ଯନ୍ତ୍ରଣା", "ପେଟ ବିନ୍ଧା", "ପେଟ କାମୁଡ଼ା",
        "পেটৰ বিষ", "পেট কামোৰণি",
        "پیٹ میں درد", "پیٹ کا درد"
    ]
    if any(k in lower_text for k in abdominal_keywords):
        return "abdominal pain"

    # 4. Headache
    headache_keywords = [
        "headache", "migraine", "head throbbing", "severe head",
        "सिरदर्द", "सिर में दर्द", "माथे में दर्द", "शिरःशूल",
        "डोकेदुखी", "डोक्यात दुखणे",
        "માથાનો દુખાવો", "માથું દુખવું",
        "தலைவலி", "தலை வலி",
        "తలనొప్పి", "తలలో నొప్పి",
        "ತಲೆನೋವು", "ತಲೆಯಲ್ಲಿ ನೋವು",
        "തലവേദന", "തല വേദന",
        "মাথা ব্যথা", "মাথাব্যথা", "মাথার যন্ত্রণা",
        "ਸਿਰ ਦਰਦ", "ਸਿਰ ਵਿੱਚ ਦਰਦ",
        "ମୁଣ୍ଡ ବିନ୍ଧା", "ମୁଣ୍ଡ ଯନ୍ତ୍ରଣା",
        "মূৰৰ বিষ", "মূৰ কামোৰণি",
        "سر میں درد", "سردرد"
    ]
    if any(k in lower_text for k in headache_keywords):
        return "headache"

    # 5. Fever / Chills
    fever_keywords = [
        "fever", "high temperature", "pyrexia", "chills", "shivering", "jwara",
        "बुखार", "ताप", "ठंड लगना", "ज्वर",
        "ताप", "थंडी वाजणे",
        "તાવ", "ધ્રુજારી",
        "காய்ச்சல்", "குளிர்",
        "జ్వరం", "చలి",
        "ಜ್ವರ", "ಚಳಿ",
        "പനി", "വിറയൽ",
        "জ্বর", "কাঁপুনি",
        "ਬੁਖਾਰ", "ਕੰਬਣੀ",
        "ଜ୍ୱର", "ଥଣ୍ଡା ଲାଗିବା",
        "জ্বৰ", "ঠাণ্ডা লগা",
        "بخار", "سردی لگنا"
    ]
    if any(k in lower_text for k in fever_keywords):
        return "fever"

    # 6. Breathlessness / Dyspnea
    dyspnea_keywords = [
        "breathlessness", "shortness of breath", "breathing difficulty", "dyspnea", "wheezing", "asthma",
        "सांस लेने में तकलीफ", "सांस फूलना", "दमा", "श्वास कष्ट",
        "श्वास घेण्यास त्रास", "धाप लागणे",
        "શ્વાસ લેવામાં તકલીફ", "શ્વાસ ચઢવો",
        "மூச்சுத் திணறல்", "மூச்சு வாங்குதல்",
        "శ్వాస తీసుకోవడంలో ఇబ్బంది", "ఆయాసం",
        "ಉಸಿರಾಟದ ತೊಂದರೆ", "ಉಬ್ಬಸ",
        "ശ്വാസംമുട്ടൽ", "ശ്വാസമെടുക്കാൻ ബുദ്ധിമുട്ട്",
        "শ্বাসকষ্ট", "হাঁপানি",
        "ਸਾਹ ਲੈਣ ਵਿੱਚ ਤਕਲੀਫ਼", "ਸਾਹ ਚੜ੍ਹਨਾ",
        "ନିଶ୍ୱାସ ପ୍ରଶ୍ୱାସରେ କଷ୍ଟ", "ଶ୍ୱାସ କଷ୍ଟ",
        "উশাহ-নিশাহ লোৱাত অসুবিধা", "হাঁপানী",
        "سانس لینے میں دشواری", "دم گھٹنا"
    ]
    if any(k in lower_text for k in dyspnea_keywords):
        return "shortness of breath"

    # Fallback to sanitized input text
    return text.strip()
