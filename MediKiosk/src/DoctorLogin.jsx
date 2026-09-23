import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Award, 
  Building2, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Search, 
  AlertTriangle, 
  UserCheck, 
  Lock, 
  ChevronRight, 
  Filter, 
  UserPlus, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Plus, 
  Key, 
  LogIn, 
  Activity, 
  Check 
} from 'lucide-react';
import { sounds } from './utils/audioTTS';
import { MedicalDoodleBackground } from './LoginKiosk';
import api, { getStoredDoctors, saveRegisteredDoctor } from './utils/api';

// Verified Hospital Doctor Directory & Qualifications Roster
export const DOCTOR_DIRECTORY = [
  {
    id: "doc-1",
    name: "Dr. Rajeshwar Sharma",
    avatar: "RS",
    degrees: "MBBS, MD (General Medicine)",
    specialty: "Senior Consultant Physician",
    institution: "All India Institute of Medical Sciences (AIIMS), New Delhi",
    experience: "14 Years Clinical Experience",
    council: "Delhi Medical Council (DMC)",
    regNumber: "DMC-2012-8849",
    hprId: "dr.sharma@hpr.abdm",
    stream: "allopathy",
    department: "General Medicine",
    roomNumber: "OPD Room 104",
    shift: "Morning OPD (08:00 - 14:00)",
    status: "On Duty",
    bio: "Specializes in adult internal medicine, hypertension, diabetes management, and acute infection triage.",
    clinicalBadgeColor: "blue"
  },
  {
    id: "doc-2",
    name: "Vaidya Ananya Deshpande",
    avatar: "AD",
    degrees: "BAMS, MD (Ayurveda - Kayachikitsa)",
    specialty: "Chief Ayurvedic Physician & Panchakarma Specialist",
    institution: "National Institute of Ayurveda (NIA), Jaipur",
    experience: "11 Years Clinical Experience",
    council: "NCISM / Maharashtra Board of Ayurvedic Medicine",
    regNumber: "NCISM-AYU-88210",
    hprId: "vaidya.ananya@hpr.abdm",
    stream: "ayush",
    department: "Ayurvedic OPD & Panchakarma",
    roomNumber: "Room 208 (AYUSH Wing)",
    shift: "Morning OPD (08:00 - 14:00)",
    status: "On Duty",
    bio: "Expert in Dashavidha Pariksha diagnosis, Amla Pitta, metabolic rehabilitation, and herbal pharmacotherapy.",
    clinicalBadgeColor: "emerald"
  },
  {
    id: "doc-3",
    name: "Dr. Arvind Mehta",
    avatar: "AM",
    degrees: "MBBS, MD, DM (Cardiology)",
    specialty: "Consultant Interventional Cardiologist",
    institution: "Postgraduate Institute of Medical Education & Research (PGIMER), Chandigarh",
    experience: "18 Years Clinical Experience",
    council: "National Medical Commission (NMC)",
    regNumber: "NMC-2008-4421",
    hprId: "dr.mehta@hpr.abdm",
    stream: "allopathy",
    department: "Cardiology & Acute Triage",
    roomNumber: "Emergency Bay 2",
    shift: "Emergency On-Call",
    status: "On Duty",
    bio: "Lead acute chest pain specialist, coronary angiogram expert, and emergency cardiac triage lead.",
    clinicalBadgeColor: "rose"
  },
  {
    id: "doc-4",
    name: "Dr. Priya S. Nair",
    avatar: "PN",
    degrees: "MBBS, MS (Orthopedics), DNB",
    specialty: "Consultant Orthopedic Surgeon",
    institution: "Jawaharlal Institute of Postgraduate Medical Education (JIPMER), Puducherry",
    experience: "9 Years Clinical Experience",
    council: "Travancore-Cochin Medical Council (TCMC)",
    regNumber: "TCMC-2015-1102",
    hprId: "dr.priya@hpr.abdm",
    stream: "allopathy",
    department: "Orthopedics & Joint Clinic",
    roomNumber: "OPD Room 112",
    shift: "Morning OPD (08:00 - 14:00)",
    status: "Available",
    bio: "Specializes in joint degeneration, spine rehabilitation, osteoporosis management, and sports trauma.",
    clinicalBadgeColor: "indigo"
  },
  {
    id: "doc-5",
    name: "Dr. Mohammed Farooq",
    avatar: "MF",
    degrees: "MBBS, MD (Pediatrics), FIAP",
    specialty: "Consultant Pediatrician & Neonatologist",
    institution: "Kasturba Medical College (KMC), Manipal",
    experience: "12 Years Clinical Experience",
    council: "Karnataka Medical Council (KMC)",
    regNumber: "KMC-2014-9931",
    hprId: "dr.farooq@hpr.abdm",
    stream: "allopathy",
    department: "Pediatrics & Child Wellness",
    roomNumber: "OPD Room 108",
    shift: "Morning OPD (08:00 - 14:00)",
    status: "Available",
    bio: "Specializes in child growth monitoring, pediatric respiratory infections, vaccination, and adolescent care.",
    clinicalBadgeColor: "cyan"
  }
];

