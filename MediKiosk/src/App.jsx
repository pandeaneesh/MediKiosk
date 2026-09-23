import React, { useState, useEffect } from 'react';
import LoginKiosk from './LoginKiosk';
import DoctorLogin from './DoctorLogin';
import PhysicianDashboard from './PhysicianDashboard';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import { 
  User, 
  Stethoscope, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  UserPlus, 
  FileText, 
  Building2, 
  Sliders, 
  ChevronRight,
  Volume2,
  VolumeX
} from 'lucide-react';
import { MedicalDoodleBackground } from './LoginKiosk';
import { sounds, speakInstruction, stopSpeech } from './utils/audioTTS';

// Starting Page with 3 Clear Role Options (Patient, Doctor, Admin)
const RoleSelectionLanding = ({ onSelectRole }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeechCard, setActiveSpeechCard] = useState(null);

  const fullHindiGuide = "नमस्ते। अस्पताल कियोस्क में आपका स्वागत है। अगर आप मरीज़ हैं और डॉक्टर को दिखाने या पर्ची लेने आए हैं, तो नीले रंग वाले मरीज़ बटन को दबाएं। अगर आप डॉक्टर हैं, तो हरे रंग वाले डॉक्टर बटन को दबाएं। और अगर आप अस्पताल कर्मचारी या एडमिन हैं, तो बैंगनी रंग वाले एडमिन बटन को दबाएं।";

  const handleToggleVoice = (e) => {
    if (e) e.stopPropagation();
    sounds.playClick();
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      setActiveSpeechCard(null);
      return;
    }
    setActiveSpeechCard('all');
    speakInstruction(
      fullHindiGuide,
      'hindi',
      () => setIsSpeaking(true),
      () => { setIsSpeaking(false); setActiveSpeechCard(null); }
    );
  };

  const handleCardVoice = (e, cardType, text) => {
    if (e) e.stopPropagation();
    sounds.playClick();
    if (isSpeaking && activeSpeechCard === cardType) {
      stopSpeech();
      setIsSpeaking(false);
      setActiveSpeechCard(null);
      return;
    }
    setActiveSpeechCard(cardType);
    speakInstruction(
      text,
      'hindi',
      () => setIsSpeaking(true),
      () => { setIsSpeaking(false); setActiveSpeechCard(null); }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 text-slate-800 flex flex-col justify-between p-4 sm:p-6 font-sans relative overflow-x-hidden selection:bg-blue-600 selection:text-white">
      
      {/* Decorative Background Lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* Medical Doodle Theme Pattern */}
      <MedicalDoodleBackground />

      {/* Top Header */}
      <header className="w-full max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-4 z-10 py-3">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center shadow-inner text-blue-600">
              <Activity size={26} className="animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-blue-950 via-slate-900 to-blue-800 bg-clip-text text-transparent">
                MediKiosk
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-600 text-white shadow-sm">
                ABDM 2.0
              </span>
            </div>
            <p className="text-xs text-slate-600 font-semibold hidden sm:block">
              Smart Outpatient Triage, Clinical Consultation & Hospital Telemetry Terminal
            </p>
          </div>
        </div>

        {/* Live Station Status Pill */}
        <div className="flex items-center gap-2 px-3.5 py-2 bg-white/90 backdrop-blur-md rounded-2xl border border-blue-200/80 shadow-sm text-xs font-bold text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span>Hospital Terminal Station #01 Live</span>
        </div>
      </header>

      {/* Main Role Selection Section */}
      <main className="w-full max-w-6xl mx-auto my-auto py-6 z-10 space-y-6">
        
        {/* Welcome Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-full text-blue-800 text-xs sm:text-sm font-extrabold shadow-sm">
            <Sparkles size={16} className="text-blue-600" />
            <span>AIIMS New Delhi • Central OPD Station Portal</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950">
            Welcome to <span className="text-blue-600">MediKiosk</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            Please choose your destination role below to proceed to your dedicated terminal.
          </p>
        </div>

        {/* MASTER HINDI AUDIO GUIDANCE BANNER (High Accessibility for Illiterate Patients) */}
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white p-4 sm:p-5 rounded-3xl shadow-xl shadow-blue-500/25 border-2 border-white/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
              isSpeaking && activeSpeechCard === 'all' ? 'bg-amber-400 text-slate-950 animate-bounce' : 'bg-white/20 text-white'
            }`}>
              {isSpeaking && activeSpeechCard === 'all' ? <VolumeX size={30} /> : <Volume2 size={30} className="animate-pulse" />}
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-lg sm:text-xl font-black tracking-wide">आवाज़ में निर्देश सुनें (हिंदी)</span>
                <span className="px-2.5 py-0.5 rounded-full bg-yellow-300 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                  Voice Guidance
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-100 font-medium mt-1">
                अगर आप पढ़ना नहीं जानते, तो यहाँ दबाएं। यह आवाज़ आपको बताएगी कि किस बटन को दबाना है।
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleVoice}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-sm tracking-wide transition shadow-lg flex items-center justify-center gap-2 active:scale-95 shrink-0 ${
              isSpeaking && activeSpeechCard === 'all'
                ? 'bg-rose-500 hover:bg-rose-600 text-white ring-4 ring-rose-300'
                : 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 hover:scale-105'
            }`}
          >
            {isSpeaking && activeSpeechCard === 'all' ? <VolumeX size={20} /> : <Volume2 size={20} />}
            <span>{isSpeaking && activeSpeechCard === 'all' ? "आवाज़ रोकें (Stop)" : "🔊 आवाज़ सुनें (Listen Voice)"}</span>
          </button>
        </div>


        {/* 3 Main Role Cards */}
        <div className="grid md:grid-cols-3 gap-6 pt-2">
          
          {/* ================= OPTION 1: PATIENT PORTAL (Blue) ================= */}
          <div
            onClick={() => { stopSpeech(); sounds.playClick(); onSelectRole('patient'); }}
            className="group relative bg-white/95 backdrop-blur-md rounded-3xl border-4 border-blue-400 hover:border-blue-600 p-6 sm:p-7 shadow-xl shadow-blue-500/15 hover:shadow-2xl hover:shadow-blue-600/25 transition-all duration-300 cursor-pointer flex flex-col justify-between active:scale-[0.99] overflow-hidden ring-4 ring-blue-500/10"
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-100 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none opacity-50" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 group-hover:bg-blue-600 text-blue-700 group-hover:text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                  <User size={34} />
                </div>
                
                {/* Audio listen button on card */}
                <button
                  type="button"
                  onClick={(e) => handleCardVoice(e, 'patient', "मरीज़ पंजीकरण और ओपीडी टोकन के लिए इस नीले बटन को दबाएं।")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border transition flex items-center gap-1 shadow-sm ${
                    isSpeaking && activeSpeechCard === 'patient'
                      ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200'
                  }`}
                  title="Listen in Hindi"
                >
                  {isSpeaking && activeSpeechCard === 'patient' ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  <span>{isSpeaking && activeSpeechCard === 'patient' ? "रोकें" : "🔊 सुनें"}</span>
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-black uppercase tracking-wide">
                    🔵 नीला बटन (Blue)
                  </span>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black shadow-sm animate-pulse">
                    👉 यहाँ दबाएं • Click to Start
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                  मरीज़ • Patient
                </h3>
                <p className="text-xs text-blue-700 font-bold mt-0.5">
                  मरीज स्वयं पंजीकरण एवं ओपीडी टोकन
                </p>
                <p className="text-xs text-slate-600 mt-2 font-medium leading-relaxed">
                  डॉक्टर को दिखाने, नई पर्ची या ओपीडी टोकन लेने और AI स्वास्थ्य परामर्श के लिए इस <strong>नीले बटन</strong> को दबाएं।
                </p>
              </div>

              {/* Key Highlights */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>आभा / आधार / ईमेल से टोकन</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>OPD पर्ची और डॉक्टर कक्ष दिशा</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-amber-500 shrink-0" />
                  <span className="text-blue-900 font-extrabold">AI स्वास्थ्य परामर्श (Allopathy / Ayurveda) व 3D पेन मैपिंग</span>
                </div>
              </div>
            </div>

            <div className="pt-6 relative z-10">
              <button
                type="button"
                className="w-full py-3.5 bg-blue-600 group-hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition"
              >
                <span>🔵 मरीज़ यहाँ दबाएं (Patient)</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* ================= OPTION 2: DOCTOR PORTAL (Green) ================= */}
          <div
            onClick={() => { stopSpeech(); sounds.playClick(); onSelectRole('doctor'); }}
            className="group relative bg-white/95 backdrop-blur-md rounded-3xl border-4 border-emerald-300 hover:border-emerald-600 p-6 sm:p-7 shadow-xl shadow-emerald-500/15 hover:shadow-2xl hover:shadow-emerald-600/25 transition-all duration-300 cursor-pointer flex flex-col justify-between active:scale-[0.99] overflow-hidden ring-2 ring-emerald-500/10"
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-100 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none opacity-50" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Stethoscope size={34} />
                </div>
                
                {/* Audio listen button on card */}
                <button
                  type="button"
                  onClick={(e) => handleCardVoice(e, 'doctor', "डॉक्टर परामर्श और ओपीडी कक्ष के लिए इस हरे बटन को दबाएं।")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border transition flex items-center gap-1 shadow-sm ${
                    isSpeaking && activeSpeechCard === 'doctor'
                      ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}
                  title="Listen in Hindi"
                >
                  {isSpeaking && activeSpeechCard === 'doctor' ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  <span>{isSpeaking && activeSpeechCard === 'doctor' ? "रोकें" : "🔊 सुनें"}</span>
                </button>
              </div>

              <div>
                <div className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wide mb-1">
                  🟢 हरा बटन (Green)
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                  डॉक्टर • Doctor
                </h3>
                <p className="text-xs text-emerald-800 font-bold mt-0.5">
                  चिकित्सक परामर्श कक्ष एवं रोगी कतार
                </p>
                <p className="text-xs text-slate-600 mt-2 font-medium leading-relaxed">
                  डॉक्टर परामर्श कक्ष, मरीज़ जांच, डिजिटल प्रिस्क्रिप्शन और ईएचआर के लिए इस <strong>हरे बटन</strong> को दबाएं।
                </p>
              </div>

              {/* Key Highlights */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>लाइव मरीज़ कतार (Live Queue)</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserPlus size={15} className="text-emerald-600 shrink-0" />
                  <span className="text-teal-950 font-extrabold">+ नया डॉक्टर पंजीकरण सुविधा</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>आयुर्वेदिक ईएचआर एवं डिजिटल Rx</span>
                </div>
              </div>
            </div>

            <div className="pt-6 relative z-10">
              <button
                type="button"
                className="w-full py-3.5 bg-emerald-600 group-hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
              >
                <span>🟢 डॉक्टर यहाँ दबाएं (Doctor)</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* ================= OPTION 3: ADMIN PORTAL (Purple) ================= */}
          <div
            onClick={() => { stopSpeech(); sounds.playClick(); onSelectRole('admin'); }}
            className="group relative bg-white/95 backdrop-blur-md rounded-3xl border-4 border-indigo-300 hover:border-indigo-700 p-6 sm:p-7 shadow-xl shadow-indigo-900/15 hover:shadow-2xl hover:shadow-indigo-900/25 transition-all duration-300 cursor-pointer flex flex-col justify-between active:scale-[0.99] overflow-hidden ring-2 ring-indigo-500/10"
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-100 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none opacity-50" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 group-hover:bg-indigo-700 text-indigo-700 group-hover:text-white flex items-center justify-center shadow-lg shadow-indigo-900/30 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck size={34} />
                </div>
                
                {/* Audio listen button on card */}
                <button
                  type="button"
                  onClick={(e) => handleCardVoice(e, 'admin', "अस्पताल प्रशासन और कर्मचारी लॉगिन के लिए इस बैंगनी बटन को दबाएं।")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border transition flex items-center gap-1 shadow-sm ${
                    isSpeaking && activeSpeechCard === 'admin'
                      ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-200'
                  }`}
                  title="Listen in Hindi"
                >
                  {isSpeaking && activeSpeechCard === 'admin' ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  <span>{isSpeaking && activeSpeechCard === 'admin' ? "रोकें" : "🔊 सुनें"}</span>
                </button>
              </div>

              <div>
                <div className="inline-block px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[11px] font-black uppercase tracking-wide mb-1">
                  🟣 बैंगनी बटन (Admin)
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-indigo-900 transition-colors">
                  एडमिन • Admin
                </h3>
                <p className="text-xs text-indigo-800 font-bold mt-0.5">
                  अस्पताल प्रशासन एवं कमान केंद्र
                </p>
                <p className="text-xs text-slate-600 mt-2 font-medium leading-relaxed">
                  अस्पताल प्रशासन, हार्डवेयर सेंसर मॉनिटरिंग और सुरक्षा सेटिंग्स के लिए इस <strong>बैंगनी बटन</strong> को दबाएं।
                </p>
              </div>

              {/* Key Highlights */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-indigo-600 shrink-0" />
                  <span>हार्डवेयर व बायोमेट्रिक स्थिति</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-indigo-600 shrink-0" />
                  <span>ABDM गेटवे और ऑडिट लॉग</span>
                </div>
              </div>
            </div>

            <div className="pt-6 relative z-10">
              <button
                type="button"
                className="w-full py-3.5 bg-slate-900 group-hover:bg-indigo-950 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2 transition"
              >
                <span>🟣 एडमिन यहाँ दबाएं (Admin)</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto flex flex-wrap justify-between items-center text-xs text-slate-600 py-3 border-t border-blue-200/80 gap-2 z-10 font-medium">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span>National Health Authority (NHA) Ayush & ABDM 2.0 Architecture Compliant</span>
        </div>
        <span>24x7 Kiosk Support Helpline: <strong className="text-slate-800 font-bold">14477 (Toll-Free)</strong></span>
      </footer>

    </div>
  );
};

