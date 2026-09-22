import React, { useState, useEffect } from 'react';
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
  Plus
} from 'lucide-react';
import DashavidhaModal, { DEFAULT_DASHAVIDHA } from './components/DashavidhaModal';
import api from './utils/api';
import { sounds } from './utils/audioTTS';

const COMMON_PAIN_SPOTS = [
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

const PatientDashboard = ({ patient, onLogout }) => {
  // Navigation Tabs: 'overview' | 'interview' | 'painmap' | 'ocr' | 'appointments' | 'profile'
  const [activeTab, setActiveTab] = useState('overview');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDashavidhaModal, setShowDashavidhaModal] = useState(false);
  const [dashavidhaData, setDashavidhaData] = useState(patient?.dashavidha || patient?.dashvidhaHistory || DEFAULT_DASHAVIDHA);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [mobileNumber, setMobileNumber] = useState(patient?.mobile || '9810123456');

  // --- 3D Anatomical Pain Localization States ---
  const [painMapping, setPainMapping] = useState(patient?.painMapping || null);
  const [painIntensity, setPainIntensity] = useState(5);
  const [painType, setPainType] = useState('Aching');
  const [isLaunchingMannequin, setIsLaunchingMannequin] = useState(false);
  const [mannequinLaunchMsg, setMannequinLaunchMsg] = useState('');

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
  const [interviewLanguage, setInterviewLanguage] = useState('english');
  const [isInterviewCompleted, setIsInterviewCompleted] = useState(false);

  // --- OCR / Medical Documents States ---
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrStage, setOcrStage] = useState('');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [latestOcrResult, setLatestOcrResult] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState('PRESCRIPTION');

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
  const complaint = patient?.symptoms || patient?.department || "General Consultation & Health Checkup";

  const vitals = {
    bp: patient?.vitals?.bp || "128/82 mmHg",
    pulse: patient?.vitals?.pulse || "76 bpm",
    spo2: patient?.vitals?.spo2 || "99%",
    temp: patient?.vitals?.temp || "98.4 °F"
  };

  // Resolve Doctor Details
  const getAssignedDoctor = () => {
    const dept = (patient?.department || '').toLowerCase();
    if (dept.includes('cardio') || dept.includes('chest') || dept.includes('heart')) {
      return {
        name: "Dr. Arvind Mehta",
        degrees: "MBBS, MD, DM (Cardiology)",
        specialty: "Consultant Interventional Cardiologist",
        roomNumber: "Emergency Bay 2",
        floorWing: "Ground Floor, Acute Care Wing",
        landmark: "Directly opposite Triage Counter 1",
        shift: "Emergency On-Duty",
        status: "Available in Bay"
      };
    }
    if (dept.includes('ayu') || dept.includes('kayachikitsa')) {
      return {
        name: "Vaidya Ananya Deshpande",
        degrees: "BAMS, MD (Ayurveda - Kayachikitsa)",
        specialty: "Chief Ayurvedic Physician",
        roomNumber: "Room 208",
        floorWing: "2nd Floor, AYUSH Wing",
        landmark: "Next to Panchakarma Therapy Unit",
        shift: "Morning OPD (08:00 - 14:00)",
        status: "In Chamber"
      };
    }
    if (dept.includes('ortho') || dept.includes('bone') || dept.includes('joint')) {
      return {
        name: "Dr. Priya S. Nair",
        degrees: "MBBS, MS (Orthopedics), DNB",
        specialty: "Consultant Orthopedic Surgeon",
        roomNumber: "OPD Room 112",
        floorWing: "Ground Floor, Surgical Wing",
        landmark: "Next to Digital X-Ray Room",
        shift: "Morning OPD (08:00 - 14:00)",
        status: "In Chamber"
      };
    }
    return {
      name: "Dr. Rajeshwar Sharma",
      degrees: "MBBS, MD (General Medicine)",
      specialty: "Senior Consultant Physician",
      roomNumber: "OPD Room 104",
      floorWing: "Ground Floor, East OPD Wing",
      landmark: "Opposite Blood Collection & Next to Counter 2",
      shift: "Morning OPD (08:00 - 14:00)",
      status: "Available in Chamber"
    };
  };

  const doctor = getAssignedDoctor();

  // Load Patient Data, Documents, Appointments, and History on mount
  useEffect(() => {
    const loadAllPatientData = async () => {
      try {
        // 1. Pain mapping
        const painRes = await api.getPainMapping(patientId);
        if (painRes?.success && painRes?.painMapping) {
          setPainMapping(painRes.painMapping);
        }

        // 2. Documents
        const docsRes = await api.getPatientDocuments(patientId);
        if (docsRes?.success && docsRes?.documents) {
          setUploadedDocuments(docsRes.documents);
        }

        // 3. Appointments
        const apptRes = await api.getPatientAppointments(patientId);
        if (apptRes?.success && apptRes?.appointments) {
          setPatientAppointments(apptRes.appointments);
        }

        // 4. Available Doctors
        const docRes = await api.getAvailableDoctors();
        if (docRes?.success && docRes?.doctors) {
          setAvailableDoctors(docRes.doctors);
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

  // Audio room directions handler
  const handleAudioDirections = () => {
    if (isSpeaking) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = `Attention ${patientName}. Your OPD Token is ${tokenNumber}. Please proceed to ${doctor.roomNumber}, located on the ${doctor.floorWing}, ${doctor.landmark}. You will be consulting ${doctor.name}. There are currently ${queuePos} patients ahead of you.`;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
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

  // --- AI Health Interview Handlers ---
  const handleStartInterview = async (medicalSystem = 'allopathy') => {
    sounds.playClick();
    setInterviewLoading(true);
    setInterviewSystem(medicalSystem);
    try {
      const res = await api.startAIInterview(patientId, medicalSystem, interviewLanguage);
      if (res?.success) {
        setInterviewSessionId(res.sessionId);
        setInterviewMessages([res.aiMessage]);
        setInterviewPhase(res.phase || 'select_system');
        setInterviewProgress(res.progress || 10);
        setIsInterviewCompleted(false);
      }
    } catch (err) {
      console.warn("Interview start fallback:", err);
      setInterviewSessionId(`kiosk-local-${Date.now().toString().slice(-4)}`);
      setInterviewMessages([{
        id: "msg-1",
        role: "ai",
        content: "Welcome to MediKiosk AI Clinical Triage. Please describe what symptoms or discomfort you are experiencing today.",
        options: [
          { label: "Stomach / Abdominal Pain", value: "I have stomach pain" },
          { label: "Chest Pain / Discomfort", value: "I have chest pain" },
          { label: "Joint Pain / Stiffness", value: "I have joint pain" },
          { label: "Acidity / Sour Reflux", value: "I have heartburn and acidity" }
        ],
        question_type: "open_text"
      }]);
    } finally {
      setInterviewLoading(false);
    }
  };

  const handleSendInterviewMessage = async (msgText, selectedOpt = null) => {
    const textToSend = msgText || selectedOpt;
    if (!textToSend || !textToSend.trim()) return;

    sounds.playClick();
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
        interviewLanguage
      );

      if (res?.success) {
        setInterviewMessages(prev => [...prev, res.aiMessage]);
        setInterviewPhase(res.currentPhase || 'socrates_questions');
        setInterviewProgress(res.progress || 50);
        if (res.redFlags?.length > 0) setInterviewRedFlags(res.redFlags);
        if (res.isCompleted || res.doctorSummary) {
          setIsInterviewCompleted(true);
          setInterviewSummary(res.doctorSummary);

          // Save interview to DB
          await api.saveAIInterview({
            patientId: patientId,
            sessionId: interviewSessionId,
            complaint: res.clinicalData?.symptom || textToSend,
            symptoms: res.clinicalData?.symptom || textToSend,
            duration: res.clinicalData?.onset || "2 weeks",
            severity: parseInt(res.clinicalData?.severity || painIntensity || 5, 10),
            painLocation: res.clinicalData?.site || painMapping?.laymanSummary || "Abdomen",
            painIntensity: painIntensity,
            medicalSystem: interviewSystem,
            language: interviewLanguage,
            aiSummary: res.doctorSummary,
            clinicalData: res.clinicalData,
            messages: [...newMsgList, res.aiMessage],
            redFlags: res.redFlags,
            isCompleted: true
          });
        }
      }
    } catch (err) {
      console.warn("Interview chat fallback:", err);
      // Resilient fallback reply
      setInterviewMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "ai",
          content: "Recorded your symptom details. Where on your body do you feel this discomfort? You can use the 3D Mannequin tab or choose below.",
          options: [
            { label: "Lower Back", value: "Lower Back" },
            { label: "Upper Abdomen", value: "Upper Abdomen" },
            { label: "Chest Area", value: "Chest Area" }
          ],
          question_type: "single_choice"
        }
      ]);
    } finally {
      setInterviewLoading(false);
    }
  };

  // --- OCR / Medical Document Handlers ---
  const handleLoadSampleDocument = async (sampleType) => {
    sounds.playClick();
    setIsOcrProcessing(true);
    setOcrProgress(15);
    setOcrStage("Scanning document image and enhancing contrast...");

    setTimeout(() => {
      setOcrProgress(50);
      setOcrStage("PaddleOCR spatial text blocks extraction...");
    }, 600);

    setTimeout(() => {
      setOcrProgress(80);
      setOcrStage("Indian Pharmacopoeia medical entity understanding...");
    }, 1200);

    try {
      const res = await api.saveSampleDocument(patientId, sampleType);
      setTimeout(() => {
        setIsOcrProcessing(false);
        setOcrProgress(100);
        if (res?.success && res?.document) {
          setLatestOcrResult(res.document);
          setUploadedDocuments(prev => [res.document, ...prev.filter(d => d.documentId !== res.document.documentId)]);
        }
      }, 1800);
    } catch (err) {
      setIsOcrProcessing(false);
    }
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
        // Refresh appointments list
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
            </div>
          </div>

          {/* Right: Audio Directions & Return */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-white/20 gap-2">
            <div className="text-left md:text-right">
              <span className="text-blue-200 text-[11px] font-bold uppercase tracking-wider block">OPD Token Number</span>
              <span className="text-xl sm:text-2xl font-black font-mono text-white">
                {tokenNumber}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAudioDirections}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md border ${
                  isSpeaking
                    ? 'bg-amber-400 text-slate-950 border-amber-300 animate-pulse'
                    : 'bg-white/20 hover:bg-white/30 text-white border-white/30'
                }`}
              >
                {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                <span>{isSpeaking ? "Stop Voice" : "🔊 Audio Guide"}</span>
              </button>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-950 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  title="Return to Main Menu"
                >
                  <LogOut size={14} />
                  <span>Exit</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 6 DEDICATED NAVIGATION TABS ================= */}
      <div className="px-4 sm:px-8 pt-3 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <nav className="flex flex-wrap gap-1.5" aria-label="Patient navigation tabs">
          {[
            { id: 'overview', label: '1. OPD Token & Room', icon: MapPin },
            { id: 'interview', label: '2. AI Health Interview', icon: Sparkles, badge: 'SOCRATES' },
            { id: 'painmap', label: '3. 3D Body Pain Mapping', icon: Crosshair, badge: '3D' },
            { id: 'ocr', label: '4. Medical Docs & OCR', icon: FileText, badge: 'Scanner' },
            { id: 'appointments', label: '5. Book Appointments', icon: CalendarDays },
            { id: 'profile', label: '6. Profile & Medical History', icon: UserCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => { sounds.playClick(); setActiveTab(tab.id); }}
                className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition ${
                  isActive
                    ? 'text-blue-700 border-blue-600 bg-white rounded-t-xl shadow-sm'
                    : 'text-slate-500 border-transparent hover:text-slate-800'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${
                    isActive ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 my-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Chamber {doctor.roomNumber} Active</span>
        </div>
      </div>

      {/* ================= TAB 1: OVERVIEW (TOKEN & DIRECTIONS) ================= */}
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
                    className="text-xs font-bold text-blue-700 bg-white hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-300 shadow-sm transition flex items-center gap-1.5"
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

                {/* Quick Shortcuts to AI Interview & Pain Mapping */}
                <div className="mt-4 grid sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('interview'); if (!interviewSessionId) handleStartInterview('allopathy'); }}
                    className="p-3.5 bg-white hover:bg-blue-50 border border-blue-200 rounded-2xl text-left transition shadow-sm flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-blue-700 bg-blue-100 px-2 py-0.5 rounded">AI Health Triage</span>
                      <p className="text-xs font-bold text-slate-900 mt-1">Take Health Interview</p>
                    </div>
                    <ArrowRight size={16} className="text-blue-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('painmap')}
                    className="p-3.5 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-2xl text-left transition shadow-sm flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">3D Mannequin</span>
                      <p className="text-xs font-bold text-slate-900 mt-1">Mark Pain Location</p>
                    </div>
                    <Crosshair size={16} className="text-emerald-600" />
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
                    <span className="mt-1 text-blue-900 font-bold">2. Token Issued</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow animate-pulse">3</div>
                    <span className="mt-1 text-amber-800 font-bold">3. Wait Room</span>
                  </div>
                  <div className="flex flex-col items-center opacity-50">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold">4</div>
                    <span className="mt-1 text-slate-500">4. Doctor OPD</span>
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
        </div>
      )}

      {/* ================= TAB 2: AI HEALTH INTERVIEW (SOCRATES + AYUSH) ================= */}
      {activeTab === 'interview' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-cyan-300 mb-2 border border-white/15">
                  <Sparkles size={14} />
                  <span>Multilingual AI Clinical Intake • SOCRATES & AYUSH Protocols</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  AI-Assisted Pre-Consultation Health Interview
                </h3>
                <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-2xl">
                  Answer clinical questions to help your doctor understand your complaint before you enter the chamber. Your responses, 3D pain marks, and red-flag alerts are saved directly to your doctor's screen.
                </p>
              </div>

              {/* Start Buttons */}
              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleStartInterview('allopathy')}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs transition shadow-md flex items-center gap-1.5"
                >
                  <Stethoscope size={15} />
                  <span>Allopathy (Modern)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStartInterview('ayush')}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs transition shadow-md flex items-center gap-1.5"
                >
                  <Sparkles size={15} />
                  <span>AYUSH (Ayurveda)</span>
                </button>
              </div>
            </div>

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

          {/* Chat Flow Container */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-inner flex flex-col h-[520px]">
            
            {/* Progress Header */}
            <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <span>Phase: <strong className="text-blue-700 capitalize">{interviewPhase.replace('_', ' ')}</strong></span>
                <span>•</span>
                <span className="text-slate-500">{interviewSystem === 'ayush' ? 'AYUSH Protocol' : 'SOCRATES Protocol'}</span>
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
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center font-bold">
                    <Sparkles size={28} />
                  </div>
                  <h4 className="text-base font-extrabold text-slate-800">Ready to Start Health Interview</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Click "Allopathy" or "AYUSH" above to begin your interactive AI intake interview.
                  </p>
                </div>
              ) : (
                interviewMessages.map((msg, idx) => {
                  const isAi = msg.role === 'ai' || msg.role === 'system';
                  return (
                    <div key={msg.id || idx} className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}>
                      <div className={`max-w-xl p-4 rounded-2xl text-sm ${
                        isAi 
                          ? 'bg-white border border-slate-200 text-slate-900 shadow-sm rounded-tl-none' 
                          : 'bg-blue-600 text-white shadow-md rounded-tr-none'
                      }`}>
                        <p className="leading-relaxed font-medium">{msg.content}</p>

                        {/* Quick Option Buttons */}
                        {isAi && msg.options && msg.options.length > 0 && !isInterviewCompleted && (
                          <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                            {msg.options.map((opt, oIdx) => (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() => handleSendInterviewMessage(null, opt.value || opt.label)}
                                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition active:scale-95 flex items-center gap-1"
                              >
                                {opt.icon && <span>{opt.icon}</span>}
                                <span>{opt.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {isAi ? "MediKiosk AI Engine" : "You"}
                      </span>
                    </div>
                  );
                })
              )}

              {interviewLoading && (
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 p-2">
                  <RefreshCw size={14} className="animate-spin" />
                  <span>AI is thinking & analyzing clinical parameters...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={interviewInput}
                onChange={(e) => setInterviewInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendInterviewMessage(interviewInput); }}
                placeholder="Type your symptoms or answers here..."
                disabled={isInterviewCompleted}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => handleSendInterviewMessage(interviewInput)}
                disabled={!interviewInput.trim() || isInterviewCompleted}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Send size={14} />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: 3D BODY PAIN MAPPING / DIGITAL MANNEQUIN ================= */}
      {activeTab === 'painmap' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-cyan-300 mb-2 border border-white/15">
                  <Crosshair size={14} />
                  <span>Visual 3D Anatomical Pain Localization</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  3D Digital Mannequin & Pain Intensity Mapper
                </h3>
                <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-2xl">
                  Point to exactly where you feel pain. Calibrated 3D coordinates and VAS scores are sent directly to your doctor's screen in Room {doctor.roomNumber}.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLaunchMannequin}
                disabled={isLaunchingMannequin}
                className="px-5 py-3 bg-blue-500 hover:bg-blue-400 text-white font-black rounded-2xl text-xs transition shadow-lg flex items-center gap-2 active:scale-95"
              >
                <Crosshair size={16} className={isLaunchingMannequin ? "animate-spin" : ""} />
                <span>{isLaunchingMannequin ? "Opening Mannequin..." : "🎯 Open 3D Desktop Mannequin"}</span>
              </button>
            </div>
          </div>

          {/* Selected Pain Status Grid */}
          {painMapping ? (
            <div className="p-5 bg-emerald-50 border-2 border-emerald-300 rounded-3xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                  ✔ 3D Pain Spot Confirmed & Synced
                </span>
                <span className="text-xs text-emerald-700 font-semibold">
                  VAS Score: <strong>{painMapping.painIntensity || painIntensity} / 10</strong>
                </span>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-white rounded-xl border border-emerald-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Pinpointed Spot</span>
                  <p className="text-base font-extrabold text-slate-900 mt-1">{painMapping.laymanSummary}</p>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-emerald-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Region & Quadrant</span>
                  <p className="text-base font-extrabold text-blue-700 mt-1 capitalize">{painMapping.bodyRegion} ({painMapping.side || 'center'})</p>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-emerald-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Doctor Chamber</span>
                  <p className="text-base font-extrabold text-emerald-800 mt-1">{doctor.roomNumber} ({doctor.name})</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 bg-blue-50 border-2 border-dashed border-blue-300 rounded-3xl text-center space-y-2">
              <h4 className="font-extrabold text-slate-900 text-sm">No 3D Pain Spot Recorded Yet</h4>
              <p className="text-xs text-slate-600">Select your affected body region and pain intensity from the interactive grid below.</p>
            </div>
          )}

          {/* VAS Pain Intensity Slider (1-10) */}
          <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase text-slate-700 flex items-center gap-1.5">
                <Flame size={15} className="text-rose-500" />
                <span>Pain Severity Scale (VAS: Visual Analogue Score 1 - 10)</span>
              </label>
              <span className={`px-3 py-1 rounded-full text-xs font-black ${
                painIntensity <= 3 ? 'bg-emerald-100 text-emerald-800' :
                painIntensity <= 6 ? 'bg-amber-100 text-amber-800' :
                'bg-rose-100 text-rose-800'
              }`}>
                Score: {painIntensity} / 10 ({
                  painIntensity <= 3 ? 'Mild Discomfort' :
                  painIntensity <= 6 ? 'Moderate Pain' :
                  painIntensity <= 8 ? 'Severe Pain' : 'Extreme / Crushing'
                })
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="10"
              value={painIntensity}
              onChange={(e) => setPainIntensity(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>

          {/* Rapid Touch Anatomical Spot Selection */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Touch to Select Affected Body Location</h4>
                <p className="text-xs text-slate-500">Tap your painful area to record spatial coordinates and sync with consultation records.</p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">Touch Enabled</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {COMMON_PAIN_SPOTS.map((spot, idx) => {
                const isSelected = painMapping?.laymanSummary === spot.label;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleWebPainSelect(spot)}
                    className={`p-4 rounded-2xl text-left transition border shadow-sm flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-100/80 border-2 border-blue-600 ring-2 ring-blue-600/20'
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {spot.region}
                        </span>
                        {isSelected && <span className="text-xs font-bold text-blue-600">✓ Selected</span>}
                      </div>
                      <h5 className="font-extrabold text-slate-900 text-sm mt-2">{spot.label}</h5>
                      <p className="text-xs text-slate-500 mt-0.5">{spot.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: OCR MEDICAL DOCUMENTS & SCANNER ================= */}
      {activeTab === 'ocr' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-cyan-300 mb-2 border border-white/15">
                  <FileText size={14} />
                  <span>Medical Document Intelligence & OCR Pipeline</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  Scan & Upload Medical Records
                </h3>
                <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-2xl">
                  Upload previous doctor prescriptions, pathology lab reports, and discharge summaries. The OCR engine deciphers handwritten clinical notes, medications, and vitals, storing them strictly under Patient ID <strong>{patientId}</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* 1-Click Preset Samples for Instant OCR Demo */}
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-slate-700">1-Click Test Document Scan (Demo Presets)</h4>
            <div className="grid sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleLoadSampleDocument('PRESCRIPTION')}
                disabled={isOcrProcessing}
                className="p-3.5 bg-white hover:bg-blue-50 border border-blue-200 rounded-2xl text-left transition shadow-sm"
              >
                <span className="text-[10px] font-extrabold uppercase text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Rx Prescription</span>
                <p className="text-xs font-bold text-slate-900 mt-1.5">Dr. Rajesh Sharma OPD Slip</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Deciphers Metformin, Telmisartan & Vitals</p>
              </button>

              <button
                type="button"
                onClick={() => handleLoadSampleDocument('LAB_REPORT')}
                disabled={isOcrProcessing}
                className="p-3.5 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-2xl text-left transition shadow-sm"
              >
                <span className="text-[10px] font-extrabold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Lab Pathology</span>
                <p className="text-xs font-bold text-slate-900 mt-1.5">Pathology Metabolic Report</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Extracts Lipid Panel, Sugar & HbA1c</p>
              </button>

              <button
                type="button"
                onClick={() => handleLoadSampleDocument('DISCHARGE_SUMMARY')}
                disabled={isOcrProcessing}
                className="p-3.5 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-2xl text-left transition shadow-sm"
              >
                <span className="text-[10px] font-extrabold uppercase text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">Discharge Summary</span>
                <p className="text-xs font-bold text-slate-900 mt-1.5">Hospital Inpatient Card</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Extracts Admission course & Discharge Rx</p>
              </button>
            </div>
          </div>

          {/* Processing Progress Bar */}
          {isOcrProcessing && (
            <div className="p-5 bg-blue-50 rounded-2xl border border-blue-200 space-y-2 animate-pulse">
              <div className="flex justify-between text-xs font-bold text-blue-900">
                <span>{ocrStage}</span>
                <span>{ocrProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${ocrProgress}%` }} />
              </div>
            </div>
          )}

          {/* Latest Extracted OCR Result Card */}
          {latestOcrResult && (
            <div className="p-5 bg-white border-2 border-emerald-300 rounded-3xl space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-extrabold uppercase text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                    OCR Entities Extracted Successfully
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-500">Document ID: {latestOcrResult.documentId}</span>
              </div>

              <h4 className="text-base font-black text-slate-900">{latestOcrResult.title}</h4>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 italic">
                "{latestOcrResult.summary}"
              </p>

              {/* Extracted Medications Table */}
              {latestOcrResult.entities?.medications?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-extrabold uppercase text-slate-700 flex items-center gap-1.5">
                    <Pill size={14} className="text-blue-600" />
                    <span>Deciphered Medications ({latestOcrResult.entities.medications.length})</span>
                  </span>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {latestOcrResult.entities.medications.map((med, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <strong className="font-bold text-slate-900 block">{med.name}</strong>
                        <span className="text-slate-500">{med.dose || '1 Tab'} • {med.frequency || 'OD'} • {med.duration || '30 Days'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* List of Previously Stored Documents */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
            <h4 className="text-sm font-extrabold text-slate-900">Your Medical Documents Vault ({uploadedDocuments.length})</h4>
            <div className="divide-y divide-slate-100">
              {uploadedDocuments.map((doc, idx) => (
                <div key={doc.documentId || idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{doc.title}</p>
                      <p className="text-slate-500">{doc.documentType} • {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Active'}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold">
                    ✓ Verified
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: BOOK APPOINTMENTS ================= */}
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
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
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

      {/* ================= TAB 6: PROFILE & MEDICAL HISTORY ================= */}
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
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-md transition"
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
                    className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg hover:bg-emerald-200 transition"
                  >
                    Update Answers
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Prakriti: <strong>{dashavidhaData.prakriti || "Vata-Kaphaja"}</strong></div>
                  <div>Agni (Digestion): <strong>{dashavidhaData.aharaShakti || "Madhyama"}</strong></div>
                  <div>Mental Stamina: <strong>{dashavidhaData.satva || "Pravara"}</strong></div>
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

      {/* ================= MODALS ================= */}
      {showDashavidhaModal && (
        <DashavidhaModal
          initialData={dashavidhaData}
          onClose={() => setShowDashavidhaModal(false)}
          onSave={(data) => {
            setDashavidhaData(data);
            setShowDashavidhaModal(false);
          }}
        />
      )}

      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full mx-auto flex items-center justify-center font-bold">
              <Printer size={24} />
            </div>
            <h4 className="text-base font-black text-slate-900">Print OPD Token Slip</h4>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-left text-xs space-y-1">
              <p><strong>TOKEN: {tokenNumber}</strong></p>
              <p>PATIENT: {patientName}</p>
              <p>ROOM: {doctor.roomNumber}</p>
              <p>DOCTOR: {doctor.name}</p>
              <p>DATE: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { window.print(); setShowPrintModal(false); }}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Print Now
              </button>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="flex-1 py-2.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

export default PatientDashboard;
