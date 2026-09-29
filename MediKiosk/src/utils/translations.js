// Multilingual Translation Dictionary for MediKiosk
// Supported: English, Hindi (हिंदी), Marathi (मराठी)

export const translations = {
  english: {
    hospitalName: "MediKiosk",
    kioskTagline: "Ayushman Bharat Digital Health Kiosk",
    welcomeTitle: "Hospital Check-In & OPD Kiosk",
    welcomeSubtitle: "Existing patients can identify using their 14-digit ABHA ID or 12-digit Aadhaar number to instantly generate their OPD token.",
    audioButtonText: "Tap to listen to instructions",
    audioPlayingText: "Speaking instructions...",
    speechIntro: "Welcome to MediKiosk. Existing patients please identify using your fourteen digit ABHA ID or twelve digit Aadhaar number. New patients please tap New Patient Registration.",
    speechAbha: "You selected ABHA ID. Please enter your fourteen digit Ayushman Bharat Health Account number.",
    speechAadhaar: "You selected Aadhaar. Please enter your twelve digit Aadhaar number or place your finger on the biometric scanner.",
    speechEmail: "You selected Email ID. Please enter your registered email address.",
    speechNew: "New patient registration selected. You can register using your Aadhaar number, existing ABHA ID, or enter basic details.",
    speechConsent: "As per the Digital Personal Data Protection Act and ABDM framework, your health information is encrypted and only used for your consultation.",
    
    // Existing Patient Section
    existingPatientTitle: "Existing Patient Login",
    existingPatientSubtitle: "Enter ABHA ID or Aadhaar Number for instant OPD Check-In",
    
    tabAbha: "ABHA ID",
    tabAbhaDesc: "14-digit Health Card",
    tabAadhaar: "Aadhaar Card",
    tabAadhaarDesc: "12-digit / Fingerprint",
    tabEmail: "Email ID",
    tabEmailDesc: "Registered Email",
    tabManual: "Basic Details",
    tabManualDesc: "Manual Form",

    labelAbha: "Enter 14-digit ABHA Number",
    labelAadhaar: "Enter 12-digit Aadhaar Number",
    labelEmail: "Enter Registered Email Address",
    placeholderAbha: "14-8892-4412-9031",
    placeholderAadhaar: "5481 9023 1184",
    placeholderEmail: "e.g. ramesh.sharma@abdm.gov.in",
    
    quickDemoAbha: "Demo ABHA",
    quickDemoAadhaar: "Demo Aadhaar",
    quickDemoEmail: "Demo Email",
    biometricScanBtn: "Use Biometric Fingerprint Scanner",

    // New Patient Section
    newPatientBannerTitle: "New Patient Registration",
    newPatientBannerDesc: "First time at this hospital? Create or link your Ayushman Bharat Health Account (ABHA) in 2 minutes.",
    newPatientBullet1: "Aadhaar e-KYC or Biometric Thumb scan",
    newPatientBullet2: "14-digit ABHA ID generation & linking",
    newPatientBullet3: "Instant paperless OPD queue token",

    // Consent & Verification
    consentLabel: "I consent to the collection and processing of my health data for this consultation as per the ABDM & DPDP Act 2023.",
    hearDetails: "Hear privacy details",
    viewDetails: "View DPDP Notice",

    btnContinue: "Verify & Get OPD Token",
    btnStartReg: "Register as New Patient",
    btnVerifying: "Verifying ABDM Database...",
    
    numpadToggleOpen: "Open Touch Keypad",
    numpadToggleClose: "Hide Touch Keypad",
    
    emergencySOS: "Emergency SOS / Assistance",
    kioskLocation: "Kiosk ID: OPD-GATE-02 • AIIMS New Delhi / Civil Hospital Hub",
    dpdpBadge: "DPDP Act 2023 & ABDM Compliant • 256-Bit Encrypted",
    
    otpModalTitle: "Verify Security OTP",
    otpModalSubtitle: "Enter 6-digit OTP sent to your linked mobile number",
    otpDemoCode: "Demo OTP is 123456",
    verifyOtpBtn: "Verify & Print Token",
    resendOtp: "Resend Code",
    
    scanFingerTitle: "Biometric Fingerprint Scanner",
    scanFingerInstruction: "Place your thumb or index finger firmly on the lighted scanner pad below",
    scanningText: "Reading biometric template...",
    matchSuccess: "Biometric Verified Successfully! Accessing ABDM Records...",
    
    validationErrorRequired: "Please enter your ABHA ID or Aadhaar Number",
    validationErrorAbha: "Please enter a valid 14-digit ABHA ID (e.g. 14-8892-4412-9031)",
    validationErrorAadhaar: "Please enter a valid 12-digit Aadhaar Number (e.g. 5481 9023 1184)",
    validationErrorEmail: "Please enter a valid email address (e.g. name@example.com)",
    validationErrorConsent: "Please grant consent under DPDP Act to proceed",
  },

  hindi: {
    hospitalName: "मेडीकियोस्क",
    kioskTagline: "आयुष्मान भारत डिजिटल स्वास्थ्य कियोस्क",
    welcomeTitle: "अस्पताल चेक-इन एवं ओपीडी कियोस्क",
    welcomeSubtitle: "पुराने मरीज तुरंत ओपीडी पर्ची और टोकन के लिए अपनी 14-अंकीय आभा आईडी या 12-अंकीय आधार संख्या से लॉगिन करें।",
    audioButtonText: "निर्देश सुनने के लिए यहाँ छुएं",
    audioPlayingText: "निर्देश सुनाए जा रहे हैं...",
    speechIntro: "मेडीकियोस्क में आपका स्वागत है। पुराने मरीज अपनी चौदह अंकों की आभा आईडी या बारह अंकों का आधार नंबर दर्ज करके लॉगिन करें। नए मरीज 'नया मरीज पंजीकरण' पर टैप करें।",
    speechAbha: "आपने आभा आईडी चुनी है। कृपया अपना चौदह अंकों का आयुष्मान भारत स्वास्थ्य खाता नंबर दर्ज करें।",
    speechAadhaar: "आपने आधार चुना है। कृपया अपना बारह अंकों का आधार नंबर दर्ज करें या बायोमेट्रिक स्कैनर पर उंगली रखें।",
    speechEmail: "आपने ईमेल आईडी चुनी है। कृपया अपना पंजीकृत ईमेल पता दर्ज करें।",
    speechNew: "नया पंजीकरण चुना गया है। आप आधार, आभा कार्ड या सामान्य विवरण द्वारा पंजीकरण कर सकते हैं।",
    speechConsent: "डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम के तहत, आपका स्वास्थ्य डेटा पूरी तरह सुरक्षित और केवल इस अस्पताल परामर्श के लिए उपयोग होगा।",
    
    existingPatientTitle: "पुराने मरीज लॉगिन",
    existingPatientSubtitle: "त्वरित ओपीडी चेक-इन के लिए आभा आईडी या आधार नंबर दर्ज करें",

    tabAbha: "आभा आईडी",
    tabAbhaDesc: "14-अंकीय स्वास्थ्य कार्ड",
    tabAadhaar: "आधार कार्ड",
    tabAadhaarDesc: "12-अंकीय / फिंगरप्रिंट",
    tabEmail: "ईमेल आईडी",
    tabEmailDesc: "पंजीकृत ईमेल",
    tabManual: "सामान्य विवरण",
    tabManualDesc: "सीधा फॉर्म",

    labelAbha: "14 अंकों का आभा (ABHA) नंबर दर्ज करें",
    labelAadhaar: "12 अंकों का आधार नंबर दर्ज करें",
    labelEmail: "पंजीकृत ईमेल आईडी दर्ज करें",
    placeholderAbha: "14-8892-4412-9031",
    placeholderAadhaar: "5481 9023 1184",
    placeholderEmail: "उदा. ramesh.sharma@abdm.gov.in",
    
    quickDemoAbha: "डेमो आभा भरें",
    quickDemoAadhaar: "डेमो आधार भरें",
    quickDemoEmail: "डेमो ईमेल भरें",
    biometricScanBtn: "फिंगरप्रिंट बायोमेट्रिक स्कैनर से स्कैन करें",

    newPatientBannerTitle: "नया मरीज पंजीकरण",
    newPatientBannerDesc: "क्या आप पहली बार आ रहे हैं? आधार, मौजूदा आभा या सामान्य विवरण से 2 मिनट में नया डिजिटल स्वास्थ्य कार्ड बनाएं।",
    newPatientBullet1: "आधार ई-केवाईसी या बायोमेट्रिक फिंगरप्रिंट",
    newPatientBullet2: "14-अंकीय डिजिटल आभा आईडी निर्माण",
    newPatientBullet3: "कागज़ रहित डिजिटल ओपीडी टोकन",

    consentLabel: "मैं ABDM एवं DPDP अधिनियम 2023 के तहत अपने स्वास्थ्य डेटा के सुरक्षित उपयोग की सहमति देता/देती हूँ।",
    hearDetails: "सहमति विवरण सुनें",
    viewDetails: "गोपनीयता नियम देखें",

    btnContinue: "सत्यापन करें और टोकन लें",
    btnStartReg: "नया मरीज पंजीकरण शुरू करें",
    btnVerifying: "सत्यापन किया जा रहा है...",
    
    numpadToggleOpen: "टच स्क्रीन कीपैड खोलें",
    numpadToggleClose: "कीपैड बंद करें",
    
    emergencySOS: "आपातकालीन / सहायता बटन",
    kioskLocation: "कियोस्क आईडी: OPD-GATE-02 • सरकारी अस्पताल",
    dpdpBadge: "DPDP अधिनियम 2023 और ABDM प्रमाणित • पूर्ण सुरक्षित",
    
    otpModalTitle: "सुरक्षा ओटीपी दर्ज करें",
    otpModalSubtitle: "आपके पंजीकृत मोबाइल पर भेजा गया 6 अंकों का कोड दर्ज करें",
    otpDemoCode: "डेमो ओटीपी 123456 है",
    verifyOtpBtn: "ओटीपी सत्यापित करें",
    resendOtp: "ओटीपी पुनः भेजें",
    
    scanFingerTitle: "बायोमेट्रिक फिंगरप्रिंट स्कैनर",
    scanFingerInstruction: "कृपया अपना अंगूठा नीचे चमक रहे स्कैनर सेंसर पर रखें",
    scanningText: "फिंगरप्रिंट स्कैन हो रहा है...",
    matchSuccess: "बायोमेट्रिक मिलान सफल! रिकॉर्ड प्राप्त हो रहे हैं...",
    
    validationErrorRequired: "कृपया अपनी आभा आईडी या आधार नंबर दर्ज करें",
    validationErrorAbha: "कृपया 14 अंकों का वैध आभा नंबर दर्ज करें",
    validationErrorAadhaar: "कृपया 12 अंकों का वैध आधार नंबर दर्ज करें",
    validationErrorEmail: "कृपया एक मान्य ईमेल पता दर्ज करें (उदा. name@example.com)",
    validationErrorConsent: "आगे बढ़ने के लिए कृपया सहमति बॉक्स को चेक करें",
  },

  marathi: {
    hospitalName: "मेडीकियोस्क",
    kioskTagline: "आयुष्मान भारत डिजिटल आरोग्य किऑस्क",
    welcomeTitle: "रुग्णालय चेक-इन आणि ओपीडी किऑस्क",
    welcomeSubtitle: "जुने रुग्ण त्वरित ओपीडी टोकनसाठी १४-अंकी आभा कार्ड किंवा १२-अंकी आधार क्रमांकाने लॉगिन करा.",
    audioButtonText: "सूचना ऐकण्यासाठी येथे स्पर्श करा",
    audioPlayingText: "मराठी सूचना ऐकवल्या जात आहेत...",
    
    // Pure, clear, authentic spoken Marathi
    speechIntro: "मेडीकियोस्क मध्ये आपले स्वागत आहे. जुन्या रुग्णांनी त्वरित चेक-इनसाठी चौदा अंकी आभा नंबर किंवा बारा अंकी आधार नंबर टाकावा. नवीन रुग्णांनी नवीन रुग्ण नोंदणी बटनावर स्पर्श करावा.",
    speechAbha: "तुम्ही आभा कार्ड निवडले आहे. कृपया आपला चौदा अंकी आयुष्मान भारत आभा क्रमांक टाईप करा.",
    speechAadhaar: "तुम्ही आधार कार्ड निवडले आहे. कृपया आपला बारा अंकी आधार क्रमांक टाईप करा, किंवा बायोमेट्रिक स्कॅनरवर अंगठा ठेवा.",
    speechEmail: "आपण ईमेल आयडी निवडला आहे. कृपया आपला नोंदणीकृत ईमेल पत्ता प्रविष्ट करा.",
    speechNew: "नवीन रुग्ण नोंदणी सुरू झाली आहे. आपण आधार कार्ड, आभा कार्ड किंवा साध्या फॉर्म द्वारे नोंदणी करू शकता.",
    speechConsent: "आपली सर्व आरोग्य माहिती डिजिटल डेटा संरक्षण कायद्यानुसार पूर्ण सुरक्षित राहील.",
    
    existingPatientTitle: "जुने रुग्ण लॉगिन",
    existingPatientSubtitle: "त्वरित ओपीडी चेक-इनसाठी आभा कार्ड किंवा आधार नंबर टाका",

    tabAbha: "आभा कार्ड",
    tabAbhaDesc: "१४-अंकी आरोग्य कार्ड",
    tabAadhaar: "आधार कार्ड",
    tabAadhaarDesc: "१२-अंकी / ठसा",
    tabEmail: "ईमेल आयडी",
    tabEmailDesc: "नोंदणीकृत ईमेल",
    tabManual: "प्राथमिक माहिती",
    tabManualDesc: "थेट फॉर्म",

    labelAbha: "१४ अंकी आभा (ABHA) क्रमांक टाका",
    labelAadhaar: "१२ अंकी आधार क्रमांक टाका",
    labelEmail: "नोंदणीकृत ईमेल पत्ता प्रविष्ट करा",
    placeholderAbha: "14-8892-4412-9031",
    placeholderAadhaar: "5481 9023 1184",
    placeholderEmail: "उदा. ramesh.sharma@abdm.gov.in",
    
    quickDemoAbha: "डेमो आभा भरा",
    quickDemoAadhaar: "डेमो आधार भरा",
    quickDemoEmail: "डेमो ईमेल भरा",
    biometricScanBtn: "बायोमेट्रिक फिंगरप्रिंट स्कॅनर वापरा",

    newPatientBannerTitle: "नवीन रुग्ण नोंदणी",
    newPatientBannerDesc: "तुम्ही पहिल्यांदाच येत आहात का? आधार, अस्तित्वातील आभा किंवा साध्या माहितीसह २ मिनिटांत नवीन नोंदणी करा.",
    newPatientBullet1: "आधार ई-केवायसी किंवा अंगठ्याचा ठसा",
    newPatientBullet2: "१४-अंकी डिजिटल आभा आयडी निर्मिती",
    newPatientBullet3: "कागदाविना डिजिटल ओपीडी टोकन",

    consentLabel: "मी ABDM आणि DPDP कायदा २०२३ अंतर्गत माझ्या आरोग्य माहितीच्या सुरक्षित वापरास संमती देतो/देते.",
    hearDetails: "तपशील ऐका",
    viewDetails: "नियम पहा",

    btnContinue: "सत्यापित करा आणि टोकन मिळवा",
    btnStartReg: "नवीन रुग्ण नोंदणी सुरू करा",
    btnVerifying: "माहिती तपासली जात आहे...",
    
    numpadToggleOpen: "स्क्रीन कीपॅड उघडा",
    numpadToggleClose: "कीपॅड बंद करा",
    
    emergencySOS: "तातडीची मदत / सहाय्य",
    kioskLocation: "किऑस्क आयडी: OPD-GATE-02 • जिल्हा सामान्य रुग्णालय",
    dpdpBadge: "DPDP कायदा २०२३ आणि ABDM प्रमाणित • पूर्ण सुरक्षित",
    
    otpModalTitle: "सुरक्षा ओटीपी टाका",
    otpModalSubtitle: "तुमच्या नोंदणीकृत मोबाईलवर पाठवलेला ६-अंकी कोड टाका",
    otpDemoCode: "डेमो ओटीपी 123456 आहे",
    verifyOtpBtn: "ओटीपी तपासा",
    resendOtp: "पुन्हा पाठवा",
    
    scanFingerTitle: "बायोमेट्रिक फिंगरप्रिंट स्कॅनर",
    scanFingerInstruction: "कृपया तुमचा अंगठा खालील स्कॅनर सेंसरवर घट्ट ठेवा",
    scanningText: "ठसा स्कॅन केला जात आहे...",
    matchSuccess: "बायोमेट्रिक यशस्वी! आरोग्य माहिती लोड होत आहे...",
    
    validationErrorRequired: "कृपया आपली आभा आयडी किंवा आधार क्रमांक प्रविष्ट करा",
    validationErrorAbha: "कृपया १४ अंकी वैध आभा क्रमांक टाका",
    validationErrorAadhaar: "कृपया १२ अंकी वैध आधार क्रमांक टाका",
    validationErrorEmail: "कृपया वैध ईमेल पत्ता प्रविष्ट करा (उदा. name@example.com)",
    validationErrorConsent: "पुढे जाण्यासाठी कृपया संमती द्या",
  }
};