function App() {
  // 'landing' | 'patient' | 'doctor' | 'admin'
  const [portalMode, setPortalMode] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode') || params.get('role');
      if (mode) return mode;
      return localStorage.getItem('medikiosk_active_portal_mode') || 'landing';
    } catch (e) {
      return 'landing';
    }
  });

  const [authenticatedDoctor, setAuthenticatedDoctor] = useState(() => {
    try {
      const saved = localStorage.getItem('medikiosk_active_doctor_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [authenticatedAdmin, setAuthenticatedAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem('medikiosk_active_admin_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode') || params.get('role');
      if (mode && ['patient', 'doctor', 'admin', 'landing'].includes(mode)) {
        setPortalMode(mode);
        localStorage.setItem('medikiosk_active_portal_mode', mode);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleSelectRole = (role) => {
    setPortalMode(role);
    try {
      localStorage.setItem('medikiosk_active_portal_mode', role);
    } catch (e) {
      // ignore
    }
  };

  const handleDoctorLogin = (doc) => {
    setAuthenticatedDoctor(doc);
    try {
      localStorage.setItem('medikiosk_active_doctor_session', JSON.stringify(doc));
    } catch (e) {
      // ignore
    }
  };

  const handleDoctorLogout = () => {
    setAuthenticatedDoctor(null);
    try {
      localStorage.removeItem('medikiosk_active_doctor_session');
    } catch (e) {
      // ignore
    }
  };

  const handleAdminLogin = (admin) => {
    setAuthenticatedAdmin(admin);
    try {
      localStorage.setItem('medikiosk_active_admin_session', JSON.stringify(admin));
    } catch (e) {
      // ignore
    }
  };

  const handleAdminLogout = () => {
    setAuthenticatedAdmin(null);
    try {
      localStorage.removeItem('medikiosk_active_admin_session');
    } catch (e) {
      // ignore
    }
  };

  const handleReturnToMenu = () => {
    sounds.playClick();
    setAuthenticatedDoctor(null);
    setAuthenticatedAdmin(null);
    try {
      localStorage.removeItem('medikiosk_active_doctor_session');
      localStorage.removeItem('medikiosk_active_admin_session');
      localStorage.setItem('medikiosk_active_portal_mode', 'landing');
    } catch (e) {
      // ignore
    }
    setPortalMode('landing');
  };

  return (
    <div className="w-full min-h-screen relative font-sans">
      
      {/* Starting Role Selection Page */}
      {portalMode === 'landing' && (
        <RoleSelectionLanding 
          onSelectRole={handleSelectRole} 
        />
      )}

      {/* 1. Dedicated Patient Portal (Strictly Isolated) */}
      {portalMode === 'patient' && (
        <LoginKiosk 
          onReturnToMenu={handleReturnToMenu} 
          onOpenAdmin={() => handleSelectRole('admin')}
        />
      )}

      {/* 2. Dedicated Doctor Portal (Strictly Isolated) */}
      {portalMode === 'doctor' && (
        authenticatedDoctor ? (
          <PhysicianDashboard 
            doctor={authenticatedDoctor} 
            onLogout={handleDoctorLogout}
            onReturnToMenu={handleReturnToMenu}
          />
        ) : (
          <DoctorLogin 
            onLoginSuccess={handleDoctorLogin}
            onReturnToMenu={handleReturnToMenu}
          />
        )
      )}

      {/* 3. Dedicated Admin Portal (Strictly Isolated) */}
      {portalMode === 'admin' && (
        authenticatedAdmin ? (
          <AdminDashboard
            admin={authenticatedAdmin}
            onLogout={handleAdminLogout}
            onReturnToMenu={handleReturnToMenu}
          />
        ) : (
          <AdminLogin
            onLoginSuccess={handleAdminLogin}
            onReturnToMenu={handleReturnToMenu}
          />
        )
      )}

    </div>
  );
}

export default App;
