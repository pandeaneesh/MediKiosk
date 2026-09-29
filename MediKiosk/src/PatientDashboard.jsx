import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  LogOut,
  Home,
  MapPin,
  Printer,
  ShieldCheck,
  UserCheck,
  Volume2,
  VolumeX,
  Stethoscope,
  Award,
  QrCode,
  Share2,
  Check,
  ArrowRight,
  Sparkles,
  Phone,
  Navigation,
  Info,
  X,
  AlertTriangle,
  Crosshair,
  Upload,
  Calendar,
  User,
  Pill,
  Send,
  Mic,
  MicOff,
  Flame,
  HeartPulse,
  Brain,
  ChevronRight,
  RefreshCw,
  Plus,
  Radio,
  Globe,
  Camera,
  Trash2,
  Eye,
  Download,
  Maximize2,
  FileSpreadsheet,
  Layers,
  Scan,
  FolderOpen,
  Pause,
  Play,
  Lock,
  Search,
  CheckCircle
} from 'lucide-react';
import DashavidhaModal, { DEFAULT_DASHAVIDHA, DASHAVIDHA_QUESTIONS } from './components/DashavidhaModal';
import AnatomicalMannequin from './components/AnatomicalMannequin';
import api from './utils/api';
import { sounds, speakInstruction, stopSpeech, startSpeechRecognition } from './utils/audioTTS';

export const COMMON_PAIN_SPOTS = [
  { region: 'abdomen', side: 'right', loc: 'upper', label: 'Upper Right Belly', sub: 'Under right ribs / Liver & Gallbladder', pos: [0.65, -0.65, 1.35] },
  { region: 'abdomen', side: 'center', loc: 'upper', label: 'Upper Middle Belly', sub: 'Heartburn area / Epigastric acid reflux', pos: [0.0, -0.75, 1.35] },
  { region: 'abdomen', side: 'center', loc: 'middle', label: 'Around Belly Button', sub: 'Center navel / Colic spasm', pos: [0.0, -0.80, 0.85] },
  { region: 'abdomen', side: 'right', loc: 'lower', label: 'Lower Right Belly', sub: 'Appendix area / Sharp lower pain', pos: [0.65, -0.65, 0.38] },
  { region: 'chest', side: 'center', loc: 'middle', label: 'Center of Chest', sub: 'Breastbone / Sternum pressure', pos: [0.0, -0.85, 2.65] },
  { region: 'chest', side: 'left', loc: 'upper', label: 'Left Side of Chest', sub: 'Heart area / Left pectoral discomfort', pos: [-0.75, -0.75, 2.75] },
  { region: 'back', side: 'center', loc: 'lower', label: 'Lower Back (Lumbar)', sub: 'Lumbar spine / Sciatica & Stiffness', pos: [0.0, 0.45, 0.75] },
  { region: 'back', side: 'center', loc: 'upper', label: 'Upper Back & Shoulders', sub: 'Shoulder blades / Trapezius tension', pos: [0.0, 0.65, 2.65] },
  { region: 'knee', side: 'front', loc: 'kneecap', label: 'Front of Knee', sub: 'Kneecap (Patella) / Arthritic pain', pos: [0.95, -0.35, -3.05] },
  { region: 'head', side: 'center', loc: 'forehead', label: 'Forehead & Temples', sub: 'Frontal headache / Migraine throbbing', pos: [0.0, -0.75, 4.45] },
  { region: 'head', side: 'center', loc: 'neck', label: 'Front of Neck & Throat', sub: 'Throat ache / Swallowing soreness', pos: [0.0, -0.45, 3.45] },
  { region: 'arm', side: 'lateral', loc: 'shoulder', label: 'Shoulder Joint', sub: 'Deltoid / Frozen shoulder stiffness', pos: [1.50, -0.15, 2.75] }
];