const DoctorLogin = ({ onLoginSuccess, onReturnToMenu }) => {
  // 'login' | 'register'
  const [activeTab, setActiveTab] = useState('login');
  
  // Initialize with stored doctors merged with DOCTOR_DIRECTORY
  const [doctorsList, setDoctorsList] = useState(() => {
    const stored = getStoredDoctors();
    if (!stored || stored.length === 0) return DOCTOR_DIRECTORY;
    const storedIds = new Set(stored.map(d => d.id || d.doctorId));
    const storedNames = new Set(stored.map(d => (d.name || '').toLowerCase().trim()));
    const remainingDefaults = DOCTOR_DIRECTORY.filter(d => !storedIds.has(d.id) && !storedNames.has(d.name.toLowerCase().trim()));
    return [...stored, ...remainingDefaults];
  });

  const [selectedDoctor, setSelectedDoctor] = useState(() => {
    const stored = getStoredDoctors();
    if (stored && stored.length > 0) return stored[0];
    return DOCTOR_DIRECTORY[0];
  });

  const [pin, setPin] = useState('1234');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [newDoctorToast, setNewDoctorToast] = useState('');

  // Sync with Backend SQLite doctor directory
  useEffect(() => {
    let isMounted = true;
    const loadDoctorsFromBackend = async () => {
      try {
        const res = await api.getDoctorList();
        if (isMounted && res && res.success && Array.isArray(res.doctors)) {
          setDoctorsList(prevList => {
            const existingIds = new Set(prevList.map(d => d.id || d.doctorId));
            const existingNames = new Set(prevList.map(d => (d.name || '').toLowerCase().trim()));
            const newFromBackend = [];
            for (const bDoc of res.doctors) {
              const bId = bDoc.id || bDoc.doctorId || bDoc.doctor_id;
              const bName = (bDoc.name || '').toLowerCase().trim();
              if (!existingIds.has(bId) && !existingNames.has(bName)) {
                newFromBackend.push(bDoc);
              }
            }
            if (newFromBackend.length > 0) {
              return [...prevList, ...newFromBackend];
            }
            return prevList;
          });
        }
      } catch (err) {
        console.warn("Backend doctor list sync skipped (using offline/local store):", err);
      }
    };
    loadDoctorsFromBackend();
    return () => { isMounted = false; };
  }, []);

  // Manual Login Mode sub-toggle
  const [isCustomHprMode, setIsCustomHprMode] = useState(false);
  const [customHprId, setCustomHprId] = useState('');
  const [customPassword, setCustomPassword] = useState('1234');
  const [customStream, setCustomStream] = useState('allopathy');

  // New Doctor Registration Form State
  const [newDoctorForm, setNewDoctorForm] = useState({
    name: '',
    degrees: '',
    specialty: '',
    institution: '',
    council: '',
    regNumber: '',
    hprId: '',
    stream: 'ayush',
    department: 'Ayurvedic OPD & Panchakarma',
    roomNumber: 'OPD Room 205',
    shift: 'Morning OPD (08:00 - 14:00)',
    bio: ''
  });

  // 1-Click Quick Fill for Registration Demo
  const handleQuickDemoDoctor = (type = 'ayush') => {
    sounds.playClick();
    if (type === 'ayush') {
      setNewDoctorForm({
        name: 'Vaidya Rajeshwar Joshi',
        degrees: 'BAMS, MD (Ayurveda - Kayachikitsa)',
        specialty: 'Senior Ayurvedic Consultant & Panchakarma Expert',
        institution: 'National Institute of Ayurveda (NIA), Jaipur',
        council: 'NCISM Board of Ayurvedic Medicine',
        regNumber: 'NCISM-AYU-2026-9941',
        hprId: 'vaidya.joshi@hpr.abdm',
        stream: 'ayush',
        department: 'Ayurvedic OPD & Panchakarma',
        roomNumber: 'OPD Room 206',
        shift: 'Morning OPD (08:00 - 14:00)',
        bio: 'Specialist in Dashavidha Pariksha diagnosis, Amla Pitta, digestive rejuvenation, and chronic joint care.'
      });
    } else {
      setNewDoctorForm({
        name: 'Dr. Meenakshi Sundaram',
        degrees: 'MBBS, MD (General Medicine), DNB',
        specialty: 'Associate Professor & Consultant Physician',
        institution: 'Madras Medical College (MMC), Chennai',
        council: 'Tamil Nadu Medical Council (TNMC)',
        regNumber: 'TNMC-2016-5541',
        hprId: 'dr.meenakshi@hpr.abdm',
        stream: 'allopathy',
        department: 'General Medicine & Triage',
        roomNumber: 'OPD Room 105',
        shift: 'Morning OPD (08:00 - 14:00)',
        bio: 'Expert in adult hypertension, diabetes stabilization, and emergency triage.'
      });
    }
  };

  // Perform Sign-In and Route to Doctor Dashboard
  const handleDoctorSignIn = (e) => {
    if (e) e.preventDefault();
    sounds.playClick();
    setIsAuthenticating(true);
    setErrorMessage('');

    setTimeout(() => {
      setIsAuthenticating(false);

      if (isCustomHprMode) {
        if (!customHprId.trim()) {
          sounds.playAlert();
          setErrorMessage("Please enter your HPR ID or Doctor Name");
          return;
        }

        const customDoctor = {
          id: `doc-custom-${Date.now()}`,
          name: customHprId.includes('@') ? `Dr. ${customHprId.split('@')[0].toUpperCase()}` : customHprId,
          avatar: "DR",
          degrees: customStream === 'ayush' ? "BAMS, MD (Ayurveda)" : "MBBS, MD",
          specialty: customStream === 'ayush' ? "Ayurvedic Physician" : "Consultant Physician",
          institution: "National Health Authority Verified Center",
          experience: "Verified Practitioner",
          council: customStream === 'ayush' ? "NCISM" : "National Medical Commission",
          regNumber: `REG-${Math.floor(10000 + Math.random() * 90000)}`,
          hprId: customHprId.includes('@') ? customHprId : `${customHprId}@hpr.abdm`,
          stream: customStream,
          department: customStream === 'ayush' ? "Ayurvedic OPD & Panchakarma" : "General Medicine",
          roomNumber: "OPD Room 104",
          shift: "General OPD Shift",
          status: "On Duty",
          bio: "Authorized ABDM Healthcare Professional.",
          clinicalBadgeColor: customStream === 'ayush' ? "emerald" : "blue"
        };

        sounds.playSuccess();

        onLoginSuccess(customDoctor);
      } else {
        if (pin.trim() !== '1234') {
          sounds.playAlert();
          setErrorMessage("Invalid Clinical Security PIN. (Default Demo PIN: 1234)");
          return;
        }

        sounds.playSuccess();

        // Enter Doctor Dashboard directly
        onLoginSuccess(selectedDoctor);
      }
    }, 600);
  };

  // Perform Registration and Persist to LocalStorage + Backend
  const handleRegisterDoctor = async (e, enterImmediately = true) => {
    if (e) e.preventDefault();
    sounds.playClick();

    if (!newDoctorForm.name.trim()) {
      sounds.playAlert();
      alert("Please enter doctor name");
      return;
    }

    const initials = newDoctorForm.name
      .replace(/^Dr\.\s*|^Vaidya\s*/i, '')
      .split(' ')
      .filter(Boolean)
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'DR';

    const formattedName = newDoctorForm.name.startsWith('Dr.') || newDoctorForm.name.startsWith('Vaidya') 
      ? newDoctorForm.name 
      : (newDoctorForm.stream === 'ayush' ? `Vaidya ${newDoctorForm.name}` : `Dr. ${newDoctorForm.name}`);

    const docId = `doc-${Date.now()}`;
    const newDoc = {
      id: docId,
      doctorId: docId,
      name: formattedName,
      avatar: initials,
      degrees: newDoctorForm.degrees || (newDoctorForm.stream === 'ayush' ? "BAMS, MD (Ayu)" : "MBBS, MD"),
      specialty: newDoctorForm.specialty || (newDoctorForm.stream === 'ayush' ? "Ayurvedic Physician" : "Consultant Physician"),
      institution: newDoctorForm.institution || "National Health Authority Verified Center",
      experience: "Verified Specialist",
      council: newDoctorForm.council || (newDoctorForm.stream === 'ayush' ? "NCISM" : "National Medical Commission"),
      regNumber: newDoctorForm.regNumber || `REG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      hprId: newDoctorForm.hprId || `${initials.toLowerCase()}.doc@hpr.abdm`,
      stream: newDoctorForm.stream,
      department: newDoctorForm.department,
      roomNumber: newDoctorForm.roomNumber || "OPD Room 105",
      shift: newDoctorForm.shift,
      status: "Available",
      bio: newDoctorForm.bio || "Newly registered clinical specialist.",
      clinicalBadgeColor: newDoctorForm.stream === 'ayush' ? "emerald" : "blue",
      isNewlyAdded: true
    };

    sounds.playSuccess();

    // 1. Save synchronously to localStorage and asynchronously to backend
    await saveRegisteredDoctor(newDoc);

    // 2. Add to doctor roster state and select
    setDoctorsList(prev => [newDoc, ...prev.filter(d => (d.id || d.doctorId) !== docId && d.name !== formattedName)]);
    setSelectedDoctor(newDoc);

    if (enterImmediately) {
      // Directly open Doctor Dashboard for this newly registered doctor!
      onLoginSuccess(newDoc);
    } else {
      // Switch back to Sign-In tab so user can see their newly registered doctor in the roster!
      setNewDoctorToast(`Doctor ${formattedName} successfully registered! Now visible in the on-duty roster below.`);
      setActiveTab('login');
      // Reset form
      setNewDoctorForm({
        name: '',
        degrees: '',
        specialty: '',
        institution: '',
        council: '',
        regNumber: '',
        hprId: '',
        stream: 'ayush',
        department: 'Ayurvedic OPD & Panchakarma',
        roomNumber: 'OPD Room 205',
        shift: 'Morning OPD (08:00 - 14:00)',
        bio: ''
      });
      setTimeout(() => setNewDoctorToast(''), 8000);
    }
  };

  const handleRegisterAndEnterDashboard = (e) => handleRegisterDoctor(e, true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 text-slate-800 flex flex-col justify-between p-4 sm:p-6 font-sans relative overflow-x-hidden selection:bg-blue-600 selection:text-white">
      
      {/* Ambient Lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl pointer-events-none" />

      {/* Doodle Theme Pattern */}
      <MedicalDoodleBackground />

      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2 z-10 border-b border-blue-200/80 pb-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center shadow-inner text-blue-600">
              <Stethoscope size={24} />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                MediKiosk
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200 shadow-sm">
                DOCTOR PORTAL
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              National Health Authority ABDM Healthcare Professional Registry (HPR)
            </p>
          </div>
        </div>

        {/* Return to Role Selection Button */}
        {onReturnToMenu && (
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onReturnToMenu();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
            title="Return to Main Menu"
          >
            <span>← Main Menu</span>
          </button>
        )}
      </header>

      {/* Center Main Card: Doctor Login & Registration */}
      <main className="w-full max-w-4xl mx-auto my-auto py-6 z-10">
        <div className="bg-white/95 backdrop-blur-xl border-2 border-blue-100 rounded-3xl shadow-2xl shadow-blue-900/10 overflow-hidden">
          
          {/* Top Primary Tabs: Login vs Register */}
          <div className="grid grid-cols-2 p-2 bg-slate-50/80 border-b border-blue-100 gap-2">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('login');
              }}
              className={`py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition duration-200 ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25 ring-1 ring-blue-400/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <LogIn size={18} />
              <span>1. Doctor Sign-In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('register');
              }}
              className={`py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition duration-200 ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/25 ring-1 ring-emerald-400/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <UserPlus size={18} />
              <span>2. Register New Doctor</span>
            </button>
          </div>

          {/* ================= TAB 1: DOCTOR SIGN-IN ================= */}
          {activeTab === 'login' && (
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Clinical Chamber Login</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 font-bold">
                      OPD Live
                    </span>
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Select your doctor profile from the roster or sign in with your ABDM HPR credentials to open your dashboard.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setIsCustomHprMode(!isCustomHprMode);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Lock size={13} />
                  <span>{isCustomHprMode ? "← Quick Roster Sign-In" : "Manual HPR Sign-In"}</span>
                </button>
              </div>

              {newDoctorToast && (
                <div className="p-3.5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-900 text-xs flex items-center justify-between gap-2.5 font-bold shadow-sm animate-pulse">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    <span>{newDoctorToast}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setNewDoctorToast('')}
                    className="text-emerald-700 hover:text-emerald-950 text-xs font-black px-2 py-0.5"
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              )}

              {errorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-2.5 font-medium">
                  <AlertTriangle size={16} className="text-red-500 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {!isCustomHprMode ? (
                <form onSubmit={handleDoctorSignIn} className="space-y-6">
                  
                  {/* Select Doctor from Roster */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2.5">
                      Select Doctor Profile ({doctorsList.length} Available On-Duty)
                    </label>

                    <div className="grid sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                      {doctorsList.map((doc) => {
                        const isSelected = (selectedDoctor?.id && selectedDoctor.id === doc.id) || 
                                           (selectedDoctor?.doctorId && selectedDoctor.doctorId === (doc.doctorId || doc.id)) || 
                                           (selectedDoctor?.name === doc.name);
                        return (
                          <div
                            key={doc.id || doc.doctorId}
                            onClick={() => {
                              sounds.playClick();
                              setSelectedDoctor(doc);
                              setErrorMessage('');
                            }}
                            className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-start space-x-3 text-left ${
                              isSelected
                                ? 'bg-blue-50/90 border-blue-600 shadow-md ring-2 ring-blue-500/20'
                                : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 shadow-sm'
                            }`}
                          >
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                              doc.stream === 'ayush'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-blue-100 text-blue-800 border border-blue-300'
                            }`}>
                              {doc.avatar}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className={`text-sm font-extrabold truncate ${isSelected ? 'text-blue-950 font-black' : 'text-slate-800'}`}>
                                    {doc.name}
                                  </span>
                                  {doc.isNewlyAdded && (
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300 shrink-0">
                                      NEW
                                    </span>
                                  )}
                                </div>
                                {isSelected && (
                                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm ml-1">
                                    <Check size={12} />
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 truncate mt-0.5">
                                {doc.degrees}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-[11px]">
                                <span className={`font-bold px-1.5 py-0.5 rounded ${
                                  doc.stream === 'ayush' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}>
                                  {doc.stream === 'ayush' ? 'AYUSH' : 'Modern Med'}
                                </span>
                                <span className="text-slate-400">•</span>
                                <span className="text-slate-600 font-semibold">{doc.roomNumber}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Doctor Summary Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white shadow-sm flex items-center justify-center font-black">
                        {selectedDoctor.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900">
                          Signing In As: <span className="text-blue-700">{selectedDoctor.name}</span>
                        </div>
                        <div className="text-xs text-slate-600 font-medium">
                          {selectedDoctor.department} • {selectedDoctor.regNumber}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-bold text-blue-800 bg-white px-2.5 py-1 rounded-full border border-blue-200 shadow-sm">
                        {selectedDoctor.roomNumber}
                      </span>
                    </div>
                  </div>

                  {/* PIN Input & Fast Login */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                        Enter Security PIN / Chamber Key *
                      </label>
                      <button
                        type="button"
                        onClick={() => setPin('1234')}
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold underline"
                      >
                        ⚡ 1-Click Demo PIN (1234)
                      </button>
                    </div>

                    <input
                      type="password"
                      required
                      placeholder="Enter 4-digit PIN (default: 1234)"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-2xl text-base font-mono text-slate-900 tracking-widest focus:outline-none transition shadow-inner"
                    />
                  </div>

                  {/* CTA Button: Enters Doctor Dashboard directly */}
                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-base tracking-wide shadow-xl shadow-blue-600/25 transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                  >
                    <LogIn size={20} />
                    <span>{isAuthenticating ? "Verifying Credentials & Opening OPD Chamber..." : "Authenticate & Open Doctor Dashboard →"}</span>
                  </button>

                </form>
              ) : (
                /* Manual ABDM HPR Form */
                <form onSubmit={handleDoctorSignIn} className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setCustomStream('allopathy')}
                      className={`py-2 rounded-lg text-xs font-bold transition ${
                        customStream === 'allopathy' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Allopathic Medicine (NMC)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomStream('ayush')}
                      className={`py-2 rounded-lg text-xs font-bold transition ${
                        customStream === 'ayush' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      AYUSH / Ayurveda (NCISM)
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Healthcare Professional ID (HPR) or Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. dr.rajeshwar@hpr.abdm or Dr. Rajeshwar"
                      value={customHprId}
                      onChange={(e) => setCustomHprId(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-xl text-sm font-mono text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Password / PIN *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-xl text-sm text-slate-900 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm tracking-wide shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>{isAuthenticating ? "Verifying HPR Gateway..." : "Authenticate & Open Doctor Dashboard →"}</span>
                  </button>
                </form>
              )}

            </div>
          )}

          {/* ================= TAB 2: REGISTER NEW DOCTOR ================= */}
          {activeTab === 'register' && (
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Onboard / Register New Doctor</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                      HPR Onboarding
                    </span>
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Register a new physician or vaidya. Submitting will register the doctor and immediately launch their consultation dashboard.
                  </p>
                </div>

                {/* 1-Click Autofill Demo Buttons */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoDoctor('ayush')}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 text-[11px] transition shadow-sm"
                  >
                    ⚡ Demo AYUSH (Vaidya)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoDoctor('allopathy')}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold border border-blue-300 text-[11px] transition shadow-sm"
                  >
                    ⚡ Demo Allopathy (MD)
                  </button>
                </div>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleRegisterAndEnterDashboard} className="space-y-4">
                
                {/* Name & Stream */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Doctor Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Rajeshwar Sharma"
                      value={newDoctorForm.name}
                      onChange={(e) => setNewDoctorForm({ ...newDoctorForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Clinical Stream *
                    </label>
                    <select
                      value={newDoctorForm.stream}
                      onChange={(e) => {
                        const str = e.target.value;
                        setNewDoctorForm({ 
                          ...newDoctorForm, 
                          stream: str,
                          department: str === 'ayush' ? 'Ayurvedic OPD & Panchakarma' : 'General Medicine'
                        });
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none cursor-pointer"
                    >
                      <option value="ayush">AYUSH / Ayurveda (NCISM)</option>
                      <option value="allopathy">Modern Medicine / Allopathy (NMC)</option>
                    </select>
                  </div>
                </div>

                {/* Department & Degrees */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Department / Clinical Specialty *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ayurvedic Kayachikitsa or Cardiology"
                      value={newDoctorForm.department}
                      onChange={(e) => setNewDoctorForm({ ...newDoctorForm, department: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Degrees & Qualifications *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BAMS, MD (Ayu) or MBBS, MD"
                      value={newDoctorForm.degrees}
                      onChange={(e) => setNewDoctorForm({ ...newDoctorForm, degrees: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Council Reg Number & HPR ID */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Medical Council Reg Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. NCISM-AYU-88210 or NMC-2016-5541"
                      value={newDoctorForm.regNumber}
                      onChange={(e) => setNewDoctorForm({ ...newDoctorForm, regNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white rounded-xl text-xs font-mono font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      National HPR Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. doctor.name@hpr.abdm"
                      value={newDoctorForm.hprId}
                      onChange={(e) => setNewDoctorForm({ ...newDoctorForm, hprId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white rounded-xl text-xs font-mono text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Chamber Room & Shift */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Assigned Chamber / OPD Room *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. OPD Room 206 (AYUSH Wing)"
                      value={newDoctorForm.roomNumber}
                      onChange={(e) => setNewDoctorForm({ ...newDoctorForm, roomNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Shift Timings
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Morning OPD (08:00 - 14:00)"
                      value={newDoctorForm.shift}
                      onChange={(e) => setNewDoctorForm({ ...newDoctorForm, shift: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Clinical Focus / Bio
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Clinical focus, Dashavidha diagnosis experience, patient care expertise..."
                    value={newDoctorForm.bio}
                    onChange={(e) => setNewDoctorForm({ ...newDoctorForm, bio: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 focus:bg-white rounded-xl text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Submit & Enter Dashboard CTA */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm tracking-wide shadow-xl shadow-emerald-600/25 transition flex items-center justify-center gap-2 active:scale-98"
                  >
                    <UserPlus size={18} />
                    <span>Register & Enter Doctor Dashboard →</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleRegisterDoctor(e, false)}
                    className="py-4 px-6 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 hover:border-emerald-500 font-black text-sm tracking-wide shadow-sm transition flex items-center justify-center gap-2 active:scale-98"
                  >
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    <span>Register & Add to Doctor List ✓</span>
                  </button>
                </div>

              </form>

            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto flex flex-wrap justify-between items-center text-xs text-slate-600 py-3 border-t border-blue-200/80 gap-2 z-10 font-medium">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>MediKiosk Physician Gateway • Connected to ABDM Healthcare Professional Registry</span>
        </div>
        <span>ABDM Toll-Free Helpline: <strong className="text-slate-800 font-bold">14477</strong></span>
      </footer>

    </div>
  );
};

export default DoctorLogin;