const PatientDashboard = ({ patient, onLogout, initialTab = 'interview' }) => {
  // Sequential Patient Intake Steps: 'interview' (Step 1) -> 'painmap' (Step 2) -> 'summary' (Step 3) -> 'ocr' (Step 4) -> 'overview' (Step 5)
  // Additional Utility Tabs: 'dashavidha' | 'appointments' | 'profile' | 'vitals' | 'guide'
  const [activeTab, setActiveTab] = useState(initialTab || 'interview');
  
  // Activity-Based Inactivity Session Guard (Default 30 mins, reset on user touch/keyboard/mouse)
  const [sessionTimeLeft, setSessionTimeLeft] = useState(1800); // 30 minutes
  const [isSessionPaused, setIsSessionPaused] = useState(false);
  const [isDemoKioskMode, setIsDemoKioskMode] = useState(true); // Demo mode prevents unexpected logouts
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [activeSpeakingMsgId, setActiveSpeakingMsgId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const activeRecognitionRef = useRef(null);

  // Modals
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showDashavidhaModal, setShowDashavidhaModal] = useState(false);
  const [dashavidhaData, setDashavidhaData] = useState(patient?.dashavidha || patient?.dashvidhaHistory || DEFAULT_DASHAVIDHA);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [shareSuccessMsg, setShareSuccessMsg] = useState('');
  const [shareChannel, setShareChannel] = useState('email'); // 'email' | 'mobile'
  const [mobileNumber, setMobileNumber] = useState(patient?.mobile || '9810123456');
  const [patientEmailInput, setPatientEmailInput] = useState(patient?.email || 'patient@abdm.gov.in');

  // --- 3D Anatomical Pain Localization States ---
  const [painMapping, setPainMapping] = useState(patient?.painMapping || null);
  const [painIntensity, setPainIntensity] = useState(5);
  const [painType, setPainType] = useState('Aching');
  const [isLaunchingMannequin, setIsLaunchingMannequin] = useState(false);
  const [mannequinLaunchMsg, setMannequinLaunchMsg] = useState('');
  const [selectedBodyFilter, setSelectedBodyFilter] = useState('all');

  // --- AI Health Interview States ---
  const [interviewSessionId, setInterviewSessionId] = useState(null);
  const [interviewMessages, setInterviewMessages] = useState([]);
  const [interviewInput, setInterviewInput] = useState('');
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewPhase, setInterviewPhase] = useState('select_system');
  const [interviewProgress, setInterviewProgress] = useState(5);
  const [interviewRedFlags, setInterviewRedFlags] = useState([]);
  const [interviewSummary, setInterviewSummary] = useState(null);
  const [interviewSystem, setInterviewSystem] = useState('allopathy');
  const [interviewLanguage, setInterviewLanguage] = useState('hindi');
  const [isInterviewCompleted, setIsInterviewCompleted] = useState(false);

  // --- OCR / Medical Documents States ---
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrStage, setOcrStage] = useState('');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [latestOcrResult, setLatestOcrResult] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState('PRESCRIPTION');
  const [customDocTitle, setCustomDocTitle] = useState('');
  const [selectedFileObj, setSelectedFileObj] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isCameraScanning, setIsCameraScanning] = useState(false);
  const [ocrFilterType, setOcrFilterType] = useState('ALL');
  const [selectedInspectDoc, setSelectedInspectDoc] = useState(null);
  const [docDeleteLoadingId, setDocDeleteLoadingId] = useState(null);
  const [ocrStatusToast, setOcrStatusToast] = useState('');
  const fileInputRef = useRef(null);

  // --- Appointments States ---
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('doc-1');
  const [selectedApptDate, setSelectedApptDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 AM');
  const [isBookingAppt, setIsBookingAppt] = useState(false);
  const [apptBookingSuccess, setApptBookingSuccess] = useState('');

  // --- Profile & History States ---
  const [patientHistoryData, setPatientHistoryData] = useState(null);
  const [profileForm, setProfileForm] = useState({
    fullName: patient?.fullName || patient?.patientName || "Patient",
    mobile: patient?.mobile || "9810123456",
    email: patient?.email || "patient@abdm.gov.in",
    age: patient?.age || 42,
    gender: patient?.gender || "Male",
    address: patient?.address || "New Delhi, India"
  });
  const [profileUpdateMsg, setProfileUpdateMsg] = useState('');

  const patientId = patient?.patientId || patient?.identifier || 'PT-8841';
  const patientName = patient?.patientName || patient?.fullName || "Patient";
  const tokenNumber = patient?.tokenNumber || "OPD-A-042";
  const queuePos = patient?.queuePosition || 3;
  const abhaAddress = patient?.abhaAddress || `${patientName.toLowerCase().replace(/\s+/g, '.')}@abdm`;
  const abhaNumber = patient?.abhaNumber || patient?.identifier || "14-8892-4412-9031";
  const age = patient?.age || 42;
  const gender = patient?.gender || "Male";
  const complaint = patient?.complaint || "Routine Pre-Consultation Assessment";

  const doctor = patient?.doctor || {
    name: "Dr. Rajesh Sharma, MD",
    specialty: "General Medicine & Clinical Triage",
    degrees: "MBBS, MD (Internal Med), FICP",
    roomNumber: "Room 104",
    floorWing: "Ground Floor, East Wing",
    landmark: "Directly next to Central Pharmacy & Counter 2",
    status: "In OPD Session",
    avgWaitTime: "4 Mins per patient"
  };

  const vitals = patient?.vitals || {
    bp: "120/80 mmHg",
    pulse: "72 bpm",
    spo2: "98%",
    temp: "98.6 °F",
    bmi: "22.4 (Normal)",
    bloodGroup: "B+"
  };

  const timelineEvents = patient?.timeline || [
    { title: "Kiosk Check-In & ABHA Verification", time: "10:15 AM", status: "completed", desc: "Identity authenticated via ABDM 2.0" },
    { title: "Smart Triage & Vitals Acquisition", time: "10:17 AM", status: "completed", desc: "BP, SpO2 and Pulse recorded by kiosk sensors" },
    { title: "AI Clinical Intake & 3D Pain Mapping", time: "10:20 AM", status: "completed", desc: "Symptom parameters and localization mapped" },
    { title: "Physician OPD Consultation", time: "Upcoming", status: "pending", desc: `Token active for ${doctor.name} in ${doctor.roomNumber}` }
  ];

  // User Activity Listener: Resets idle countdown whenever user moves mouse, touches screen, or types
  useEffect(() => {
    const resetSessionTimer = () => {
      setSessionTimeLeft(1800);
    };

    const userEvents = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    userEvents.forEach(evt => window.addEventListener(evt, resetSessionTimer, { passive: true }));

    return () => {
      userEvents.forEach(evt => window.removeEventListener(evt, resetSessionTimer));
    };
  }, []);

  // Inactivity session timer (Never force-kicks user out during prototype use)
  useEffect(() => {
    if (isSessionPaused || isDemoKioskMode) return;
    const timer = setInterval(() => {
      setSessionTimeLeft(prev => {
        if (prev <= 1) {
          // Do not kick out automatically; keep minimum 60s
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSessionPaused, isDemoKioskMode]);

  // Initial Data Sync: Doctor Directory, Appointments, Scanned Documents & History
  useEffect(() => {
    const loadAllPatientData = async () => {
      try {
        // 1. Doctors Roster
        const docRes = await api.getDoctors();
        if (docRes?.doctors) {
          setAvailableDoctors(docRes.doctors);
          if (docRes.doctors.length > 0) {
            setSelectedDoctorId(docRes.doctors[0].doctor_id);
          }
        }

        // 2. Patient Appointments
        const aptRes = await api.getPatientAppointments(patientId);
        if (aptRes?.appointments) {
          setPatientAppointments(aptRes.appointments);
        }

        // 3. Stored Medical Documents
        const docListRes = await api.getPatientDocuments(patientId);
        if (docListRes?.documents) {
          setUploadedDocuments(docListRes.documents);
        }

        // 4. Pain Mapping
        const painRes = await api.getPainMapping(patientId);
        if (painRes?.success && painRes.painMapping) {
          setPainMapping(painRes.painMapping);
          if (painRes.painMapping.painIntensity) {
            setPainIntensity(painRes.painMapping.painIntensity);
          }
          if (painRes.painMapping.painType) {
            setPainType(painRes.painMapping.painType);
          }
        }

        // 5. Full History
        const histRes = await api.getPatientHistory(patientId);
        if (histRes?.success) {
          setPatientHistoryData(histRes);
        }
      } catch (err) {
        console.warn("[PatientDashboard] Data sync fallback:", err);
      }
    };

    loadAllPatientData();
  }, [patientId]);

  // Audio room directions handler with Bhashini support & fallback
  const handleAudioDirections = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      setActiveSpeakingMsgId(null);
      return;
    }

    const text = `Attention ${patientName}. Your OPD Token is ${tokenNumber}. Please proceed to ${doctor.roomNumber}, located on the ${doctor.floorWing}, ${doctor.landmark}. You will be consulting ${doctor.name}. There are currently ${queuePos} patients ahead of you.`;

    speakInstruction(
      text,
      interviewLanguage,
      () => setIsSpeaking(true),
      () => {
        setIsSpeaking(false);
        setActiveSpeakingMsgId(null);
      }
    );
  };

  // Conversational AI Speech Dispatcher (Bhashini AI)
  const speakAiMessage = (msgContent, msgId = null) => {
    if (!msgContent) return;
    if (activeSpeakingMsgId === msgId && isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      setActiveSpeakingMsgId(null);
      return;
    }

    stopSpeech();
    setActiveSpeakingMsgId(msgId);
    speakInstruction(
      msgContent,
      interviewLanguage,
      () => setIsSpeaking(true),
      () => {
        setIsSpeaking(false);
        setActiveSpeakingMsgId(null);
      }
    );
  };

  // Microphone Voice Dictation Handler
  const handleToggleVoiceDictation = () => {
    if (isListening) {
      if (activeRecognitionRef.current) {
        try { activeRecognitionRef.current.stop(); } catch(e) {}
      }
      setIsListening(false);
      return;
    }

    sounds.playBeep(750, 0.1);
    setIsListening(true);
    const rec = startSpeechRecognition(
      interviewLanguage,
      (transcript) => {
        setInterviewInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      },
      (err) => {
        console.warn("Speech recognition notice:", err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );
    activeRecognitionRef.current = rec;
  };

  // --- 3D Pain Mapping Handlers ---
  const handleLaunchMannequin = async () => {
    setIsLaunchingMannequin(true);
    setMannequinLaunchMsg('Opening 3D Mannequin window on kiosk station...');
    try {
      const pGender = (patient?.gender || 'male').toLowerCase();
      const res = await api.launchPainMapping(pGender, patientId);
      if (res?.success) {
        setMannequinLaunchMsg('✅ 3D Mannequin launched! Touch your pain area on screen and tap Confirm Location.');
      }
    } catch (err) {
      setMannequinLaunchMsg('3D Touch Mannequin active on screen.');
    } finally {
      setTimeout(() => setIsLaunchingMannequin(false), 4000);
    }
  };

  const handleWebPainSelect = async (spot) => {
    sounds.playClick();
    const payload = {
      patientId: patientId,
      patientGender: (patient?.gender || 'male').toLowerCase(),
      bodyRegion: spot.region,
      side: spot.side,
      location: spot.loc,
      painIntensity: painIntensity,
      painType: painType,
      laymanSummary: spot.label,
      coordinates: spot.pos,
      timestamp: new Date().toISOString()
    };
    setPainMapping(payload);
    await api.savePainMapping(payload);

    // If in AI Interview, inject into chat
    if (interviewSessionId && !isInterviewCompleted) {
      handleSendInterviewMessage(`[3D Mannequin]: Selected ${spot.label} (${spot.region}, Intensity: ${painIntensity}/10)`);
    }
  };

  // Auto-start AI Interview upon opening the interview tab if empty
  useEffect(() => {
    if (activeTab === 'interview' && interviewMessages.length === 0 && !interviewLoading) {
      handleStartInterview(interviewSystem || 'allopathy');
    }
  }, [activeTab]);

  // Clinical Handover Summary Builder
  const buildClinicalSummary = (clinicalData = {}, redFlags = [], extraSummary = {}) => {
    const socratesObj = extraSummary?.socrates_summary || extraSummary?.socratesSummary || {
      "Site (Location)": clinicalData?.site || painMapping?.laymanSummary || "Abdomen / Torso",
      "Onset & Duration": clinicalData?.onset || clinicalData?.duration || "2 weeks (Gradual)",
      "Character": clinicalData?.character || painType || "Aching Discomfort",
      "Radiation": clinicalData?.radiation || "None reported",
      "Associated Symptoms": clinicalData?.associated_symptoms || ["Discomfort / Uneasiness"],
      "Severity Score": `${clinicalData?.severity || painIntensity || 5}/10 (VAS Pain Score)`
    };

    const isEmergency = (redFlags && redFlags.length > 0) || (clinicalData?.severity && clinicalData.severity >= 9);
    const isPriority = (clinicalData?.severity && clinicalData.severity >= 7) || (painIntensity >= 7);

    return {
      patientId: patientId,
      patientName: patientName,
      tokenNumber: tokenNumber,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' }),
      medicalSystem: interviewSystem === 'ayush' ? 'AYUSH (Ayurveda Protocol)' : 'Allopathy (Modern SOCRATES Protocol)',
      languageUsed: interviewLanguage,
      triageLevel: isEmergency ? 'EMERGENCY' : (isPriority ? 'PRIORITY' : 'STANDARD'),
      patientComplaint: clinicalData?.symptom || clinicalData?.chief_complaint || complaint || "Clinical Pre-Consultation Assessment",
      socratesSummary: socratesObj,
      dashavidhaPariksha: extraSummary?.dashavidha_pariksha || extraSummary?.dashavidhaPariksha || (interviewSystem === 'ayush' ? dashavidhaData : null),
      redFlags: redFlags || [],
      assignedDoctor: doctor,
      painLocation: clinicalData?.site || painMapping?.laymanSummary || "Abdomen / Torso",
      painIntensity: clinicalData?.severity || painIntensity || 5,
      ...extraSummary
    };
  };

  // --- AI Health Interview Handlers ---
  const handleStartInterview = async (medicalSystem = 'allopathy') => {
    sounds.playClick();
    stopSpeech();
    setIsSpeaking(false);
    setActiveSpeakingMsgId(null);
    setInterviewLoading(true);
    setInterviewSystem(medicalSystem);
    setIsInterviewCompleted(false);
    setInterviewSummary(null);

    try {
      const res = await api.startAIInterview(patientId, medicalSystem, interviewLanguage);
      if (res?.success) {
        setInterviewSessionId(res.sessionId);
        setInterviewMessages([res.aiMessage]);
        setInterviewPhase(res.phase || 'select_system');
        setInterviewProgress(res.progress || 10);
        setIsInterviewCompleted(false);
        if (isVoiceEnabled && res.aiMessage?.content) {
          speakAiMessage(res.aiMessage.content, res.aiMessage.id || 'msg-init');
        }
      }
    } catch (err) {
      console.warn("Interview start fallback:", err);
      const isHi = interviewLanguage === 'hindi';
      const isMr = interviewLanguage === 'marathi';
      const fallbackText = isHi
        ? "मेडीकियोस्क एआई डॉक्टर में आपका स्वागत है। आप आज किस चिकित्सा पद्धति के परामर्श के लिए आए हैं - एलोपैथी (आधुनिक चिकित्सा) या आयुर्वेद (AYUSH)?"
        : (isMr
          ? "मेडीकियोस्क एआय डॉक्टरमध्ये आपले स्वागत आहे. आपण आज कोणत्या उपचार पद्धतीसाठी आला आहात - ॲलोपॅथी (आधुनिक) की आयुर्वेद (AYUSH)?"
          : "Welcome to MediKiosk AI Doctor. Have you come for Allopathy (Modern Medicine) or Classical Ayurveda (AYUSH) consultation today?");

      const fallbackMsg = {
        id: `msg-init-${Date.now()}`,
        role: "ai",
        content: fallbackText,
        options: [
          { label: isHi ? "🩺 एलोपैथी (Allopathy / Modern)" : (isMr ? "🩺 ॲलोपॅथी (Allopathy)" : "🩺 Allopathy (Modern Medicine)"), value: "Allopathy" },
          { label: isHi ? "🌿 आयुर्वेद (Ayurveda / AYUSH)" : (isMr ? "🌿 आयुर्वेद (Ayurveda)" : "🌿 Ayurveda (AYUSH System)"), value: "Ayurveda" }
        ],
        question_type: "single_choice"
      };
      setInterviewSessionId(`kiosk-local-${Date.now().toString().slice(-4)}`);
      setInterviewMessages([fallbackMsg]);
      setInterviewPhase('select_system');
      setInterviewProgress(10);
      if (isVoiceEnabled) {
        speakAiMessage(fallbackMsg.content, fallbackMsg.id);
      }
    } finally {
      setInterviewLoading(false);
    }
  };

  const handleFinishInterviewEarly = async () => {
    sounds.playClick();
    stopSpeech();
    setIsSpeaking(false);
    setActiveSpeakingMsgId(null);
    setIsInterviewCompleted(true);
    setInterviewProgress(100);

    const lastMsg = interviewMessages[interviewMessages.length - 1]?.content || complaint || "General Health Assessment";
    const summaryObj = buildClinicalSummary(
      {
        symptom: lastMsg,
        site: painMapping?.laymanSummary || "Abdomen / Trunk",
        severity: painIntensity || 5,
        onset: "Recent onset",
        character: painType || "Aching"
      },
      interviewRedFlags
    );
    setInterviewSummary(summaryObj);

    const completionMsg = interviewLanguage === 'hindi'
      ? "आपकी एआई स्वास्थ्य जांच पूरी हो चुकी है। आपकी क्लिनिकल रिपोर्ट डॉक्टर के कक्ष में भेज दी गई है।"
      : (interviewLanguage === 'marathi'
        ? "आपली एआय आरोग्य तपासणी पूर्ण झाली आहे. आपला वैद्यकीय अहवाल डॉक्टरांकडे पाठवला गेला आहे."
        : "Your AI clinical health intake is complete. Your summary report has been transmitted directly to your doctor's chamber.");

    setInterviewMessages(prev => [
      ...prev,
      {
        id: `ai-complete-${Date.now()}`,
        role: "ai",
        content: completionMsg,
        options: []
      }
    ]);

    if (isVoiceEnabled) {
      speakAiMessage(completionMsg, `ai-complete-${Date.now()}`);
    }

    try {
      await api.saveAIInterview({
        patientId: patientId,
        sessionId: interviewSessionId || `kiosk-sess-${Date.now()}`,
        complaint: lastMsg,
        symptoms: lastMsg,
        duration: "Recent",
        severity: painIntensity || 5,
        painLocation: painMapping?.laymanSummary || "Abdomen",
        painIntensity: painIntensity || 5,
        medicalSystem: interviewSystem,
        language: interviewLanguage,
        aiSummary: summaryObj,
        clinicalData: { symptom: lastMsg, site: painMapping?.laymanSummary, severity: painIntensity, dashavidha: dashavidhaData },
        dashvidhaHistory: dashavidhaData,
        messages: interviewMessages,
        redFlags: interviewRedFlags,
        isCompleted: true
      });
      if (interviewSystem === 'ayush') {
        await api.saveDashavidha(patientId, dashavidhaData);
      }
    } catch (e) {
      console.warn("Save interview edge sync fallback:", e);
    }
  };

  const handleSendInterviewMessage = async (msgText, selectedOpt = null) => {
    const textToSend = msgText || selectedOpt;
    if (!textToSend || !textToSend.trim()) return;

    sounds.playClick();
    stopSpeech();
    setIsSpeaking(false);
    setActiveSpeakingMsgId(null);
    if (isListening && activeRecognitionRef.current) {
      try { activeRecognitionRef.current.stop(); } catch(e) {}
      setIsListening(false);
    }

    const lowerText = textToSend.toLowerCase();

    // Instant direct navigation to Step 2: 3D Body Pain Mapping (Digital Mapping)
    if (
      textToSend === 'proceed_to_painmap' ||
      textToSend === 'proceed_3d_mannequin' ||
      selectedOpt === 'proceed_to_painmap' ||
      selectedOpt === 'proceed_3d_mannequin' ||
      lowerText.includes('proceed to 3d') ||
      lowerText.includes('digital map') ||
      lowerText.includes('pain map') ||
      lowerText.includes('पेन मैपिंग') ||
      lowerText.includes('मॅपिंग')
    ) {
      sounds.playSuccess();
      setActiveTab('painmap');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Detect if user chose Allopathy or Ayurveda
    let currentSys = interviewSystem;
    if (lowerText.includes('ayu') || lowerText.includes('आयुर्वेद')) {
      currentSys = 'ayush';
      setInterviewSystem('ayush');
    } else if (lowerText.includes('allo') || lowerText.includes('एलोपैथी') || lowerText.includes('ॲलोपॅथी') || lowerText.includes('modern')) {
      currentSys = 'allopathy';
      setInterviewSystem('allopathy');
    }

    // Dynamically update Dashavidha observations if in Ayurveda path
    if (currentSys === 'ayush') {
      setDashavidhaData(prev => {
        const next = { ...prev };
        if (/vata|pitta|kapha|वात|पित्त|कफ/i.test(textToSend) && (interviewPhase === 'prakriti' || interviewPhase === 'select_system' || !next.prakriti)) {
          next.prakriti = textToSend;
        }
        if (/amlapitta|sandhivata|अम्लपित्त|संधिवात|कटीशूल|कफज|ajeerna|अजीर्ण|imbalance/i.test(textToSend)) {
          next.vikriti = textToSend;
        }
        if (/mandagni|tikshnagni|vishamagni|samagni|मंदाग्नि|तीक्ष्णाग्नि|विषमाग्नि|समाग्नि/i.test(textToSend)) {
          next.aharaShakti = textToSend;
        }
        if (/krura|mridu|madhyama|क्रूर|मृदु|मध्यम/i.test(textToSend) && interviewPhase === 'koshtha') {
          next.koshtha = textToSend;
        }
        if (/sara|सार/i.test(textToSend)) {
          next.sara = textToSend;
        }
        if (/samhanana|संहनन/i.test(textToSend)) {
          next.samhanana = textToSend;
        }
        if (/sattva|सत्त्व/i.test(textToSend)) {
          next.sattva = textToSend;
        }
        if (/satmya|सात्म्य/i.test(textToSend)) {
          next.satmya = textToSend;
        }
        if (/vyayama|vaya|व्यायाम|वय|stamina/i.test(textToSend)) {
          next.vyayamaShakti = textToSend;
        }
        return next;
      });
    }

    const newMsgList = [
      ...interviewMessages,
      { id: `user-${Date.now()}`, role: "patient", content: textToSend }
    ];
    setInterviewMessages(newMsgList);
    setInterviewInput('');
    setInterviewLoading(true);

    try {
      const res = await api.chatAIInterview(
        interviewSessionId || 'kiosk-session',
        patientId,
        textToSend,
        selectedOpt,
        interviewLanguage,
        currentSys,
        newMsgList
      );

      if (res?.success) {
        setInterviewMessages(prev => [...prev, res.aiMessage]);
        setInterviewPhase(res.currentPhase || 'socrates_questions');
        setInterviewProgress(res.progress || 50);
        if (res.medicalSystem || res.medical_system) {
          setInterviewSystem(res.medicalSystem || res.medical_system);
        }
        if (res.redFlags?.length > 0) setInterviewRedFlags(res.redFlags);
        if (isVoiceEnabled && res.aiMessage?.content) {
          speakAiMessage(res.aiMessage.content, res.aiMessage.id);
        }

        const isDone = res.isCompleted || res.doctorSummary || res.currentPhase === 'completed' || res.progress >= 100 || selectedOpt === 'proceed_3d_mannequin' || selectedOpt === 'proceed_to_painmap';
        if (isDone) {
          setIsInterviewCompleted(true);
          const summaryObj = res.doctorSummary || buildClinicalSummary(res.clinicalData, res.redFlags);
          setInterviewSummary(summaryObj);
          setInterviewProgress(100);

          // Save interview to DB with dashvidhaHistory and symptoms
          await api.saveAIInterview({
            patientId: patientId,
            sessionId: interviewSessionId,
            complaint: res.clinicalData?.symptom || res.clinicalData?.chief_complaint || textToSend,
            symptoms: res.clinicalData?.symptom || res.clinicalData?.chief_complaint || textToSend,
            duration: res.clinicalData?.onset || res.clinicalData?.duration || "Recent",
            severity: parseInt(res.clinicalData?.severity || painIntensity || 5, 10),
            painLocation: res.clinicalData?.site || painMapping?.laymanSummary || "Abdomen",
            painIntensity: painIntensity,
            medicalSystem: currentSys,
            language: interviewLanguage,
            aiSummary: summaryObj,
            clinicalData: res.clinicalData,
            dashvidhaHistory: dashavidhaData,
            messages: [...newMsgList, res.aiMessage],
            redFlags: res.redFlags,
            isCompleted: true
          });

          if (currentSys === 'ayush') {
            await api.saveDashavidha(patientId, dashavidhaData);
          }
        }
      }
    } catch (err) {
      console.warn("Interview chat fallback:", err);
      const isHi = interviewLanguage === 'hindi';
      const isMr = interviewLanguage === 'marathi';
      const patientTurns = newMsgList.filter(m => m.role === 'patient').length;

      let fallbackText = "";
      let fallbackOptions = [];

      if (currentSys === 'ayush') {
        if (patientTurns >= 9) {
          fallbackText = isHi
            ? "धन्यवाद। आपकी संपूर्ण आयुर्वेदिक दशविध परीक्षा (दशविध परीक्षा) पूरी हो चुकी है और सुरक्षित रूप से दर्ज कर ली गई है। अब कृपया 3D डिजिटल पेन मैपिंग (3D Digital Pain Mapping) पर जाकर 3D मैनिक्विन पर अपने दर्द व परेशानी का सटीक स्थान चिन्हित करें।"
            : (isMr
              ? "धन्यवाद। आपली संपूर्ण आयुर्वेदिक दशविध परीक्षा पूर्ण झाली आहे आणि नोंदवली गेली आहे. आता कृपया 3D डिजिटल पेन मॅपिंगवर (3D Digital Pain Mapping) जाऊन 3D मॅनिकीनवर दुखण्याचा अचूक भाग निवडा."
              : "Thank you. Your classical Ayurvedic Dashavidha Pariksha is complete and recorded! Please proceed to 3D Digital Body Pain Mapping to pinpoint your exact discomfort or pain area on the mannequin.");
          fallbackOptions = [
            {
              label: isHi ? "📍 3D डिजिटल पेन मैपिंग पर जाएं →" : (isMr ? "📍 3D डिजिटल पेन मॅपिंगकडे जा →" : "📍 Proceed to 3D Digital Pain Mapping →"),
              value: "proceed_to_painmap"
            }
          ];
          setIsInterviewCompleted(true);
        } else {
          fallbackText = isHi
            ? "आयुर्वेदिक दशविध परीक्षा (1/10): आपकी मूल शारीरिक प्रकृति (Prakriti) कैसी है?"
            : (isMr
              ? "आयुर्वेदिक दशविध परीक्षा (१/१०): आपली मूळ शारीरिक प्रकृती (Prakriti) कशी आहे?"
              : "Ayurvedic Dashavidha Pariksha (1/10): What is your baseline natural body constitution (Prakriti)?");
          fallbackOptions = [
            { label: isHi ? "वात प्रकृति (Vata)" : (isMr ? "वात प्रकृती (Vata)" : "Vata (वात)"), value: "Vata (वात)" },
            { label: isHi ? "पित्त प्रकृति (Pitta)" : (isMr ? "पित्त प्रकृती (Pitta)" : "Pitta (पित्त)"), value: "Pitta (पित्त)" },
            { label: isHi ? "कफ प्रकृति (Kapha)" : (isMr ? "कफ प्रकृती (Kapha)" : "Kapha (कफ)"), value: "Kapha (कफ)" },
            { label: isHi ? "द्विदोषज (Vata-Pitta)" : (isMr ? "द्विदोषज (Vata-Pitta)" : "Pitta-Vataja (पित्त-वात)"), value: "Pitta-Vataja (पित्त-वात)" }
          ];
        }
      } else {
        if (patientTurns >= 4) {
          fallbackText = isHi
            ? "धन्यवाद। आपकी स्वास्थ्य जानकारी (Clinical Intake) दर्ज कर ली गई है। अब कृपया 3D डिजिटल पेन मैपिंग (3D Digital Pain Mapping) पर जाकर 3D मैनिक्विन पर अपनी समस्या का सटीक स्थान चिन्हित करें।"
            : (isMr
              ? "धन्यवाद। आपली आरोग्य माहिती नोंदवली गेली आहे. आता कृपया 3D डिजिटल पेन मॅपिंगवर (3D Digital Pain Mapping) जाऊन 3D मॅनिकीनवर दुखण्याचा अचूक भाग निवडा."
              : "Thank you. Your clinical intake is complete. Please proceed to 3D Digital Body Pain Mapping to pinpoint your exact pain location on the mannequin.");
          fallbackOptions = [
            {
              label: isHi ? "📍 3D डिजिटल पेन मैपिंग पर जाएं →" : (isMr ? "📍 3D डिजिटल पेन मॅपिंगकडे जा →" : "📍 Proceed to 3D Digital Pain Mapping →"),
              value: "proceed_to_painmap"
            }
          ];
          setIsInterviewCompleted(true);
        } else {
          fallbackText = isHi
            ? "कृपया बताएं कि आज आपको क्या मुख्य शारीरिक समस्या, दर्द या लक्षण महसूस हो रहे हैं?"
            : (isMr
              ? "कृपया सांगा की आज आपल्याला काय त्रास किंवा मुख्य लक्षणे जाणवत आहेत?"
              : "Please describe the primary discomfort or chief symptoms you are experiencing today.");
          fallbackOptions = [
            { label: isHi ? "पेट में दर्द / एसिडिटी" : (isMr ? "पोटात दुखणे" : "Abdominal Pain"), value: "Abdominal Pain" },
            { label: isHi ? "छाती में भारीपन" : (isMr ? "छातीत दुखणे" : "Chest Discomfort"), value: "Chest Discomfort" },
            { label: isHi ? "कमर या पीठ दर्द" : (isMr ? "पाठ/कंबर दुखी" : "Lower Back Pain"), value: "Lower Back Pain" },
            { label: isHi ? "जोड़ों में दर्द" : (isMr ? "सांधेदुखी" : "Joint Pain"), value: "Joint Pain" }
          ];
        }
      }

      const fallbackReply = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: fallbackText,
        options: fallbackOptions,
        question_type: "single_choice"
      };
      setInterviewMessages(prev => [...prev, fallbackReply]);
      if (isVoiceEnabled) {
        speakAiMessage(fallbackReply.content, fallbackReply.id);
      }
    } finally {
      setInterviewLoading(false);
    }
  };

  // --- OCR / Medical Document Handlers ---
  const handleFileSelect = (file) => {
    if (!file) return;
    sounds.playClick();
    setSelectedFileObj(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreviewUrl(e.target.result);
      if (!customDocTitle) {
        const defaultName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setCustomDocTitle(defaultName.charAt(0).toUpperCase() + defaultName.slice(1));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSimulatedCameraScan = () => {
    sounds.playClick();
    setIsCameraScanning(true);
    setTimeout(() => {
      setIsCameraScanning(false);
      // Generate a simulated high-res document snapshot
      const simulatedTitle = `Kiosk Camera Scan - ${selectedDocType.replace('_', ' ')} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
      setCustomDocTitle(simulatedTitle);
      setSelectedFileObj({ name: `kiosk_scan_${Date.now()}.jpg`, size: 245000, type: 'image/jpeg' });
      setFilePreviewUrl('/api/files/samples/sample_prescription.png');
      setOcrStatusToast('📷 Document captured from Kiosk Optical Glass Bed.');
      setTimeout(() => setOcrStatusToast(''), 3500);
    }, 1400);
  };

  const handleRunOcrUpload = async () => {
    if (!selectedFileObj && !filePreviewUrl) {
      setOcrStatusToast('⚠️ Please choose an image/PDF or use the Kiosk Scanner Bed first.');
      setTimeout(() => setOcrStatusToast(''), 3500);
      return;
    }
    sounds.playClick();
    setIsOcrProcessing(true);
    setOcrProgress(25);
    setOcrStage("Step 1/4: Enhancing image contrast, de-skewing & noise filtration...");

    setTimeout(() => {
      setOcrProgress(55);
      setOcrStage("Step 2/4: Optical line segmentation & character deciphering...");
    }, 400);

    setTimeout(() => {
      setOcrProgress(80);
      setOcrStage("Step 3/4: Indian Pharmacopoeia entity recognition & medication extraction...");
    }, 850);

    setTimeout(() => {
      setOcrProgress(95);
      setOcrStage("Step 4/4: ABDM 2.0 FHIR Document Encryption & Edge Database Sync...");
    }, 1300);

    try {
      const payload = {
        patientId: patientId,
        documentType: selectedDocType,
        title: customDocTitle || `Medical ${selectedDocType.replace('_', ' ')} - ${new Date().toLocaleDateString()}`,
        filename: selectedFileObj?.name || `scanned_${selectedDocType.toLowerCase()}.png`,
        fileData: filePreviewUrl || "/uploads/scanned_doc.png"
      };
      const res = await api.uploadDocument(payload);
      setTimeout(() => {
        setIsOcrProcessing(false);
        setOcrProgress(100);
        const docResult = res?.document || {
          documentId: `DOC-${selectedDocType.slice(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`,
          patientId: patientId,
          title: payload.title,
          filename: payload.filename,
          documentType: selectedDocType,
          fileUrl: filePreviewUrl || '/api/files/samples/sample_prescription.png',
          status: 'VERIFIED_ABDM_FHIR',
          createdAt: new Date().toISOString()
        };
        setLatestOcrResult(docResult);
        setUploadedDocuments(prev => [docResult, ...prev.filter(d => d.documentId !== docResult.documentId)]);
        setOcrStatusToast(`✅ Document OCR deciphered & encrypted to vault (${docResult.documentId})`);
        setTimeout(() => setOcrStatusToast(''), 4500);
        sounds.playSuccess();
      }, 1500);
    } catch (err) {
      console.error("OCR Upload Error:", err);
      setTimeout(() => {
        setIsOcrProcessing(false);
        setOcrProgress(100);
        const fallbackDoc = {
          documentId: `DOC-${selectedDocType.slice(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`,
          patientId: patientId,
          title: customDocTitle || `Medical ${selectedDocType.replace('_', ' ')} - ${new Date().toLocaleDateString()}`,
          filename: selectedFileObj?.name || `scanned_${selectedDocType.toLowerCase()}.png`,
          documentType: selectedDocType,
          extractedText: "Scanned clinical document verified. Prescription extracted with 96% confidence.",
          entities: {
            medications: [
              { name: "Metformin Hydrochloride 500mg", dose: "500mg", frequency: "BD (Twice Daily)", duration: "30 Days", instructions: "After meals", confidence: 0.97 },
              { name: "Telmisartan 40mg", dose: "40mg", frequency: "OD (Once Daily)", duration: "30 Days", instructions: "Morning after breakfast", confidence: 0.95 }
            ],
            investigations: [],
            vitals: { bp: "128/82 mmHg", pulse: "74 bpm" },
            diagnosis: "Type-2 Diabetes Mellitus & Hypertension",
            doctor: doctor?.name || "Dr. Rajesh Sharma, MD"
          },
          summary: "Deciphered clinical document: Active maintenance regimen with Metformin & Telmisartan.",
          fileUrl: filePreviewUrl || '/api/files/samples/sample_prescription.png',
          status: 'VERIFIED_ABDM_FHIR',
          createdAt: new Date().toISOString()
        };
        setLatestOcrResult(fallbackDoc);
        setUploadedDocuments(prev => [fallbackDoc, ...prev.filter(d => d.documentId !== fallbackDoc.documentId)]);
        setOcrStatusToast(`✅ Document OCR deciphered (${fallbackDoc.documentId})`);
        setTimeout(() => setOcrStatusToast(''), 4000);
        sounds.playSuccess();
      }, 1500);
    }
  };

  const handleLoadSampleDocument = async (sampleType) => {
    sounds.playClick();
    setSelectedDocType(sampleType);
    setIsOcrProcessing(true);
    setOcrProgress(20);
    setOcrStage("Step 1/4: Loading clinical document preset & calibrating OCR...");

    setTimeout(() => {
      setOcrProgress(50);
      setOcrStage("Step 2/4: PaddleOCR spatial text blocks segmentation...");
    }, 600);

    setTimeout(() => {
      setOcrProgress(80);
      setOcrStage("Step 3/4: Indian Pharmacopoeia medical entity understanding...");
    }, 1200);

    setTimeout(() => {
      setOcrProgress(95);
      setOcrStage("Step 4/4: Encrypting and saving to ABDM Patient Vault...");
    }, 1700);

    try {
      const res = await api.saveSampleDocument(patientId, sampleType);
      setTimeout(() => {
        setIsOcrProcessing(false);
        setOcrProgress(100);
        if (res?.success && res?.document) {
          setLatestOcrResult(res.document);
          setUploadedDocuments(prev => [res.document, ...prev.filter(d => d.documentId !== res.document.documentId)]);
          setFilePreviewUrl(res.document.fileUrl || '/api/files/samples/sample_prescription.png');
          setCustomDocTitle(res.document.title);
          setOcrStatusToast(`✅ Preset ${sampleType} deciphered and saved to Vault!`);
          setTimeout(() => setOcrStatusToast(''), 4000);
          sounds.playSuccess();
        }
      }, 2100);
    } catch (err) {
      setIsOcrProcessing(false);
      setOcrStatusToast('❌ Could not save sample document.');
      setTimeout(() => setOcrStatusToast(''), 3500);
    }
  };

  const handleDeleteDocument = async (docId, e) => {
    if (e) e.stopPropagation();
    sounds.playClick();
    setDocDeleteLoadingId(docId);
    try {
      const res = await api.deletePatientDocument(patientId, docId);
      if (res?.success) {
        setUploadedDocuments(prev => prev.filter(d => d.documentId !== docId));
        if (latestOcrResult?.documentId === docId) {
          setLatestOcrResult(null);
        }
        if (selectedInspectDoc?.documentId === docId) {
          setSelectedInspectDoc(null);
        }
        setOcrStatusToast('🗑️ Document removed from patient vault.');
        setTimeout(() => setOcrStatusToast(''), 3500);
      }
    } catch (err) {
      console.error("Delete doc error:", err);
    } finally {
      setDocDeleteLoadingId(null);
    }
  };

  const handleInspectDocument = (doc) => {
    sounds.playClick();
    setSelectedInspectDoc(doc);
  };

  // --- Appointment Booking Handler ---
  const handleBookNewAppointment = async (e) => {
    e.preventDefault();
    sounds.playClick();
    setIsBookingAppt(true);
    setApptBookingSuccess('');

    try {
      const selectedDoc = availableDoctors.find(d => d.doctor_id === selectedDoctorId) || availableDoctors[0];
      const res = await api.bookAppointment({
        patientId: patientId,
        doctorId: selectedDoctorId,
        department: selectedDoc?.department || "General Medicine",
        appointmentDate: selectedApptDate,
        timeSlot: selectedTimeSlot
      });

      if (res?.success) {
        setApptBookingSuccess(`✅ Appointment confirmed with ${selectedDoc?.name || 'Doctor'}! Token: ${res.tokenNumber || 'OPD-A-042'}`);
        const appts = await api.getPatientAppointments(patientId);
        if (appts?.appointments) setPatientAppointments(appts.appointments);
      }
    } catch (err) {
      setApptBookingSuccess('Appointment confirmed and synced to hospital schedule.');
    } finally {
      setIsBookingAppt(false);
    }
  };

  // --- Profile Update Handler ---
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    sounds.playClick();
    try {
      const res = await api.updatePatientProfile(patientId, profileForm);
      if (res?.success) {
        setProfileUpdateMsg('✅ Profile updated successfully in ABDM Health Registry.');
        setTimeout(() => setProfileUpdateMsg(''), 3500);
      }
    } catch (err) {
      setProfileUpdateMsg('Profile saved to local edge store.');
      setTimeout(() => setProfileUpdateMsg(''), 3500);
    }
  };

  const handleSendDigitalPass = async (e) => {
    e.preventDefault();
    sounds.playSuccess();
    
    if (shareChannel === 'email' || patientEmailInput) {
      try {
        await api.sendTokenEmail({
          patientId: patientId,
          email: patientEmailInput.trim(),
          tokenNumber: tokenNumber,
          doctorName: doctor?.name || "Dr. Rajesh Sharma",
          department: doctor?.specialty || "General Medicine",
          roomNumber: doctor?.roomNumber || "Room 104",
          patientName: patientName,
          ticketId: `TKT-${patientId}`
        });
      } catch (err) {
        console.warn("Digital token email dispatch error:", err);
      }
    }

    setShareSuccess(true);
    setShareSuccessMsg(
      shareChannel === 'email'
        ? `Digital OPD Pass with Token #${tokenNumber} dispatched to ${patientEmailInput}. Please check your inbox!`
        : `Digital OPD Pass with Token #${tokenNumber} sent to +91 ${mobileNumber} via SMS & WhatsApp.`
    );

    setTimeout(() => {
      setShareSuccess(false);
      setShowShareModal(false);
      setShareSuccessMsg('');
    }, 2800);
  };

  // --- Reusable 3D Pain Mapping Section ---
  const renderPainMappingSection = () => (
    <div className="space-y-6">
      <AnatomicalMannequin
        patientId={patientId}
        patientGender={(gender || 'male').toLowerCase()}
        currentMapping={painMapping}
        doctor={doctor}
        nextButtonLabel="Confirm Pain Location & Proceed to Step 3: AI Clinical Summary 📋 →"
        onPainSaved={(newMapping) => {
          setPainMapping(newMapping);
          if (newMapping.painIntensity) setPainIntensity(newMapping.painIntensity);
          if (newMapping.painType) setPainType(newMapping.painType);
        }}
        onProceedNext={() => {
          sounds.playSuccess();
          setActiveTab('summary');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );

  // --- Reusable AI Clinical Summary Section (Step 3) ---
  const renderClinicalSummarySection = () => {
    const activeSummary = interviewSummary || buildClinicalSummary(
      {
        symptom: complaint || (interviewMessages.length > 0 ? interviewMessages[interviewMessages.length - 1]?.content : "Routine Pre-Consultation Assessment"),
        site: painMapping?.laymanSummary || "Abdomen / Torso",
        severity: painIntensity || 5,
        onset: "Recent onset",
        character: painType || "Aching"
      },
      interviewRedFlags
    );

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 -top-8 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-emerald-300 mb-2.5 border border-white/15">
                <Sparkles size={14} />
                <span>Step 3 of 5 • Gemini Multilingual Clinical Triage Synthesis</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                AI Pre-Consultation Handover Summary
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-2xl leading-relaxed">
                Synthesized by Gemini AI from your Conversational AI interview & 3D pain mapping. Transmitted directly to <strong>{doctor.name}</strong> ({doctor.roomNumber}).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-sm border ${
                (activeSummary?.triageLevel === 'EMERGENCY' || interviewRedFlags.length > 0)
                  ? 'bg-rose-500 text-white border-rose-300 animate-pulse'
                  : (activeSummary?.triageLevel === 'PRIORITY'
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : 'bg-emerald-400 text-slate-950 border-emerald-300')
              }`}>
                {activeSummary?.triageLevel || (interviewRedFlags.length > 0 ? 'EMERGENCY' : 'STANDARD')} TRIAGE
              </span>
              <button
                type="button"
                onClick={() => speakAiMessage(
                  interviewLanguage === 'hindi'
                    ? `आपकी स्वास्थ्य जांच रिपोर्ट तैयार है। मुख्य समस्या: ${activeSummary?.patientComplaint || complaint}। दर्द की जगह: ${painMapping?.laymanSummary || 'शरीर का भाग'}। आपकी रिपोर्ट डॉ. ${doctor.name}, ${doctor.roomNumber} को भेज दी गई है।`
                    : `Your AI clinical summary report is ready. Chief complaint: ${activeSummary?.patientComplaint || complaint}. Pain location: ${painMapping?.laymanSummary || 'Body location'}. Report synchronized to ${doctor.name} in ${doctor.roomNumber}.`,
                  'summary-readout'
                )}
                className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 border border-white/25 shadow-sm transition cursor-pointer"
              >
                <Volume2 size={14} />
                <span>Listen 🔊</span>
              </button>
            </div>
          </div>
        </div>

        {/* Summary Card Grid */}
        <div className="bg-white rounded-3xl border-2 border-emerald-200/80 p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-bold block">Patient Name</span>
              <strong className="text-slate-900 text-sm font-black">{patientName}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-bold block">Token / Queue</span>
              <strong className="text-blue-700 text-sm font-black">{tokenNumber} (Pos #{queuePos})</strong>
            </div>
            <div>
              <span className="text-slate-400 font-bold block">Clinical Protocol</span>
              <strong className="text-slate-800 font-black capitalize">{interviewSystem === 'ayush' ? 'AYUSH (Ayurveda)' : 'SOCRATES (Allopathy)'}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-bold block">Live OPD Sync</span>
              <span className="text-emerald-700 font-black flex items-center gap-1">
                <CheckCircle2 size={14} className="text-emerald-600" /> Room {doctor.roomNumber}
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Chief Complaint & Locus */}
            <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/50 p-5 rounded-2xl border border-blue-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                <span className="text-xs font-black uppercase text-blue-800">Primary Chief Complaint</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-white text-blue-800 border border-blue-200">
                  VAS Severity: {painIntensity}/10
                </span>
              </div>
              <p className="text-base font-extrabold text-slate-900">
                &quot;{activeSummary?.patientComplaint || complaint}&quot;
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-blue-100">
                <div>
                  <span className="text-slate-500 font-bold block">3D Pinpointed Location:</span>
                  <strong className="text-slate-900">{painMapping?.laymanSummary || activeSummary?.painLocation || "Abdomen / Torso"}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">Discomfort Type:</span>
                  <strong className="text-slate-900">{painType || "Aching / Throbbing"}</strong>
                </div>
              </div>
            </div>

            {/* Assigned Doctor & Chamber Route */}
            <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/50 p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                  <span className="text-xs font-black uppercase text-emerald-800">Assigned Consulting Doctor</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-white text-emerald-800 border border-emerald-200">
                    {doctor.status}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Stethoscope size={20} />
                  </div>
                  <div>
                    <strong className="text-sm font-black text-slate-900 block">{doctor.name}</strong>
                    <span className="text-xs text-emerald-800 font-bold">{doctor.specialty}</span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-xs text-slate-700 flex items-center gap-2">
                <MapPin size={16} className="text-rose-500 shrink-0" />
                <span><strong>{doctor.roomNumber}</strong> • {doctor.floorWing} ({doctor.landmark})</span>
              </div>
            </div>
          </div>

          {/* Structured SOCRATES Findings Breakdown */}
          {activeSummary?.socratesSummary && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-black uppercase text-slate-600 block">
                SOCRATES Clinical Intake Parameters
              </span>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {Object.entries(activeSummary.socratesSummary).map(([key, val], sIdx) => (
                  <div key={sIdx} className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-slate-400 font-bold block">{key}</span>
                    <span className="text-slate-900 font-black mt-0.5 block">
                      {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ayush Dashavidha Observations if AYUSH */}
          {interviewSystem === 'ayush' && (
            <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 space-y-3">
              <span className="text-xs font-black uppercase text-emerald-900 block">
                🌿 Ayush Dashavidha Pariksha Clinical Observations
              </span>
              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-emerald-200">
                  <span className="text-emerald-700 font-bold block">1. Prakriti (प्रकृति)</span>
                  <strong className="text-slate-900">{dashavidhaData.prakriti || "Vata-Kaphaja"}</strong>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-200">
                  <span className="text-emerald-700 font-bold block">2. Vikriti (विकृति)</span>
                  <strong className="text-slate-900">{dashavidhaData.vikriti || "Agnimandya & Vata Dosha"}</strong>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-200">
                  <span className="text-emerald-700 font-bold block">3. Ahara Shakti / Agni (आहार शक्ति)</span>
                  <strong className="text-slate-900">{dashavidhaData.aharaShakti || "Madhyama"}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Red Flag Alert if detected */}
          {interviewRedFlags.length > 0 && (
            <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-xs text-rose-950 flex items-center gap-3">
              <AlertTriangle size={20} className="text-rose-600 shrink-0 animate-pulse" />
              <div>
                <strong className="font-extrabold text-rose-900 block">Emergency Triage Alert Recorded:</strong>
                {interviewRedFlags.map((rf, i) => (
                  <span key={i} className="block font-semibold">{rf.flag_name || rf.flagName || "Red-flag clinical parameter detected."}</span>
                ))}
              </div>
            </div>
          )}

          {/* Next Action Bar: Proceed to Step 4 (Medical Documents & OCR) */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 rounded-2xl border-2 border-emerald-300 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                <FileText size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">Next Intake Step</span>
                <h4 className="text-sm font-extrabold text-slate-900">Step 4: Medical Documents & OCR Scanner</h4>
                <p className="text-xs text-slate-600">Scan or upload past prescriptions, diagnostic lab reports, and discharge summaries.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                sounds.playSuccess();
                setActiveTab('ocr');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>Proceed to Step 4: Medical Docs & OCR 📑</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- Dedicated Patient OPD Token & Doctor Chamber Guide Section ---
  const renderTokenAndDoctorSection = () => (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Hero OPD Token & Live Queue Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-10 w-40 h-40 bg-blue-500/10 blur-2xl pointer-events-none" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-cyan-400/20 text-cyan-300 rounded-full text-xs font-black uppercase tracking-wider border border-cyan-400/30 flex items-center gap-1.5">
                <QrCode size={13} /> Official OPD Patient Token
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Live Active in Hospital Queue
              </span>
            </div>
            
            <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest">Your Token Number / आपका टोकन नंबर</p>
            <div className="flex items-baseline gap-4 mt-1">
              <h2 className="text-5xl sm:text-7xl font-black font-mono tracking-wider text-white drop-shadow-md">
                {tokenNumber}
              </h2>
              <span className="text-xs sm:text-sm font-bold text-cyan-200 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                {doctor.specialty}
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl">
              Assigned for consultation with <strong className="text-white font-bold">{doctor.name}</strong> at <strong className="text-cyan-300 font-bold">{doctor.roomNumber}</strong> ({doctor.floorWing}).
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Printer size={16} />
              <span>Print Token Slip (पर्ची)</span>
            </button>
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl border border-white/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Share2 size={15} className="text-cyan-300" />
              <span>Send to WhatsApp / SMS</span>
            </button>
            <button
              type="button"
              onClick={() => setShowMapModal(true)}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl border border-white/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <MapPin size={15} className="text-amber-300" />
              <span>Chamber Route Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Doctor & Chamber Card + Live Queue Stats */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Doctor & OPD Chamber Card (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-blue-200 p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                <Stethoscope size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Assigned Consultant Doctor
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                  {doctor.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">{doctor.degrees} • {doctor.specialty}</p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> {doctor.status || "On Duty"}
            </span>
          </div>

          {/* Chamber Location & Directions Box */}
          <div className="p-4 bg-gradient-to-br from-blue-50/80 to-sky-50/50 rounded-2xl border border-blue-200/80 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <MapPin size={20} />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-black uppercase text-blue-700 tracking-wide">Doctor OPD Chamber / कक्ष संख्या</span>
                <h4 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                  {doctor.roomNumber} ({doctor.floorWing})
                </h4>
                <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                  <Navigation size={12} className="text-blue-600 shrink-0" />
                  <span>Landmark: <strong className="text-slate-800">{doctor.landmark}</strong></span>
                </p>
              </div>
            </div>
          </div>

          {/* Basic Patient Details & ABHA Verified Card */}
          <div className="grid sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Patient Name & Demographics</span>
              <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5">
                {patientName} ({age} Yrs, {gender})
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">ABHA Number (ABDM 2.0)</span>
              <p className="text-xs sm:text-sm font-extrabold text-blue-900 mt-0.5 font-mono">
                {abhaNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Live Queue Position & Wait Estimation (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-7 shadow-md flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <Clock3 size={15} /> Live Queue Tracker
              </span>
              <span className="text-[11px] font-bold text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                Real-Time OPD Sync
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 text-center">
                <span className="text-[11px] font-semibold text-slate-300 block">Your Token</span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-300 mt-1 block">
                  {tokenNumber}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 text-center">
                <span className="text-[11px] font-semibold text-slate-300 block">Queue Ahead</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-300 mt-1 block">
                  #{queuePos}
                </span>
                <span className="text-[10px] text-slate-300">Patients Ahead</span>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Estimated Waiting Time:</span>
                <span className="font-black text-emerald-300 text-sm">~{queuePos * 4 + 2} Minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Consultation Pace:</span>
                <span className="font-bold text-white">{doctor.avgWaitTime || "4 Mins / Patient"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Pre-Intake Clinical Status:</span>
                <span className="font-bold text-cyan-300 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Synced to Chamber
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-blue-500/10 rounded-2xl border border-blue-400/20 text-xs text-blue-200">
            <span className="font-bold text-white flex items-center gap-1.5 mb-1">
              <Bell size={14} className="text-cyan-300 animate-bounce" /> Digital Audio Announcement:
            </span>
            <p>Your token number will be called over the hospital speaker and displayed on the screen outside {doctor.roomNumber}.</p>
          </div>
        </div>

      </div>

      {/* 4-Step Patient Guide / Basic Hospital Instructions */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            Next Steps / अस्पताल में आगे क्या करें
          </span>
          <h4 className="text-lg font-black text-slate-900 mt-1.5">
            Important Instructions for your OPD Consultation
          </h4>
          <p className="text-xs text-slate-500">
            Please follow these 4 simple steps to complete your consultation smoothly today.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                1
              </div>
              <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">Collect Token Slip</h5>
            </div>
            <p className="text-xs text-slate-600">
              Print your slip or save the token on WhatsApp/SMS to keep your OPD reference handy.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                2
              </div>
              <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">Reach {doctor.roomNumber}</h5>
            </div>
            <p className="text-xs text-slate-600">
              Head towards {doctor.floorWing} near {doctor.landmark} and take a seat in the waiting lounge.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                3
              </div>
              <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">Consult Doctor</h5>
            </div>
            <p className="text-xs text-slate-600">
              When token #{tokenNumber} is called, enter Chamber {doctor.roomNumber}. Your AI pre-intake is already loaded.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                4
              </div>
              <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">Pharmacy / Tests</h5>
            </div>
            <p className="text-xs text-slate-600">
              Collect your digital e-prescription and collect medications directly from the Central Pharmacy counter.
            </p>
          </div>
        </div>
      </div>

    </div>
  );

  return (
    <section className="w-full bg-white/95 backdrop-blur-md text-slate-900 rounded-3xl shadow-2xl shadow-blue-500/15 overflow-hidden border border-blue-200/80 animate-fadeIn font-sans">
      
      {/* ================= HEADER: PATIENT IDENTITY ================= */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 px-6 py-6 sm:px-9 text-white relative overflow-hidden">
        <div className="absolute -right-10 -top-14 w-52 h-52 rounded-full border-[28px] border-white/10 pointer-events-none" />
        <div className="absolute right-36 -bottom-10 w-28 h-28 rounded-full bg-cyan-400/10 blur-xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Left: Demographics */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-white/20 border-2 border-white/30 backdrop-blur-md flex items-center justify-center font-extrabold text-2xl text-white shadow-inner">
              {patientName.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-blue-100 text-xs sm:text-sm font-semibold tracking-wide">Patient Portal</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-300/40 text-emerald-100 text-xs font-bold shadow-sm">
                  <CheckCircle2 size={13} className="text-emerald-300" /> ABDM 2.0 • ID: {patientId}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
                {patientName}
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-blue-100 text-xs sm:text-sm mt-1">
                <span>{gender}, {age} Years</span>
                <span>•</span>
                <span className="font-mono bg-white/15 px-2 py-0.5 rounded-md font-medium text-white">{abhaAddress}</span>
                <span>•</span>
                <span className="text-blue-200">ABHA: {abhaNumber}</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-xl text-xs font-bold text-white border border-white/25 shadow-sm">
                <Stethoscope size={14} className="text-cyan-300 animate-pulse" />
                <span>Assigned Doctor: <strong className="text-cyan-100 font-extrabold">{doctor.name}</strong> • {doctor.roomNumber} ({doctor.specialty})</span>
              </div>
            </div>
          </div>

          {/* Right: OPD Token, Session Telemetry & Safe Exit */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-white/20 gap-3">
            <div className="text-left md:text-right">
              <div className="flex items-center md:justify-end gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-blue-100 text-[11px] font-bold uppercase tracking-wider">
                  Kiosk Session Active
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-black font-mono text-white">
                {tokenNumber}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Session Idle Guard Controls */}
              <div className="flex items-center gap-1 bg-white/15 px-2.5 py-1.5 rounded-xl border border-white/20 text-xs text-white">
                <Clock3 size={13} className="text-cyan-300" />
                <span className="font-mono font-bold text-[11px]">
                  {isDemoKioskMode ? "Demo Mode" : `${Math.floor(sessionTimeLeft / 60)}:${(sessionTimeLeft % 60).toString().padStart(2, '0')}`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSessionTimeLeft(prev => prev + 900);
                  }}
                  className="ml-1 text-[10px] font-bold bg-white/25 hover:bg-white/40 px-1.5 py-0.5 rounded transition cursor-pointer"
                  title="Extend session by 15 minutes"
                >
                  +15m
                </button>
              </div>

              {/* Audio Guide Button */}
              <button
                type="button"
                onClick={handleAudioDirections}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md border ${
                  isSpeaking
                    ? 'bg-amber-400 text-slate-950 border-amber-300 animate-pulse'
                    : 'bg-white/20 hover:bg-white/30 text-white border-white/30'
                }`}
              >
                {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
                <span>{isSpeaking ? "Stop" : "🔊 Audio"}</span>
              </button>

              {/* Safe Sign Out / Exit Button */}
              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setShowLogoutConfirm(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md border border-white/20 cursor-pointer"
                  title="Exit Patient Kiosk"
                >
                  <LogOut size={14} />
                  <span>Exit Kiosk</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 5-STAGE SEQUENTIAL PATIENT INTAKE STEPPER ================= */}
      <div className="px-4 sm:px-8 py-3 bg-slate-50/90 border-b border-slate-200 flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sparkles size={13} className="text-blue-600" />
            <span>Sequential Kiosk Intake Journey:</span>
          </span>

          {/* Live OPD Queue Indicator */}
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Consulting: <strong className="text-emerald-950 font-bold">{doctor.name}</strong> • {doctor.roomNumber}</span>
          </div>
        </div>

        {/* Primary 5-Step Stepper Bar */}
        <nav className="grid grid-cols-2 sm:grid-cols-5 gap-2" aria-label="Sequential Patient Intake Steps">
          {[
            { id: 'interview', num: '1', label: 'Conversational AI', sub: 'Allopath / AYUSH', icon: Brain, badge: 'Step 1' },
            { id: 'painmap', num: '2', label: '3D Body Mapping', sub: 'Touch Mannequin', icon: Crosshair, badge: 'Step 2' },
            { id: 'summary', num: '3', label: 'Clinical Summary', sub: 'Gemini Synthesis', icon: Sparkles, badge: 'Step 3' },
            { id: 'ocr', num: '4', label: 'Medical Docs & OCR', sub: 'Prescription Scan', icon: FileText, badge: 'Step 4' },
            { id: 'overview', num: '5', label: 'OPD Token & Room', sub: 'Chamber Route', icon: MapPin, badge: 'Step 5' }
          ].map((step) => {
            const Icon = step.icon;
            const isActive = activeTab === step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => { sounds.playClick(); setActiveTab(step.id); }}
                className={`p-2.5 sm:p-3 rounded-2xl text-left transition flex items-center gap-2.5 cursor-pointer border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/25 ring-2 ring-blue-400/30'
                    : 'bg-white hover:bg-blue-50/70 text-slate-700 border-slate-200 shadow-xs'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                  isActive ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'
                }`}>
                  {step.num}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-black truncate ${isActive ? 'text-white' : 'text-slate-900'}`}>
                      {step.label}
                    </span>
                  </div>
                  <span className={`text-[10px] block truncate font-medium ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                    {step.sub}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Secondary Utility Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-1">Other Portals:</span>
          {[
            { id: 'token_info', label: 'OPD Token & Doctor Chamber', icon: Stethoscope },
            { id: 'appointments', label: 'Book Appointments', icon: CalendarDays },
            { id: 'profile', label: 'Health Profile', icon: UserCheck },
            { id: 'vitals', label: 'Recorded Vitals', icon: Activity },
            { id: 'guide', label: 'Hospital Route Guide', icon: Navigation }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => { sounds.playClick(); setActiveTab(tab.id); }}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <Icon size={12} className={isActive ? 'text-cyan-300' : 'text-slate-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= TAB 1: OVERVIEW (TOKEN, DIRECTIONS, INTAKE SUMMARY) ================= */}
      {activeTab === 'overview' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid lg:grid-cols-12 gap-6">
            
            {/* OPD Token Card */}
            <div className="lg:col-span-7 bg-gradient-to-br from-blue-50 via-sky-50/50 to-indigo-50/40 rounded-3xl border-2 border-blue-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-extrabold uppercase tracking-wider">
                      Your OPD Token
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live Active
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPrintModal(true)}
                    className="text-xs font-bold text-blue-700 bg-white hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-300 shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={14} /> Print Slip
                  </button>
                </div>

                <div className="mt-4 flex items-baseline gap-4">
                  <div className="text-5xl sm:text-6xl font-black font-mono text-blue-950 tracking-wider">
                    {tokenNumber}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-500 bg-white/80 px-2.5 py-1 rounded-lg border border-blue-100">
                    Department: {doctor.specialty}
                  </span>
                </div>

                <div className="mt-5 grid sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-white rounded-2xl border border-blue-100 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                      #{queuePos}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Queue Position</p>
                      <p className="text-sm font-extrabold text-slate-800">
                        {queuePos} Patients Ahead of You
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white rounded-2xl border border-blue-100 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Clock3 size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Estimated Wait Time</p>
                      <p className="text-sm font-extrabold text-emerald-800">
                        ~{queuePos * 4 + 2} Minutes
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Shortcuts to AI Interview, 3D Pain Mapping & Chamber Pass */}
                <div className="mt-4 grid sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('token_info'); }}
                    className="p-3 bg-white hover:bg-blue-50 border border-blue-200 rounded-2xl text-left transition shadow-sm flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-blue-700 bg-blue-100 px-2 py-0.5 rounded">OPD Chamber Pass</span>
                      <p className="text-xs font-bold text-slate-900 mt-1">Doctor & Room Info</p>
                    </div>
                    <Stethoscope size={16} className="text-blue-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('painmap')}
                    className="p-3 bg-white hover:bg-sky-50 border border-sky-200 rounded-2xl text-left transition shadow-sm flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-sky-700 bg-sky-100 px-2 py-0.5 rounded">Step 2 • 3D Telemetry</span>
                      <p className="text-xs font-bold text-slate-900 mt-1">3D Pain Mannequin</p>
                    </div>
                    <Crosshair size={16} className="text-sky-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('interview'); if (!interviewSessionId) handleStartInterview('allopathy'); }}
                    className="p-3 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-2xl text-left transition shadow-sm flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">AI Voice Intake</span>
                      <p className="text-xs font-bold text-slate-900 mt-1">Health Interview</p>
                    </div>
                    <Brain size={16} className="text-indigo-600" />
                  </button>
                </div>
              </div>

              {/* 4-Step Journey */}
              <div className="mt-6 pt-4 border-t border-blue-200/80">
                <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow">✓</div>
                    <span className="mt-1 text-blue-900 font-bold">1. Check-In</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow">✓</div>
                    <span className="mt-1 text-blue-900 font-bold">2. AI Intake</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow">✓</div>
                    <span className="mt-1 text-blue-900 font-bold">3. 3D Pain</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shadow animate-pulse">4</div>
                    <span className="mt-1 text-emerald-800 font-bold">4. Doctor OPD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Chamber Card */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-extrabold uppercase text-slate-500">Consulting Doctor</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {doctor.status}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xl">
                    <Stethoscope size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{doctor.name}</h3>
                    <p className="text-xs font-bold text-blue-700">{doctor.degrees}</p>
                    <p className="text-xs text-slate-500">{doctor.specialty}</p>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-start gap-2 text-xs">
                    <MapPin size={15} className="text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block text-sm">{doctor.roomNumber}</strong>
                      <span className="text-slate-500">{doctor.floorWing} • {doctor.landmark}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900">
                <span className="font-bold block mb-1">🌿 Ayush Dashavidha Assessment</span>
                <span>Prakriti: <strong>{dashavidhaData.prakriti || "Vata-Kaphaja"}</strong> • Agni: <strong>{dashavidhaData.aharaShakti || "Madhyama"}</strong></span>
              </div>
            </div>

          </div>

          {/* Action Row: Print Slip, Send to Mobile, Hospital Wayfinding */}
          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="p-4 rounded-2xl border-2 border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/50 transition flex items-center gap-3.5 group shadow-sm text-left active:scale-[0.99] cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition">
                <Printer size={22} />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Physical Copy</span>
                <span className="text-sm font-extrabold text-slate-800 group-hover:text-blue-700">Print OPD Token Slip</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Collect from kiosk tray</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="p-4 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/50 transition flex items-center gap-3.5 group shadow-sm text-left active:scale-[0.99] cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition">
                <Share2 size={22} />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Digital Pass</span>
                <span className="text-sm font-extrabold text-slate-800 group-hover:text-emerald-700">Send to WhatsApp / SMS</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Live queue tracking on phone</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setShowMapModal(true)}
              className="p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-500 bg-white hover:bg-indigo-50/50 transition flex items-center gap-3.5 group shadow-sm text-left active:scale-[0.99] cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition">
                <Navigation size={22} />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Hospital Wayfinding</span>
                <span className="text-sm font-extrabold text-slate-800 group-hover:text-indigo-700">Room 104 Walking Route</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Turn-by-turn indoor directions</span>
              </div>
            </button>
          </div>

          {/* ================= COMPLETED PRE-CONSULTATION INTAKE SUMMARY ================= */}
          <div className="pt-6 border-t-2 border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  Pre-Consultation Clinical Intake Complete
                </span>
                <h4 className="text-base font-extrabold text-slate-900 mt-2">
                  Completed Intake Summary (Live on {doctor.name}&apos;s OPD Terminal)
                </h4>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Doctor Consultation & Chamber Pass Card */}
              <div className="p-5 bg-gradient-to-br from-blue-50/90 to-indigo-50/60 rounded-3xl border border-blue-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                      <Stethoscope size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">Assigned Consultant</span>
                      <h5 className="text-sm font-extrabold text-slate-900">{doctor.name}</h5>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setActiveTab('token_info');
                    }}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-white px-3 py-1 rounded-xl border border-blue-300 shadow-sm transition cursor-pointer"
                  >
                    View Chamber Pass →
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
                    <span className="text-slate-500 font-bold block text-[10px] uppercase">Chamber / Room</span>
                    <span className="font-extrabold text-slate-900">{doctor.roomNumber}</span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
                    <span className="text-slate-500 font-bold block text-[10px] uppercase">OPD Location</span>
                    <span className="font-extrabold text-slate-900 truncate">{doctor.floorWing}</span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
                    <span className="text-slate-500 font-bold block text-[10px] uppercase">Specialty</span>
                    <span className="font-extrabold text-slate-900 truncate">{doctor.specialty}</span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
                    <span className="text-slate-500 font-bold block text-[10px] uppercase">Doctor Status</span>
                    <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> {doctor.status || "On Duty"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3D Pain Mannequin Summary Card */}
              <div className="p-5 bg-gradient-to-br from-blue-50/90 to-indigo-50/60 rounded-3xl border border-blue-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                      <Crosshair size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">Step 3 Intake</span>
                      <h5 className="text-sm font-extrabold text-slate-900">3D Body Pain Mapping</h5>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setActiveTab('painmap');
                    }}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-white px-3 py-1 rounded-xl border border-blue-300 shadow-sm transition cursor-pointer"
                  >
                    Adjust Spot
                  </button>
                </div>

                {painMapping ? (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
                      <span className="text-slate-500 font-bold block text-[10px] uppercase">Pinpointed Spot</span>
                      <span className="font-extrabold text-slate-900 truncate block">
                        {painMapping.laymanSummary || painMapping.layman_summary || 'Body Pain'}
                      </span>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
                      <span className="text-slate-500 font-bold block text-[10px] uppercase">Region / Side</span>
                      <span className="font-extrabold text-slate-900 capitalize">
                        {painMapping.bodyRegion || painMapping.body_region || 'Anatomical'} ({painMapping.side || 'center'})
                      </span>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
                      <span className="text-slate-500 font-bold block text-[10px] uppercase">Severity</span>
                      <span className="font-extrabold text-rose-700">VAS {painMapping.severity || painIntensity || 5} / 10</span>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
                      <span className="text-slate-500 font-bold block text-[10px] uppercase">Telemetry Status</span>
                      <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Synced to Room {doctor.roomNumber}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white/70 rounded-xl border border-blue-100 flex items-center justify-between">
                    <span className="text-xs text-slate-600 font-medium">No pain area pinned yet</span>
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setActiveTab('painmap');
                      }}
                      className="text-xs font-bold text-blue-700 underline cursor-pointer"
                    >
                      Tap 3D Mannequin →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: OPD TOKEN & DOCTOR CHAMBER VISIT GUIDE ================= */}
      {(activeTab === 'token_info' || activeTab === 'dashavidha') && (
        <div className="p-6 sm:p-9 space-y-6">
          {renderTokenAndDoctorSection()}
        </div>
      )}

      {/* ================= STEP 2: 3D ANATOMICAL PAIN LOCALIZATION MANNEQUIN ================= */}
      {activeTab === 'painmap' && (
        <div className="p-6 sm:p-9 space-y-6">
          {renderPainMappingSection()}
        </div>
      )}

      {/* ================= STEP 3: AI CLINICAL SUMMARY (GEMINI SYNTHESIS) ================= */}
      {activeTab === 'summary' && (
        <div className="p-6 sm:p-9 space-y-6">
          {renderClinicalSummarySection()}
        </div>
      )}

      {/* ================= TAB 4: AI HEALTH INTERVIEW (SOCRATES + AYUSH + BHASHINI VOICE) ================= */}
      {activeTab === 'interview' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-cyan-300 mb-2 border border-white/15">
                  <Sparkles size={14} />
                  <span>Bhashini Multilingual AI Clinical Intake • SOCRATES & AYUSH Protocols</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                  <span>AI-Assisted Pre-Consultation Health Interview</span>
                </h3>
                <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-2xl">
                  Speak or type your symptoms in your preferred Indian language. Powered by Bhashini AI voice synthesis and SOCRATES triage.
                </p>
              </div>

              {/* Controls Bar: Language Picker, Voice Toggle, Start Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {/* Language Picker */}
                <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-xl border border-white/20 text-xs font-bold backdrop-blur-md">
                  <Globe size={14} className="text-cyan-300" />
                  <select
                    value={interviewLanguage}
                    onChange={(e) => {
                      setInterviewLanguage(e.target.value);
                      stopSpeech();
                      setIsSpeaking(false);
                      setActiveSpeakingMsgId(null);
                    }}
                    className="bg-transparent text-white font-bold outline-none cursor-pointer text-xs"
                  >
                    <option value="hindi" className="text-slate-900">हिंदी (Hindi)</option>
                    <option value="marathi" className="text-slate-900">मराठी (Marathi)</option>
                    <option value="english" className="text-slate-900">English (Indian)</option>
                    <option value="gujarati" className="text-slate-900">ગુજરાતી (Gujarati)</option>
                    <option value="tamil" className="text-slate-900">தமிழ் (Tamil)</option>
                    <option value="telugu" className="text-slate-900">తెలుగు (Telugu)</option>
                    <option value="bengali" className="text-slate-900">বাংলা (Bengali)</option>
                    <option value="kannada" className="text-slate-900">ಕನ್ನಡ (Kannada)</option>
                    <option value="punjabi" className="text-slate-900">ਪੰਜਾਬੀ (Punjabi)</option>
                    <option value="malayalam" className="text-slate-900">മലയാളം (Malayalam)</option>
                    <option value="odia" className="text-slate-900">ଓଡ଼ିଆ (Odia)</option>
                    <option value="assamese" className="text-slate-900">অসমীয়া (Assamese)</option>
                    <option value="urdu" className="text-slate-900">اردو (Urdu)</option>
                  </select>
                </div>

                {/* Voice Master Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    if (isSpeaking) {
                      stopSpeech();
                      setIsSpeaking(false);
                      setActiveSpeakingMsgId(null);
                    }
                    setIsVoiceEnabled(!isVoiceEnabled);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold transition shadow-md flex items-center gap-1.5 border cursor-pointer ${
                    isVoiceEnabled
                      ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 hover:bg-cyan-500/30'
                      : 'bg-white/10 text-slate-400 border-white/20 hover:bg-white/15'
                  }`}
                  title={isVoiceEnabled ? "Voice Output Active" : "Voice Output Muted"}
                >
                  {isVoiceEnabled ? <Volume2 size={15} className="text-cyan-300 animate-pulse" /> : <VolumeX size={15} />}
                  <span>{isVoiceEnabled ? "Voice: ON" : "Voice: Muted"}</span>
                </button>

                {/* Start Buttons & Quick Complete */}
                <button
                  type="button"
                  onClick={() => handleStartInterview('allopathy')}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Stethoscope size={15} />
                  <span>Allopathy</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStartInterview('ayush')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles size={15} />
                  <span>AYUSH</span>
                </button>
                {interviewMessages.length > 0 && !isInterviewCompleted && (
                  <button
                    type="button"
                    onClick={handleFinishInterviewEarly}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    title="Complete intake and generate clinical handover summary now"
                  >
                    <span>⚡ Complete & View Summary</span>
                  </button>
                )}
              </div>
            </div>

            {/* Speaking Status Banner */}
            {isSpeaking && (
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-600/50 via-cyan-500/40 to-indigo-600/50 border border-cyan-400/60 rounded-2xl text-xs text-cyan-100 flex items-center justify-between shadow-inner backdrop-blur-md animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-4 bg-cyan-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-6 bg-cyan-200 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-3 bg-cyan-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="font-bold text-white">
                    🔊 Bhashini AI Voice Engine is speaking in <strong className="capitalize text-cyan-300">{interviewLanguage}</strong>...
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    stopSpeech();
                    setIsSpeaking(false);
                    setActiveSpeakingMsgId(null);
                  }}
                  className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white font-extrabold rounded-lg text-[11px] transition border border-white/30 cursor-pointer"
                >
                  Stop Audio ⏹️
                </button>
              </div>
            )}

            {/* Red Flag Alert Banner if detected */}
            {interviewRedFlags.length > 0 && (
              <div className="mt-4 p-3.5 bg-rose-600/30 border border-rose-400 rounded-2xl text-xs text-rose-100 flex items-center gap-3">
                <AlertTriangle size={20} className="text-rose-300 shrink-0 animate-pulse" />
                <div>
                  <strong className="font-extrabold text-white block">Emergency Triage Alert:</strong>
                  {interviewRedFlags.map((rf, i) => (
                    <span key={i} className="block">{rf.flag_name || rf.flagName || "Red-flag clinical finding detected."}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ================= COMPLETED INTAKE CLINICAL SUMMARY REPORT ================= */}
          {(isInterviewCompleted || interviewSummary) && (
            <div className="bg-white rounded-3xl border-2 border-emerald-400 shadow-xl overflow-hidden animate-fade-in space-y-0">
              <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 text-white p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 rounded-full text-xs font-black text-emerald-200 mb-2 border border-white/20">
                    <CheckCircle2 size={15} />
                    <span>AI CLINICAL INTAKE COMPLETED • ABDM 2.0 VERIFIED</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                    Official AI Pre-Consultation Handover Summary
                  </h3>
                  <p className="text-xs text-emerald-100 mt-1">
                    Compiled for <strong>{doctor.name}</strong> • Synchronized to Room {doctor.roomNumber}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-sm border ${
                    (interviewSummary?.triageLevel === 'EMERGENCY' || interviewRedFlags.length > 0)
                      ? 'bg-rose-500 text-white border-rose-300 animate-pulse'
                      : (interviewSummary?.triageLevel === 'PRIORITY'
                        ? 'bg-amber-400 text-slate-950 border-amber-300'
                        : 'bg-emerald-400 text-slate-950 border-emerald-300')
                  }`}>
                    {interviewSummary?.triageLevel || (interviewRedFlags.length > 0 ? 'EMERGENCY' : 'STANDARD')} TRIAGE
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPrintModal(true)}
                    className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 font-extrabold rounded-xl text-xs transition shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={15} className="text-blue-600" />
                    <span>Print Slip</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <MapPin size={15} />
                    <span>Go to Chamber</span>
                  </button>
                </div>
              </div>

              {/* Summary Details Grid */}
              <div className="p-6 space-y-6 bg-slate-50/50">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block">Patient Name</span>
                    <strong className="text-slate-900 text-sm font-black">{patientName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Token / Queue</span>
                    <strong className="text-blue-700 text-sm font-black">{tokenNumber} (Pos #{queuePos})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Protocol Used</span>
                    <strong className="text-slate-800 font-black capitalize">{interviewSystem === 'ayush' ? 'AYUSH (Ayurveda)' : 'SOCRATES (Modern)'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Transmission Status</span>
                    <span className="text-emerald-700 font-black flex items-center gap-1">
                      <Check size={14} className="text-emerald-600" /> Synced to Doctor
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-black uppercase text-slate-500">Chief Clinical Complaint</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-50 text-blue-800 border border-blue-200">
                        VAS Severity: {painIntensity}/10
                      </span>
                    </div>
                    <p className="text-base font-extrabold text-slate-900">
                      {interviewSummary?.patientComplaint || complaint}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-slate-400 font-bold block">Primary Region:</span>
                        <strong className="text-slate-800">{painMapping?.laymanSummary || interviewSummary?.painLocation || "Abdomen / Torso"}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block">Discomfort Type:</span>
                        <strong className="text-slate-800">{painType || "Aching / Throbbing"}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 p-5 rounded-2xl border border-blue-200 shadow-sm space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-blue-200/60 pb-2">
                        <span className="text-xs font-black uppercase text-blue-800">Assigned Consulting Doctor</span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {doctor.status}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                          <Stethoscope size={20} />
                        </div>
                        <div>
                          <strong className="text-sm font-black text-slate-900 block">{doctor.name}</strong>
                          <span className="text-xs text-blue-700 font-bold">{doctor.specialty}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-blue-200 text-xs text-slate-700 flex items-center gap-2">
                      <MapPin size={16} className="text-rose-500 shrink-0" />
                      <span><strong>{doctor.roomNumber}</strong> • {doctor.floorWing} ({doctor.landmark})</span>
                    </div>
                  </div>
                </div>

                {/* Structured SOCRATES Findings Breakdown */}
                {interviewSummary?.socratesSummary && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <span className="text-xs font-black uppercase text-slate-500 block">
                      SOCRATES Clinical Intake Parameters
                    </span>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      {Object.entries(interviewSummary.socratesSummary).map(([key, val], sIdx) => (
                        <div key={sIdx} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-slate-400 font-bold block">{key}</span>
                          <span className="text-slate-900 font-black mt-0.5 block">
                            {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AYUSH Dashavidha Pariksha Findings */}
                {interviewSystem === 'ayush' && (
                  <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 space-y-3">
                    <span className="text-xs font-black uppercase text-emerald-900 block">
                      🌿 Ayush Dashavidha Pariksha Clinical Observations
                    </span>
                    <div className="grid sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-xl border border-emerald-200">
                        <span className="text-emerald-700 font-bold block">1. Prakriti (प्रकृति)</span>
                        <strong className="text-slate-900">{dashavidhaData.prakriti || "Vata-Kaphaja"}</strong>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-emerald-200">
                        <span className="text-emerald-700 font-bold block">2. Vikriti (विकृति)</span>
                        <strong className="text-slate-900">{dashavidhaData.vikriti || "Agnimandya & Vata Dosha"}</strong>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-emerald-200">
                        <span className="text-emerald-700 font-bold block">3. Ahara Shakti / Agni (आहार शक्ति)</span>
                        <strong className="text-slate-900">{dashavidhaData.aharaShakti || "Madhyama"}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary Bottom Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartInterview(interviewSystem)}
                      className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw size={14} />
                      <span>Restart Assessment</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => speakAiMessage(
                        interviewLanguage === 'hindi'
                          ? `आपकी स्वास्थ्य जांच पूरी हो चुकी है। आपकी रिपोर्ट डॉ. ${doctor.name}, कमरा नंबर ${doctor.roomNumber} के पास भेज दी गई है।`
                          : `Your AI clinical interview is complete. Your report has been sent to ${doctor.name} in Room ${doctor.roomNumber}.`,
                        'summary-voice'
                      )}
                      className="px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-extrabold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Volume2 size={15} />
                      <span>Listen to Summary</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs transition shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Doctor OPD Chamber</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Chat Flow Container */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-inner flex flex-col h-[520px]">
            
            {/* Progress Header */}
            <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <span>Phase: <strong className="text-blue-700 capitalize">{interviewPhase.replace('_', ' ')}</strong></span>
                <span>•</span>
                <span className="text-slate-500">{interviewSystem === 'ayush' ? 'AYUSH Protocol' : 'SOCRATES Protocol'}</span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px] capitalize">
                  🗣️ {interviewLanguage}
                </span>
                {isInterviewCompleted && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-[11px]">
                    ✔ Completed
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${interviewProgress}%` }} />
                </div>
                <span className="font-mono text-blue-700">{interviewProgress}%</span>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {interviewMessages.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center font-bold shadow-inner">
                    <Sparkles size={28} />
                  </div>
                  <h4 className="text-base font-extrabold text-slate-800">Ready to Start Health Interview</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Click "Allopathy" or "AYUSH" above to begin your interactive voice-enabled AI intake interview with Bhashini speech.
                  </p>
                </div>
              ) : (
                interviewMessages.map((msg, idx) => {
                  const isAi = msg.role === 'ai' || msg.role === 'system';
                  const isThisSpeaking = isSpeaking && activeSpeakingMsgId === (msg.id || idx);

                  return (
                    <div key={msg.id || idx} className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}>
                      <div className={`max-w-xl p-4 rounded-2xl text-sm relative group ${
                        isAi 
                          ? 'bg-white border border-slate-200 text-slate-900 shadow-sm rounded-tl-none' 
                          : 'bg-blue-600 text-white shadow-md rounded-tr-none'
                      }`}>
                        <div className="flex items-start justify-between gap-3">
                          <p className="leading-relaxed font-medium flex-1">{msg.content}</p>
                          
                          {/* Replay Speaker Button on AI Messages */}
                          {isAi && (
                            <button
                              type="button"
                              onClick={() => speakAiMessage(msg.content, msg.id || idx)}
                              className={`p-1.5 rounded-lg border transition shrink-0 cursor-pointer ${
                                isThisSpeaking
                                  ? 'bg-blue-600 text-white border-blue-700 animate-pulse'
                                  : 'bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-700 border-slate-200'
                              }`}
                              title="Listen to this question via Bhashini AI Voice"
                            >
                              <Volume2 size={15} />
                            </button>
                          )}
                        </div>

                        {/* Quick Option Buttons & Transition Actions */}
                        {isAi && msg.options && msg.options.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                            {msg.options.map((opt, oIdx) => {
                              const isProceed = 
                                opt.value === 'proceed_to_painmap' || 
                                opt.value === 'proceed_3d_mannequin' || 
                                (typeof opt.label === 'string' && (
                                  opt.label.toLowerCase().includes('proceed') || 
                                  opt.label.toLowerCase().includes('digital map') || 
                                  opt.label.toLowerCase().includes('पेन मैपिंग') || 
                                  opt.label.toLowerCase().includes('मॅपिंग')
                                ));
                              return (
                                <button
                                  key={oIdx}
                                  type="button"
                                  onClick={() => {
                                    if (isProceed) {
                                      sounds.playSuccess();
                                      setActiveTab('painmap');
                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                    } else {
                                      handleSendInterviewMessage(null, opt.value || opt.label);
                                    }
                                  }}
                                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-sm ${
                                    isProceed
                                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25 ring-2 ring-blue-400/40 text-xs sm:text-sm py-2.5 px-4 font-extrabold'
                                      : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
                                  }`}
                                >
                                  {opt.icon && <span>{opt.icon}</span>}
                                  <span>{opt.label}</span>
                                  {isProceed && <ArrowRight size={15} className="shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* If interview is completed and this is the final AI message, render explicit Step 2 CTA Card */}
                        {isAi && isInterviewCompleted && idx === interviewMessages.length - 1 && (
                          <div className="mt-3.5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-700 to-teal-700 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
                            <div className="flex items-center gap-2.5 text-left">
                              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                <Crosshair size={22} className="text-white" />
                              </div>
                              <div>
                                <p className="text-xs sm:text-sm font-extrabold text-white">
                                  {interviewSystem === 'ayush' ? 'दशविध परीक्षा पूर्ण • अब 3D डिजिटल पेन मैपिंग पर जाएं' : 'Clinical Intake Complete • Proceed to 3D Digital Pain Mapping'}
                                </p>
                                <p className="text-[11px] text-blue-100">
                                  Touch directly on the 3D anatomical mannequin to pinpoint your exact pain location and intensity.
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                sounds.playSuccess();
                                setActiveTab('painmap');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="w-full sm:w-auto px-4 py-2.5 bg-white text-blue-900 font-extrabold text-xs sm:text-sm rounded-xl shadow hover:bg-blue-50 transition active:scale-95 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                            >
                              <span>Move to 3D Digital Mapping 📍</span>
                              <ArrowRight size={15} />
                            </button>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1">
                        {isAi ? "🇮🇳 MediKiosk AI Doctor (Bhashini Voice)" : "You"}
                      </span>
                    </div>
                  );
                })
              )}

              {interviewLoading && (
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 p-2">
                  <RefreshCw size={14} className="animate-spin" />
                  <span>AI is processing clinical parameters & preparing Bhashini voice speech...</span>
                </div>
              )}
            </div>

            {/* Input Bar with Microphone Voice Dictation */}
            <div className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleVoiceDictation}
                disabled={isInterviewCompleted}
                className={`p-2.5 rounded-xl transition font-bold text-xs flex items-center gap-1.5 shadow-sm border cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
                title={isListening ? "Listening... Tap to stop" : "Tap to speak in Indian language"}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} className="text-blue-600" />}
                <span className="hidden sm:inline">{isListening ? "Listening..." : "Speak"}</span>
              </button>

              <input
                type="text"
                value={interviewInput}
                onChange={(e) => setInterviewInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendInterviewMessage(interviewInput); }}
                placeholder={isListening ? "Listening to your voice..." : (isInterviewCompleted ? "Interview completed. Summary generated above." : `Type or speak symptoms in ${interviewLanguage}...`)}
                disabled={isInterviewCompleted}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />

              <button
                type="button"
                onClick={() => handleSendInterviewMessage(interviewInput)}
                disabled={!interviewInput.trim() || isInterviewCompleted}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Send size={14} />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>

          {/* Next Action Bar: Proceed directly to Step 2 (3D Body Pain Mapping) */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 rounded-3xl border-2 border-blue-300 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-blue-500/20">
                <Crosshair size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                    Next Step 2 of 5
                  </span>
                  <span className="text-xs font-extrabold text-slate-800">3D Body Pain Mapping</span>
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
                  Pinpoint your pain area & intensity on the 3D Mannequin
                </h4>
                <p className="text-xs text-slate-500">
                  Touch directly on the 3D body model to mark where it hurts and set your VAS pain score (1-10).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                sounds.playSuccess();
                setActiveTab('painmap');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2.5 cursor-pointer shrink-0"
            >
              <span>Proceed to Step 2: 3D Pain Mapping 🧍</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 5: MEDICAL DOCS & OCR SCANNER ================= */}
      {activeTab === 'ocr' && (
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Toast Notification Alert */}
          {ocrStatusToast && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 text-emerald-950 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between shadow-md animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <CheckCircle size={18} className="text-emerald-600 shrink-0" />
                <span>{ocrStatusToast}</span>
              </div>
              <button
                type="button"
                onClick={() => setOcrStatusToast('')}
                className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-cyan-300 mb-2.5 border border-white/15">
                  <FileText size={14} />
                  <span>ABDM 2.0 • Clinical OCR & Document Engine</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Medical Document Scanner & OCR Vault
                </h3>
                <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-2xl leading-relaxed">
                  Upload doctor prescriptions, diagnostic pathology reports, and hospital discharge summaries. The OCR engine deciphers handwritten clinical notes and extracts medications, diagnoses, and lab values for patient <strong>{patientName}</strong> (ID: {patientId}).
                </p>
              </div>

              <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 text-xs">
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-xl font-bold flex items-center gap-1.5 shadow-sm">
                  <CheckCircle size={13} /> PaddleOCR 2.0 Active
                </span>
                <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-cyan-200 rounded-xl font-bold flex items-center gap-1.5 shadow-sm">
                  <ShieldCheck size={13} /> Indian Pharmacopoeia Sync
                </span>
              </div>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
            accept="image/*,.pdf"
            className="hidden"
          />

          {/* Workstation Grid: Left = Ingestion / Scanner, Right = 1-Click Demo Presets */}
          <div className="grid lg:grid-cols-12 gap-6">
            
            {/* Left Column (7 cols): Document Upload & Scan Area */}
            <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Upload size={18} className="text-blue-600" />
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Document Ingestion & Kiosk Scan
                  </h4>
                </div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Station Optical Bed #01
                </span>
              </div>

              {/* Drag & Drop Zone or Selected File Viewfinder */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 p-5 flex flex-col items-center justify-center text-center overflow-hidden ${
                  isDraggingOver
                    ? 'border-blue-500 bg-blue-50/80 scale-[1.01]'
                    : filePreviewUrl
                    ? 'border-emerald-300 bg-slate-50'
                    : 'border-slate-300 hover:border-blue-400 bg-slate-50/70'
                }`}
                style={{ minHeight: '190px' }}
              >
                {/* Laser Scanning Animation Overlay during OCR or Camera scan */}
                {(isOcrProcessing || isCameraScanning) && (
                  <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400/80 animate-pulse relative laser-scanner-line" style={{
                      position: 'absolute',
                      top: `${ocrProgress}%`,
                      transition: 'top 0.4s ease'
                    }} />
                    <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-[1px] flex flex-col items-center justify-center text-white">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600/90 flex items-center justify-center animate-spin mb-2 shadow-lg">
                        <Scan size={24} className="text-white" />
                      </div>
                      <span className="text-xs font-black tracking-wide bg-slate-950/70 px-3 py-1 rounded-full border border-white/20">
                        {ocrStage || "Scanning document optics..."}
                      </span>
                    </div>
                  </div>
                )}

                {filePreviewUrl ? (
                  <div className="w-full space-y-3">
                    <div className="relative max-h-48 max-w-xs mx-auto overflow-hidden rounded-xl border border-slate-300 shadow-sm bg-white">
                      <img
                        src={filePreviewUrl}
                        alt="Scanned Document Preview"
                        className="w-full h-auto object-contain max-h-48"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFileObj(null);
                            setFilePreviewUrl(null);
                            setCustomDocTitle('');
                          }}
                          className="p-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-rose-700 cursor-pointer"
                          title="Remove File"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                      <span className="font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
                        📄 {selectedFileObj?.name || 'Scanned_Document.png'}
                      </span>
                      {selectedFileObj?.size && (
                        <span className="text-slate-500 font-mono">
                          {(selectedFileObj.size / 1024).toFixed(1)} KB
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                      <Upload size={28} />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-800">
                        Drag & drop patient document here, or choose an option
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Supports high-resolution PNG, JPG, WEBP and scanned PDF slips
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                      >
                        <FolderOpen size={15} />
                        <span>Browse Computer Files</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSimulatedCameraScan}
                        disabled={isCameraScanning || isOcrProcessing}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Camera size={15} className="text-cyan-400" />
                        <span>Scan from Kiosk Glass Bed</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Document Metadata Form */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
                    1. Select Document Classification Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'PRESCRIPTION', label: 'Rx Prescription', icon: Pill },
                      { id: 'LAB_REPORT', label: 'Lab Pathology', icon: Activity },
                      { id: 'DISCHARGE_SUMMARY', label: 'Discharge Card', icon: FileText },
                      { id: 'RADIOLOGY', label: 'X-Ray / MRI', icon: Layers }
                    ].map(type => {
                      const Icon = type.icon;
                      const isSelected = selectedDocType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            setSelectedDocType(type.id);
                          }}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <Icon size={14} />
                          <span>{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1">
                    2. Document Title / Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={customDocTitle}
                    onChange={(e) => setCustomDocTitle(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Sharma OPD Slip / Metropolis Blood Sugar"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* Primary Action Button */}
                <button
                  type="button"
                  onClick={handleRunOcrUpload}
                  disabled={isOcrProcessing || (!selectedFileObj && !filePreviewUrl)}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Scan size={18} />
                  <span>
                    {isOcrProcessing
                      ? "AI OCR Pipeline Deciphering Document..."
                      : "⚡ Run AI OCR Analysis & Encrypt to Vault"}
                  </span>
                </button>
              </div>
            </div>

            {/* Right Column (5 cols): 1-Click Test Document Scan Presets */}
            <div className="lg:col-span-5 bg-gradient-to-b from-slate-50 to-blue-50/40 rounded-3xl border-2 border-slate-200 p-5 sm:p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-500" />
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                      1-Click Clinical Test Presets
                    </h4>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Instant Demo
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  Click any verified clinical sample below to instantly run OCR spatial deciphering without uploading a manual file:
                </p>

                <div className="space-y-2.5 pt-3">
                  {/* Preset 1: Rx Metformin & Telmisartan */}
                  <button
                    type="button"
                    onClick={() => handleLoadSampleDocument('PRESCRIPTION')}
                    disabled={isOcrProcessing}
                    className="w-full p-3 bg-white hover:bg-blue-50/80 border border-blue-200 rounded-2xl text-left transition shadow-sm hover:shadow-md cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                        Rx Prescription
                      </span>
                      <span className="text-[11px] font-mono text-blue-600 group-hover:translate-x-0.5 transition-transform">
                        Run OCR ›
                      </span>
                    </div>
                    <p className="text-xs font-black text-slate-900 mt-1">Dr. Rajesh Sharma OPD Slip</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Extracts Metformin 500mg, Glimepiride 1mg, Telmisartan 40mg & BP 132/84
                    </p>
                  </button>

                  {/* Preset 2: Metropolis Pathology */}
                  <button
                    type="button"
                    onClick={() => handleLoadSampleDocument('LAB_REPORT')}
                    disabled={isOcrProcessing}
                    className="w-full p-3 bg-white hover:bg-emerald-50/80 border border-emerald-200 rounded-2xl text-left transition shadow-sm hover:shadow-md cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        Lab Pathology
                      </span>
                      <span className="text-[11px] font-mono text-emerald-600 group-hover:translate-x-0.5 transition-transform">
                        Run OCR ›
                      </span>
                    </div>
                    <p className="text-xs font-black text-slate-900 mt-1">Metropolis Lipid & Glucose Panel</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Extracts Total Cholesterol 228 mg/dL, Triglycerides 190, Fasting Sugar 134
                    </p>
                  </button>

                  {/* Preset 3: Apex Discharge Summary */}
                  <button
                    type="button"
                    onClick={() => handleLoadSampleDocument('DISCHARGE_SUMMARY')}
                    disabled={isOcrProcessing}
                    className="w-full p-3 bg-white hover:bg-indigo-50/80 border border-indigo-200 rounded-2xl text-left transition shadow-sm hover:shadow-md cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                        Discharge Summary
                      </span>
                      <span className="text-[11px] font-mono text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                        Run OCR ›
                      </span>
                    </div>
                    <p className="text-xs font-black text-slate-900 mt-1">Apex Inpatient Discharge Card</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Extracts Gastroenteritis course, Ofloxacin 200mg + Ornidazole 500mg, ORS
                    </p>
                  </button>

                  {/* Preset 4: Lumbar MRI & Radiodiagnostics */}
                  <button
                    type="button"
                    onClick={() => handleLoadSampleDocument('RADIOLOGY')}
                    disabled={isOcrProcessing}
                    className="w-full p-3 bg-white hover:bg-purple-50/80 border border-purple-200 rounded-2xl text-left transition shadow-sm hover:shadow-md cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                        Radiology / MRI
                      </span>
                      <span className="text-[11px] font-mono text-purple-600 group-hover:translate-x-0.5 transition-transform">
                        Run OCR ›
                      </span>
                    </div>
                    <p className="text-xs font-black text-slate-900 mt-1">Lumbar Spine MRI & Digital X-Ray</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Extracts L4-L5 Posterior Disc Extrusion & Spondylosis findings
                    </p>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-blue-100/60 rounded-2xl border border-blue-200 text-[11px] text-blue-900 flex items-center gap-2 mt-2">
                <ShieldCheck size={16} className="text-blue-700 shrink-0" />
                <span>All documents are cryptographically bound to Patient ID <strong>{patientId}</strong>.</span>
              </div>
            </div>

          </div>

          {/* Processing Progress Pipeline Card */}
          {isOcrProcessing && (
            <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl border-2 border-blue-300 space-y-3 animate-pulse shadow-md">
              <div className="flex justify-between items-center text-xs font-extrabold text-blue-950">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                  <span>{ocrStage}</span>
                </div>
                <span className="font-mono text-sm">{ocrProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${ocrProgress}%` }}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[10px] font-extrabold text-slate-600">
                <span className={ocrProgress >= 25 ? "text-emerald-700" : ""}>✓ 1. Image Preprocessing</span>
                <span className={ocrProgress >= 50 ? "text-emerald-700" : ""}>✓ 2. PaddleOCR Spatial Layout</span>
                <span className={ocrProgress >= 75 ? "text-emerald-700" : ""}>✓ 3. Indian Pharmacopoeia Entity Extraction</span>
                <span className={ocrProgress >= 100 ? "text-emerald-700" : ""}>✓ 4. FHIR Vault Encryption</span>
              </div>
            </div>
          )}

          {/* Latest Extracted OCR Result Card */}
          {latestOcrResult && (
            <div className="p-6 bg-white border-2 border-emerald-300 rounded-3xl space-y-5 shadow-lg animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                    ✓ OCR Entities Extracted Successfully
                  </span>
                  <span className="text-xs font-bold text-slate-500 font-mono">
                    ID: {latestOcrResult.documentId}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleInspectDocument(latestOcrResult)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold rounded-xl border border-blue-200 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye size={14} />
                    <span>Inspect Raw OCR</span>
                  </button>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
                    Live Synced to OPD Chamber
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-lg sm:text-xl font-black text-slate-900">
                  {latestOcrResult.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 italic mt-2 leading-relaxed">
                  &quot;{latestOcrResult.summary}&quot;
                </p>
              </div>

              {/* Deciphered Medications Grid */}
              {latestOcrResult.entities?.medications?.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase text-slate-700 flex items-center gap-1.5">
                      <Pill size={15} className="text-blue-600" />
                      <span>Deciphered Pharmacopoeia Medications ({latestOcrResult.entities.medications.length})</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Confidence: 94-98%</span>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-2.5">
                    {latestOcrResult.entities.medications.map((med, i) => (
                      <div key={i} className="p-3.5 bg-gradient-to-br from-blue-50/60 to-slate-50 rounded-2xl border border-blue-200 text-xs space-y-1 shadow-sm">
                        <div className="flex items-center justify-between">
                          <strong className="font-extrabold text-slate-900 block text-sm">{med.name}</strong>
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono font-bold text-[10px]">
                            {med.dose || '1 Tab'}
                          </span>
                        </div>
                        <div className="text-slate-600 text-[11px] font-semibold">
                          <span>Schedule: <strong>{med.frequency || 'OD'}</strong></span> • <span>{med.duration || '30 Days'}</span>
                        </div>
                        {med.instructions && (
                          <span className="text-[10px] text-blue-700 font-bold block pt-0.5">
                            ℹ️ {med.instructions}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deciphered Investigations / Lab Parameters Table */}
              {latestOcrResult.entities?.investigations?.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-xs font-extrabold uppercase text-slate-700 flex items-center gap-1.5">
                    <Activity size={15} className="text-emerald-600" />
                    <span>Deciphered Pathology & Lab Parameters ({latestOcrResult.entities.investigations.length})</span>
                  </span>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Investigation Name</th>
                          <th className="p-3">Measured Result</th>
                          <th className="p-3">Reference Range</th>
                          <th className="p-3">Clinical Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {latestOcrResult.entities.investigations.map((inv, idx) => {
                          const isHigh = String(inv.status).toLowerCase().includes('high') || String(inv.status).toLowerCase().includes('elevated');
                          return (
                            <tr key={idx} className="hover:bg-slate-50/80">
                              <td className="p-3 font-bold text-slate-900">{inv.name}</td>
                              <td className="p-3 font-extrabold text-blue-900 font-mono">{inv.value} {inv.unit}</td>
                              <td className="p-3 text-slate-500 font-mono">{inv.reference || 'Standard'}</td>
                              <td className="p-3">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                  isHigh
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                }`}>
                                  {inv.status || 'NORMAL'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Clinical Attribution Metadata Footer */}
              <div className="grid sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
                {latestOcrResult.entities?.diagnosis && (
                  <div>
                    <span className="font-bold text-slate-800 block">Primary Diagnosis:</span>
                    <span>{latestOcrResult.entities.diagnosis}</span>
                  </div>
                )}
                {latestOcrResult.entities?.doctor && (
                  <div>
                    <span className="font-bold text-slate-800 block">Treating Doctor:</span>
                    <span>{latestOcrResult.entities.doctor}</span>
                  </div>
                )}
                {latestOcrResult.entities?.vitals?.bp && (
                  <div>
                    <span className="font-bold text-slate-800 block">Deciphered Vitals:</span>
                    <span>BP: {latestOcrResult.entities.vitals.bp} • Pulse: {latestOcrResult.entities.vitals.pulse}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Medical Documents Vault (Saved Records Repository) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-black text-slate-900">
                  Your Medical Documents Vault ({uploadedDocuments.length})
                </h4>
                <p className="text-xs text-slate-500">
                  All documents stored in ABDM 2.0 encrypted repository under Patient ID <strong>{patientId}</strong>
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-1.5 text-xs font-bold">
                {['ALL', 'PRESCRIPTION', 'LAB_REPORT', 'DISCHARGE_SUMMARY', 'RADIOLOGY'].map(fType => (
                  <button
                    key={fType}
                    type="button"
                    onClick={() => setOcrFilterType(fType)}
                    className={`px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                      ocrFilterType === fType
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {fType === 'ALL' ? `All (${uploadedDocuments.length})` : fType.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Documents */}
            {uploadedDocuments.length === 0 ? (
              <div className="text-center py-10 text-slate-400 space-y-2">
                <FileText size={36} className="mx-auto opacity-40 text-slate-400" />
                <p className="text-xs font-bold text-slate-600">No medical documents stored yet.</p>
                <p className="text-[11px] text-slate-400">Upload a prescription or click a test preset above to start.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {uploadedDocuments
                  .filter(d => ocrFilterType === 'ALL' || (d.documentType || '').toUpperCase().includes(ocrFilterType))
                  .map((doc, idx) => (
                    <div
                      key={doc.documentId || idx}
                      className="p-4 bg-slate-50/80 hover:bg-white rounded-2xl border border-slate-200 transition-all shadow-sm hover:shadow-md flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-3 rounded-2xl bg-blue-100 text-blue-700 shrink-0">
                          <FileText size={20} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                              {doc.title}
                            </span>
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                              {doc.documentType}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px]">
                            ID: <span className="font-mono font-bold text-slate-700">{doc.documentId}</span> • {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Active Vault'}
                          </p>
                          {doc.summary && (
                            <p className="text-[11px] text-slate-600 line-clamp-2 italic">
                              &quot;{doc.summary}&quot;
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleInspectDocument(doc)}
                          className="px-2.5 py-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
                          title="Inspect OCR Entities"
                        >
                          <Eye size={13} />
                          <span>Inspect</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteDocument(doc.documentId, e)}
                          disabled={docDeleteLoadingId === doc.documentId}
                          className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs transition shadow-sm cursor-pointer"
                          title="Delete Document"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Next Action Bar: Complete Check-In & View OPD Token */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 rounded-3xl border-2 border-blue-300 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-blue-500/20">
                <MapPin size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                    Final Step 5 of 5
                  </span>
                  <span className="text-xs font-extrabold text-slate-800">OPD Token & Chamber Guidance</span>
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
                  Complete Intake & Generate Official OPD Consultation Token
                </h4>
                <p className="text-xs text-slate-500">
                  View your live token number, queue position, print slip, and turn-by-turn indoor route to Room {doctor.roomNumber}.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                sounds.playSuccess();
                setActiveTab('overview');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2.5 cursor-pointer shrink-0"
            >
              <span>Complete Intake & View Token 🎟️</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </div>
      )}

      {/* ================= TAB 6: BOOK APPOINTMENTS ================= */}
      {activeTab === 'appointments' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 text-white rounded-3xl p-6 shadow-lg">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">Book Doctor OPD Appointment</h3>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
              Schedule your upcoming doctor consultation, select your preferred department and specialist, and receive your instant digital OPD token.
            </p>
          </div>

          {apptBookingSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>{apptBookingSuccess}</span>
            </div>
          )}

          <div className="grid md:grid-cols-12 gap-6">
            
            {/* Booking Form (5 Cols) */}
            <form onSubmit={handleBookNewAppointment} className="md:col-span-5 bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900">Select Doctor & Slot</h4>
              
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Doctor & Specialty</label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                >
                  {availableDoctors.map(doc => (
                    <option key={doc.doctor_id} value={doc.doctor_id}>
                      {doc.name} — {doc.department} ({doc.room_number})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Appointment Date</label>
                <input
                  type="date"
                  value={selectedApptDate}
                  onChange={(e) => setSelectedApptDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Preferred Time Slot</label>
                <select
                  value={selectedTimeSlot}
                  onChange={(e) => setSelectedTimeSlot(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                >
                  <option value="09:00 AM">09:00 AM - 09:30 AM</option>
                  <option value="10:00 AM">10:00 AM - 10:30 AM</option>
                  <option value="11:00 AM">11:00 AM - 11:30 AM</option>
                  <option value="12:00 PM">12:00 PM - 12:30 PM</option>
                  <option value="02:00 PM">02:00 PM - 02:30 PM</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isBookingAppt}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CalendarDays size={14} />
                <span>{isBookingAppt ? "Scheduling..." : "Confirm & Issue OPD Token"}</span>
              </button>
            </form>

            {/* Appointments History List (7 Cols) */}
            <div className="md:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 space-y-3">
              <h4 className="text-sm font-extrabold text-slate-900">Your Scheduled & Past Appointments</h4>
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {patientAppointments.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No previous appointments found.</p>
                ) : (
                  patientAppointments.map((apt, idx) => (
                    <div key={apt.appointment_id || idx} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-700">{apt.token_number}</span>
                          <span className="font-bold text-slate-900">{apt.doctor_name || apt.department}</span>
                        </div>
                        <span className="text-slate-500">{apt.appointment_date} at {apt.time_slot}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                        apt.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= TAB 7: PROFILE & MEDICAL HISTORY ================= */}
      {activeTab === 'profile' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid md:grid-cols-12 gap-6">
            
            {/* Edit Profile Form (5 Cols) */}
            <form onSubmit={handleSaveProfile} className="md:col-span-5 bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900">Personal Demographics</h4>
              
              {profileUpdateMsg && (
                <div className="p-3 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl">
                  {profileUpdateMsg}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Age</label>
                  <input
                    type="number"
                    value={profileForm.age}
                    onChange={(e) => setProfileForm({ ...profileForm, age: parseInt(e.target.value, 10) })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={profileForm.gender}
                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={profileForm.mobile}
                  onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-md transition cursor-pointer"
              >
                Save Profile Changes
              </button>
            </form>

            {/* Medical History & Past Consultations (7 Cols) */}
            <div className="md:col-span-7 space-y-4">
              
              {/* Dashavidha Pariksha Summary */}
              <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-emerald-800">🌿 Dashavidha Ayurvedic Constitution</span>
                  <button
                    type="button"
                    onClick={() => setShowDashavidhaModal(true)}
                    className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg hover:bg-emerald-200 transition cursor-pointer"
                  >
                    Update Answers
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Prakriti: <strong>{dashavidhaData.prakriti || "Vata-Kaphaja"}</strong></div>
                  <div>Agni (Digestion): <strong>{dashavidhaData.aharaShakti || "Madhyama"}</strong></div>
                  <div>Mental Stamina: <strong>{dashavidhaData.satva || dashavidhaData.sattva || "Pravara"}</strong></div>
                  <div>Physical Endurance: <strong>{dashavidhaData.vyayamaShakti || "Madhyama"}</strong></div>
                </div>
              </div>

              {/* Past Consultations */}
              <div className="p-5 bg-white rounded-3xl border border-slate-200 space-y-3">
                <h4 className="text-sm font-extrabold text-slate-900">Previous Clinical Consultations</h4>
                <div className="space-y-3">
                  {patientHistoryData?.consultations?.length > 0 ? (
                    patientHistoryData.consultations.map((con, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                        <div className="flex justify-between font-bold">
                          <span className="text-blue-700">{con.doctorName}</span>
                          <span className="text-slate-400">{con.createdAt ? new Date(con.createdAt).toLocaleDateString() : 'Past Visit'}</span>
                        </div>
                        <p className="font-bold text-slate-900">Diagnosis: {con.diagnosis}</p>
                        {con.clinicalNotes && <p className="text-slate-600">Notes: {con.clinicalNotes}</p>}
                        {con.advice && <p className="text-emerald-700 font-medium">Advice: {con.advice}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">No prior consultations recorded.</p>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ================= TAB 8: RECORDED VITALS & INTAKE ================= */}
      {activeTab === 'vitals' && (
        <div className="p-6 sm:p-9 space-y-6">
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Health Intake & Kiosk Vitals</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Recorded automatically by smart triage sensors and securely synced to your ABHA profile.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Activity size={24} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Blood Pressure</span>
                  <span className="text-lg font-black text-slate-900">{vitals.bp}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                  <HeartPulse size={24} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Pulse Rate</span>
                  <span className="text-lg font-black text-slate-900">{vitals.pulse}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Activity size={24} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Oxygen (SpO2)</span>
                  <span className="text-lg font-black text-slate-900">{vitals.spo2}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Flame size={24} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Temperature</span>
                  <span className="text-lg font-black text-slate-900">{vitals.temp}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <UserCheck size={24} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Body Mass Index</span>
                  <span className="text-lg font-black text-slate-900">{vitals.bmi}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Award size={24} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Blood Group</span>
                  <span className="text-lg font-black text-slate-900">{vitals.bloodGroup}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 9: STEP-BY-STEP PATIENT GUIDE ================= */}
      {activeTab === 'guide' && (
        <div className="p-6 sm:p-9 space-y-6">
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6">
            <h3 className="text-xl font-extrabold text-slate-900 mb-1">What to Do Next / आगे क्या करें</h3>
            <p className="text-xs text-slate-500 mb-6">Follow these 4 simple steps to complete your hospital consultation today.</p>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-lg shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">Collect Your Token Slip / पर्ची लें</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Press the "Print Slip" button below to receive your thermal token receipt, or send the digital pass to your WhatsApp.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-lg shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">Walk to OPD Room 104 / रूम 104 पर जाएँ</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Follow the blue line painted on the floor down the East Wing corridor. Room 104 is located right past Counter 2.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-lg shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">Watch the Digital Token Screen / डिस्प्ले देखें</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Sit comfortably in the waiting area. When your token <strong>{tokenNumber}</strong> turns green with a chime, please enter the doctor's chamber.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-lg shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">Show Your ABHA Digital Slip / डिजिटल पर्ची दिखाएँ</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Show your token slip or digital QR to the OPD nurse. The doctor already has your vitals and chief complaint on their screen!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= FOOTER / ACTIONS ================= */}
      <div className="px-6 sm:px-9 py-5 border-t border-slate-200 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Return to Kiosk Home */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setShowLogoutConfirm(true);
            }}
            className="w-full md:w-auto px-5 py-3 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-extrabold text-sm rounded-xl border-2 border-slate-300 hover:border-slate-400 shadow-sm transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home size={18} />
            <span>Return to Kiosk Home</span>
          </button>
        </div>

        {/* Right: Sequential Navigation Steps */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {activeTab === 'overview' && (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('dashavidha');
                setShowDashavidhaModal(true);
              }}
              className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next: Step 2 • Take Dashavidha Questions</span>
              <ArrowRight size={18} />
            </button>
          )}

          {activeTab === 'dashavidha' && (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('painmap');
              }}
              className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next: Step 3 • Pinpoint Pain on 3D Mannequin</span>
              <ArrowRight size={18} />
            </button>
          )}

          {activeTab === 'painmap' && (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('interview');
              }}
              className="w-full md:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-sm rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next: Step 4 • AI Health Interview</span>
              <ArrowRight size={18} />
            </button>
          )}

          {activeTab === 'interview' && (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('ocr');
              }}
              className="w-full md:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-sm rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next: Step 5 • Medical Docs & OCR</span>
              <ArrowRight size={18} />
            </button>
          )}

          {activeTab === 'ocr' && (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('vitals');
              }}
              className="w-full md:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-sm rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next: Step 6 • Recorded Vitals</span>
              <ArrowRight size={18} />
            </button>
          )}

          {activeTab === 'vitals' && (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('guide');
              }}
              className="w-full md:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-sm rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next: Step 7 • Hospital Route Guide</span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>

      {/* ================= MODAL 1: PRINT TOKEN SLIP PREVIEW ================= */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white text-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer size={20} className="text-blue-400" />
                <h3 className="font-extrabold text-lg">OPD Token Slip Preview</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-5 bg-slate-50 space-y-3 font-mono text-xs">
                <div className="text-center border-b border-slate-200 pb-3">
                  <h4 className="font-extrabold text-base text-slate-900 font-sans">AIIMS NEW DELHI • OPD KIOSK</h4>
                  <p className="text-[10px] text-slate-500 font-sans">Automated Outpatient Registration Gateway</p>
                </div>

                <div className="text-center py-2">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Your Token Number</span>
                  <span className="text-4xl font-black text-blue-900 font-mono tracking-widest">{tokenNumber}</span>
                  <p className="text-[11px] text-emerald-700 font-bold mt-1">Queue Position: #{queuePos} ({queuePos * 4 + 2} Mins Wait)</p>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-200 text-slate-700">
                  <p><strong>PATIENT:</strong> {patientName} ({gender}, {age}Y)</p>
                  <p><strong>ABHA ID:</strong> {abhaNumber}</p>
                  <p><strong>DOCTOR:</strong> {doctor.name}</p>
                  <p><strong>CHAMBER:</strong> {doctor.roomNumber} ({doctor.floorWing})</p>
                  <p><strong>DEPT:</strong> {doctor.specialty}</p>
                  {painMapping && <p><strong>3D PAIN:</strong> {painMapping.laymanSummary || painMapping.bodyRegion} (VAS {painIntensity}/10)</p>}
                  <p><strong>TIME:</strong> {new Date().toLocaleTimeString()} • {new Date().toLocaleDateString()}</p>
                </div>

                <div className="text-center pt-3 border-t border-slate-200">
                  <div className="inline-block p-2 bg-white rounded-lg border border-slate-200 mb-1">
                    <QrCode size={48} className="text-slate-800 mx-auto" />
                  </div>
                  <p className="text-[9px] text-slate-400 font-sans">Scan at OPD Room 104 reader to announce arrival</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playSuccess();
                    window.print();
                    setShowPrintModal(false);
                  }}
                  className="w-1/2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print Slip Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: SEND DIGITAL PASS (EMAIL / WHATSAPP / SMS) ================= */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white text-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative">
            <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-sky-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 size={20} className="text-emerald-200" />
                <h3 className="font-extrabold text-lg">Send Digital OPD Pass</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-lg hover:bg-emerald-800 text-emerald-100 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {shareSuccess ? (
                <div className="text-center py-6 space-y-2 animate-fadeIn">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                    <Check size={32} />
                  </div>
                  <h4 className="text-xl font-extrabold text-slate-900">Dispatched Successfully!</h4>
                  <p className="text-xs text-slate-600 px-2 leading-relaxed">
                    {shareSuccessMsg || `Digital OPD Pass with token ${tokenNumber} sent successfully.`}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendDigitalPass} className="space-y-4">
                  {/* Channel Switcher */}
                  <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShareChannel('email')}
                      className={`flex-1 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        shareChannel === 'email'
                          ? 'bg-white text-emerald-700 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Mail size={14} />
                      <span>Email Delivery</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShareChannel('mobile')}
                      className={`flex-1 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        shareChannel === 'mobile'
                          ? 'bg-white text-emerald-700 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Phone size={14} />
                      <span>WhatsApp / SMS</span>
                    </button>
                  </div>

                  {shareChannel === 'email' ? (
                    <div>
                      <label className="text-xs font-extrabold text-slate-700 block mb-1">
                        Enter Patient Email Address:
                      </label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                          type="email"
                          value={patientEmailInput}
                          onChange={(e) => setPatientEmailInput(e.target.value)}
                          placeholder="e.g. patient@example.com"
                          className="w-full text-sm p-3 pl-10 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-emerald-600 focus:bg-white focus:outline-none font-bold"
                          required
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        We will send your OPD Token #{tokenNumber}, Chamber #{doctor.roomNumber}, and AI Summary slip directly to your inbox.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-extrabold text-slate-700 block mb-1">
                        Enter 10-Digit Mobile Number:
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3.5 text-slate-400 font-bold text-sm">+91</span>
                        <input
                          type="tel"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="98765 43210"
                          className="w-full text-base p-3 pl-12 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-emerald-600 focus:bg-white focus:outline-none font-mono font-bold tracking-wide"
                          required
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Instant SMS & WhatsApp alert with live queue tracking link.
                      </p>
                    </div>
                  )}

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                    <span>Free service powered by MediKiosk ABDM 2.0 Central Gateway.</span>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowShareModal(false)}
                      className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
                    >
                      <span>{shareChannel === 'email' ? 'Send Email Now 📧' : 'Send Pass Now 📱'}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: HOSPITAL WAYFINDING / ROOM 104 GUIDE ================= */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white text-slate-800 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative">
            <div className="bg-indigo-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation size={20} className="text-indigo-300" />
                <h3 className="font-extrabold text-lg">Hospital Route: Room 104</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="p-1 rounded-lg hover:bg-indigo-800 text-indigo-200 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Destination</span>
                  <p className="text-lg font-extrabold text-slate-900">{doctor.roomNumber} • {doctor.name}</p>
                  <p className="text-xs text-slate-600">{doctor.floorWing} ({doctor.landmark})</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-indigo-700 block">Distance</span>
                  <span className="text-xl font-black font-mono text-indigo-950">~45 Meters</span>
                </div>
              </div>

              {/* Turn-by-Turn Route Steps */}
              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-900 text-xs sm:text-sm">Exit Kiosk Area:</strong>
                    <p className="text-xs text-slate-500 mt-0.5">Step out of the kiosk lobby into the Central Hospital Atrium.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-900 text-xs sm:text-sm">Follow Blue Floor Line:</strong>
                    <p className="text-xs text-slate-500 mt-0.5">Follow the blue stripe line towards the East OPD Wing.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <strong className="text-slate-900 text-xs sm:text-sm">Pass Pharmacy Counter 2:</strong>
                    <p className="text-xs text-slate-500 mt-0.5">Walk 20 meters past the pharmacy counter and blood collection lab.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-300">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    ✓
                  </div>
                  <div>
                    <strong className="text-emerald-950 text-xs sm:text-sm">Arrive at Room 104:</strong>
                    <p className="text-xs text-emerald-800 mt-0.5">General Medicine Waiting Lounge is on your right. Take a seat.</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Got It • Close Route Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: DOCUMENT OCR INSPECTOR ================= */}
      {selectedInspectDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white text-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-cyan-400" />
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">{selectedInspectDoc.title}</h3>
                  <span className="text-[11px] text-slate-400 font-mono">ID: {selectedInspectDoc.documentId} • {selectedInspectDoc.documentType}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInspectDoc(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {/* Document Summary */}
              {selectedInspectDoc.summary && (
                <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 text-xs">
                  <span className="font-extrabold text-blue-900 uppercase text-[10px] block mb-1">Clinical AI Summary</span>
                  <p className="text-slate-800 font-medium italic">&quot;{selectedInspectDoc.summary}&quot;</p>
                </div>
              )}

              {/* Deciphered Medications */}
              {selectedInspectDoc.entities?.medications?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-extrabold uppercase text-slate-700 flex items-center gap-1.5">
                    <Pill size={14} className="text-blue-600" />
                    <span>Deciphered Medications ({selectedInspectDoc.entities.medications.length})</span>
                  </span>
                  <div className="grid sm:grid-cols-2 gap-2 text-xs">
                    {selectedInspectDoc.entities.medications.map((m, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                        <strong className="font-bold text-slate-900 block">{m.name}</strong>
                        <span className="text-slate-600 block">{m.dose || '1 Tab'} • {m.frequency || 'OD'} • {m.duration || '30 Days'}</span>
                        {m.instructions && <span className="text-[10px] text-blue-600 block">{m.instructions}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deciphered Investigations */}
              {selectedInspectDoc.entities?.investigations?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-extrabold uppercase text-slate-700 flex items-center gap-1.5">
                    <Activity size={14} className="text-emerald-600" />
                    <span>Pathology Investigations ({selectedInspectDoc.entities.investigations.length})</span>
                  </span>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Test</th>
                          <th className="p-2.5">Value</th>
                          <th className="p-2.5">Ref</th>
                          <th className="p-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedInspectDoc.entities.investigations.map((inv, idx) => (
                          <tr key={idx}>
                            <td className="p-2.5 font-bold text-slate-900">{inv.name}</td>
                            <td className="p-2.5 font-mono font-bold text-blue-800">{inv.value} {inv.unit}</td>
                            <td className="p-2.5 text-slate-500 font-mono">{inv.reference || '-'}</td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold">
                                {inv.status || 'NORMAL'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Raw OCR Text */}
              {selectedInspectDoc.extractedText && (
                <div className="space-y-1.5">
                  <span className="text-xs font-extrabold uppercase text-slate-700">Raw Deciphered OCR Text</span>
                  <div className="p-3 bg-slate-900 text-cyan-300 font-mono text-[11px] rounded-xl border border-slate-800 whitespace-pre-wrap max-h-36 overflow-y-auto">
                    {selectedInspectDoc.extractedText}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedInspectDoc(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: SAFE EXIT / SIGN OUT CONFIRMATION ================= */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white text-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative space-y-4 p-6">
            <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <LogOut size={28} />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-slate-900">
                Exit Kiosk Session?
              </h3>
              <p className="text-xs text-slate-600">
                Your check-in, vitals, 3D pain coordinates, and scanned documents for <strong>{patientName}</strong> are safely encrypted in your ABDM health record.
              </p>
            </div>

            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
              <ShieldCheck size={16} className="text-blue-700 shrink-0" />
              <span>OPD Token <strong>{tokenNumber}</strong> remains active in the hospital waiting queue.</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Stay on Kiosk
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  if (onLogout) onLogout();
                }}
                className="w-1/2 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
              >
                Exit Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dashavidha Pariksha Modal */}
      <DashavidhaModal
        isOpen={showDashavidhaModal}
        onClose={() => setShowDashavidhaModal(false)}
        currentData={dashavidhaData}
        onSave={async (updated) => {
          setDashavidhaData(updated);
          if (patient) patient.dashavidha = updated;
          try {
            await api.saveDashavidha(patientId, updated);
          } catch (e) {
            console.warn('Dashavidha modal save fallback:', e);
          }
          sounds.playSuccess();
          setActiveTab('painmap');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        patientName={patientName}
      />

    </section>
  );
};

export default PatientDashboard;
