import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX,
  UserPlus, 
  Fingerprint, 
  Activity, 
  ArrowRight, 
  ShieldCheck, 
  Check, 
  Globe, 
  Sparkles, 
  ShieldAlert, 
  Keyboard, 
  Info,
  PhoneCall,
  CreditCard,
  BarChart3,
  Mail
} from 'lucide-react';

import { translations } from './utils/translations';
import { speakInstruction, stopSpeech, sounds } from './utils/audioTTS';
import TouchNumpad from './components/TouchNumpad';
import OtpModal from './components/OtpModal';
import BiometricModal from './components/BiometricModal';
import NewPatientModal from './components/NewPatientModal';
import ConsentDetailsModal from './components/ConsentDetailsModal';
import PatientDashboard from './PatientDashboard';
import api, { getPatientByIdentifier, KNOWN_PATIENTS } from './utils/api';
// Caduceus Medical Emblem Doodle Component (Matching Reference Image)
const CaduceusDoodle = ({ size = 260, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Central Staff / Rod with Spherical Knob */}
    <circle cx="50" cy="14" r="4.2" strokeWidth="1.8" />
    <line x1="50" y1="18.2" x2="50" y2="88" strokeWidth="2.2" />
    <path d="M48.5 88 L50 94 L51.5 88 Z" fill="currentColor" />

    {/* Left Feathered Wings */}
    <path d="M46 22 C37 16, 27 16, 17 23 C22 26, 30 27, 45 27" strokeWidth="1.8" />
    <path d="M17 23 C18 28, 25 31, 44 31" strokeWidth="1.6" />
    <path d="M21 29 C24 34, 32 36, 44 35" strokeWidth="1.6" />
    <path d="M27 34 C31 38, 38 39, 45 39" strokeWidth="1.4" />
    <path d="M26 21 C29 24, 37 25, 43 25" strokeWidth="1.3" />
    <path d="M31 19 C34 22, 40 23, 44 23" strokeWidth="1.3" />

    {/* Right Feathered Wings */}
    <path d="M54 22 C63 16, 73 16, 83 23 C78 26, 70 27, 55 27" strokeWidth="1.8" />
    <path d="M83 23 C82 28, 75 31, 56 31" strokeWidth="1.6" />
    <path d="M79 29 C76 34, 68 36, 56 35" strokeWidth="1.6" />
    <path d="M73 34 C69 38, 62 39, 55 39" strokeWidth="1.4" />
    <path d="M74 21 C71 24, 63 25, 57 25" strokeWidth="1.3" />
    <path d="M69 19 C66 22, 60 23, 56 23" strokeWidth="1.3" />

    {/* Dual Coiling Serpents (Double Outline Line Art as in reference) */}
    <path d="M42 36 C34 36, 33 44, 42 50 C48 54, 58 60, 58 68 C58 76, 46 80, 50 87" strokeWidth="2.2" />
    <path d="M40 37.5 C35 37.5, 34.5 43, 43 48 C49 52, 56 58, 56 66 C56 74, 48 78, 50 85" strokeWidth="1.3" />

    <path d="M58 36 C66 36, 67 44, 58 50 C52 54, 42 60, 42 68 C42 76, 54 80, 50 87" strokeWidth="2.2" />
    <path d="M60 37.5 C65 37.5, 65.5 43, 57 48 C51 52, 44 58, 44 66 C44 74, 52 78, 50 85" strokeWidth="1.3" />

    {/* Snake Heads */}
    <path d="M41 36.5 C40 34, 43 32, 45 34 C44 36, 42 37, 41 36.5" fill="currentColor" />
    <path d="M59 36.5 C60 34, 57 32, 55 34 C56 36, 58 37, 59 36.5" fill="currentColor" />
  </svg>
);

// Medical Doodle Background Layer (Theme Doodle Pattern)
export const MedicalDoodleBackground = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
    {/* Subtle Repeating Seamless Doodle Pattern */}
    <svg className="absolute inset-0 w-full h-full opacity-[0.08] text-blue-900" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="med-doodle-grid-react" x="0" y="0" width="240" height="240" patternUnits="userSpaceOnUse">
          {/* Mini Caduceus Reference Emblem */}
          <g transform="translate(20, 20) scale(0.6)" stroke="currentColor" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="50" cy="14" r="4" />
            <line x1="50" y1="18" x2="50" y2="88" strokeWidth="2" />
            <path d="M46 22 C37 16, 27 16, 17 23 C22 26, 30 27, 45 27" />
            <path d="M17 23 C18 28, 25 31, 44 31" />
            <path d="M54 22 C63 16, 73 16, 83 23 C78 26, 70 27, 55 27" />
            <path d="M83 23 C82 28, 75 31, 56 31" />
            <path d="M42 36 C34 36, 33 44, 42 50 C48 54, 58 60, 58 68 C58 76, 46 80, 50 87" />
            <path d="M58 36 C66 36, 67 44, 58 50 C52 54, 42 60, 42 68 C42 76, 54 80, 50 87" />
          </g>

          {/* Stethoscope Doodle */}
          <path d="M155 35 C155 50, 175 50, 175 35 M165 50 L165 75 C165 90, 190 90, 190 75" stroke="currentColor" fill="none" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="190" cy="70" r="4.5" stroke="currentColor" fill="none" strokeWidth="1.8" />
          <circle cx="155" cy="32" r="2.5" fill="currentColor" />
          <circle cx="175" cy="32" r="2.5" fill="currentColor" />

          {/* Heartbeat ECG Pulse Wave Doodle */}
          <path d="M25 170 L50 170 L58 150 L66 188 L74 162 L80 175 L86 170 L115 170" stroke="currentColor" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

          {/* Medical Cross Plus Doodle */}
          <path d="M165 155 L165 185 M150 170 L180 170" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Medicine Capsule Pill Doodle */}
          <g transform="translate(145, 115) rotate(-35)" stroke="currentColor" fill="none" strokeWidth="1.8">
            <rect x="0" y="0" width="12" height="26" rx="6" />
            <line x1="0" y1="13" x2="12" y2="13" />
          </g>

          {/* Medical Chart Clipboard Doodle */}
          <g transform="translate(30, 100) rotate(8)" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round">
            <rect x="0" y="0" width="22" height="28" rx="3" />
            <path d="M6 0 L6 -3 L16 -3 L16 0" />
            <line x1="4" y1="8" x2="18" y2="8" />
            <line x1="4" y1="13" x2="18" y2="13" />
            <line x1="4" y1="18" x2="14" y2="18" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#med-doodle-grid-react)" />
    </svg>
  </div>
);

const LoginKiosk = ({ onOpenAdmin, onReturnToMenu }) => {
  const [loginMethod, setLoginMethod] = useState('abha'); // 'abha' or 'aadhaar'
  const [language, setLanguage] = useState('english'); // 'english', 'hindi', 'marathi'
  const [inputValue, setInputValue] = useState('');
  const [consentGranted, setConsentGranted] = useState(false);
  const [showNumpad, setShowNumpad] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Modals
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [isBiometricOpen, setIsBiometricOpen] = useState(false);
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
  const [isConsentDetailsOpen, setIsConsentDetailsOpen] = useState(false);
  
  // Post-Login Success State (Interactive Kiosk Session)
  const [authenticatedPatient, setAuthenticatedPatient] = useState(null);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const langDict = translations[language] || translations.english;

  // Sync speech instructions when language changes
  useEffect(() => {
    stopSpeech();
    setIsSpeaking(false);
  }, [language]);

  const handleAudioGuide = () => {
    sounds.playClick();
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }

    let speechText = langDict.speechIntro;
    if (loginMethod === 'abha') {
      speechText = `${langDict.speechAbha} ${langDict.speechConsent}`;
    } else if (loginMethod === 'aadhaar') {
      speechText = `${langDict.speechAadhaar} ${langDict.speechConsent}`;
    }

    speakInstruction(
      speechText,
      language,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const handleMethodChange = (method) => {
    sounds.playClick();
    setLoginMethod(method);
    setInputValue('');
    setErrorMessage('');
    
    if (method === 'abha') {
      speakInstruction(langDict.speechAbha, language, () => setIsSpeaking(true), () => setIsSpeaking(false));
    } else if (method === 'aadhaar') {
      speakInstruction(langDict.speechAadhaar, language, () => setIsSpeaking(true), () => setIsSpeaking(false));
    }
  };

  // Format ABHA (XX-XXXX-XXXX-XXXX) or Aadhaar (XXXX XXXX XXXX)
  const handleInputChange = (rawVal) => {
    setErrorMessage('');
    const clean = rawVal.replace(/\D/g, '');

    if (loginMethod === 'abha') {
      // 14 digits formatted XX-XXXX-XXXX-XXXX
      const truncated = clean.slice(0, 14);
      let formatted = '';
      for (let i = 0; i < truncated.length; i++) {
        if (i === 2 || i === 6 || i === 10) formatted += '-';
        formatted += truncated[i];
      }
      setInputValue(formatted);
    } else {
      // 12 digits formatted XXXX XXXX XXXX
      const truncated = clean.slice(0, 12);
      let formatted = '';
      for (let i = 0; i < truncated.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += ' ';
        formatted += truncated[i];
      }
      setInputValue(formatted);
    }
  };

  // Quick Demo Auto-fill helper
  const handleAutoFillDemo = (type) => {
    sounds.playClick();
    if (type === 'abha') {
      setLoginMethod('abha');
      setInputValue('14-8892-4412-9031');
      setConsentGranted(true);
      setErrorMessage('');
    } else if (type === 'aadhaar') {
      setLoginMethod('aadhaar');
      setInputValue('5481 9023 1184');
      setConsentGranted(true);
      setErrorMessage('');
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    sounds.playClick();

    if (!consentGranted) {
      sounds.playAlert();
      setErrorMessage(langDict.validationErrorConsent);
      return;
    }

    const clean = inputValue.replace(/[\s-]/g, '');
    if (!clean) {
      sounds.playAlert();
      setErrorMessage(langDict.validationErrorRequired);
      return;
    }

    if (loginMethod === 'abha' && clean.length !== 14) {
      sounds.playAlert();
      setErrorMessage(langDict.validationErrorAbha);
      return;
    }

    if (loginMethod === 'aadhaar' && clean.length !== 12) {
      sounds.playAlert();
      setErrorMessage(langDict.validationErrorAadhaar);
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Resolve existing patient profile from backend / local store
      const verifyRes = await api.verifyIdentifier(inputValue, loginMethod);
      const patient = verifyRes?.patient || getPatientByIdentifier(inputValue, loginMethod);
      setCurrentPatient(patient);

      const patientEmail = patient?.email;
      const patientName = patient?.fullName || patient?.patientName || "Patient";

      // 2. Dispatch verification code to existing patient's registered email & mobile
      await api.sendOtp(clean, inputValue, loginMethod, patientEmail, patientName);
      if (patientEmail && patientEmail.includes('@')) {
        await api.sendEmailOtp(patientEmail, patientName, inputValue, loginMethod);
      }

      // Open OTP Verification Modal
      setIsOtpOpen(true);
    } catch (err) {
      console.warn("Backend verification error:", err);
      const fallbackPatient = getPatientByIdentifier(inputValue, loginMethod);
      setCurrentPatient(fallbackPatient);
      setIsOtpOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePatientVerified = (patient) => {
    setIsOtpOpen(false);
    setIsBiometricOpen(false);
    setIsNewPatientOpen(false);
    setAuthenticatedPatient(patient);
    speakInstruction(
      language === 'hindi' 
        ? `नमस्ते ${patient.patientName}, आपका सत्यापन सफल हुआ। आपका ओपीडी टोकन नंबर ${patient.tokenNumber} है।`
        : language === 'marathi'
        ? `नमस्कार ${patient.patientName}, आपले सत्यापन पूर्ण झाले. आपला टोकन नंबर ${patient.tokenNumber} आहे.`
        : `Welcome ${patient.patientName}, check-in successful. Your OPD Token is ${patient.tokenNumber}.`,
      language
    );
  };

  const handleLogout = () => {
    sounds.playClick();
    setAuthenticatedPatient(null);
    setInputValue('');
    setConsentGranted(false);
    setShowNumpad(false);
    stopSpeech();
  };

  if (authenticatedPatient) {
    return (
      <PatientDashboard 
        patient={authenticatedPatient} 
        language={language}
        onLogout={handleLogout}
        onReturnToMenu={onReturnToMenu}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 text-slate-800 flex flex-col items-center justify-between p-4 sm:p-6 font-sans relative overflow-x-hidden selection:bg-blue-600 selection:text-white">
      
      {/* Soft Decorative Ambient Lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl pointer-events-none"></div>

      {/* Medical Doodle Theme Background (Caduceus & Medical Elements) */}
      <MedicalDoodleBackground />

      {/* Top Kiosk Header */}
      <header className="w-full max-w-5xl flex flex-wrap justify-between items-center gap-4 z-10 py-2">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center shadow-inner">
              <Activity size={26} className="text-blue-600 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-950 via-slate-900 to-blue-800 bg-clip-text text-transparent">
                {langDict.hospitalName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-600/10 text-blue-700 border border-blue-600/30 shadow-sm">
                ABDM 2.0
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium hidden sm:block">
              {langDict.kioskTagline}
            </p>
          </div>
        </div>

        {/* Language Selection & Audio Controls */}
        <div className="flex items-center space-x-2.5">
          {/* Audio Wave Indicator */}
          {isSpeaking && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-600/10 border border-blue-500/30 rounded-xl text-blue-800 text-xs font-semibold animate-pulse shadow-sm">
              <div className="w-1.5 h-3 bg-blue-600 rounded-full equalizer-bar"></div>
              <div className="w-1.5 h-5 bg-blue-600 rounded-full equalizer-bar" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1.5 h-2 bg-blue-600 rounded-full equalizer-bar" style={{ animationDelay: '0.4s' }}></div>
              <span className="ml-1 hidden sm:inline">{langDict.audioPlayingText}</span>
            </div>
          )}

          {/* Language Dropdown */}
          <div className="relative flex items-center">
            <Globe size={18} className="absolute left-3.5 text-slate-500 pointer-events-none" />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white/95 text-slate-800 text-sm font-semibold rounded-2xl pl-10 pr-7 py-2 border border-blue-200 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-sm cursor-pointer transition"
            >
              <option value="english">English</option>
              <option value="hindi">हिंदी (Hindi)</option>
              <option value="marathi">मराठी (Marathi)</option>
            </select>
          </div>

          {/* Emergency SOS Button */}
          <button
            type="button"
            onClick={() => {
              sounds.playAlert();
              alert("🚨 Emergency SOS Triggered: Staff and triage nurse have been notified at Gate 02.");
            }}
            className="flex items-center space-x-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded-2xl text-xs font-bold transition active:scale-95 shadow-sm"
            title="Emergency Medical Assistance"
          >
            <ShieldAlert size={16} className="text-red-600" />
            <span className="hidden sm:inline">SOS</span>
          </button>

          {/* Hospital Admin Portal Button */}
          {onOpenAdmin && (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onOpenAdmin();
              }}
              className="flex items-center space-x-1.5 px-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition active:scale-95 shadow-md border border-slate-700"
              title="Hospital Admin & Analytics Portal"
            >
              <BarChart3 size={16} className="text-cyan-400" />
              <span className="hidden md:inline">Admin Portal</span>
            </button>
          )}

          {/* Return to Role Selection Button */}
          {onReturnToMenu && (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onReturnToMenu();
              }}
              className="flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-2xl text-xs font-bold transition shadow-sm active:scale-95"
              title="Return to Main Role Selection"
            >
              <span>← Main Menu</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Kiosk Body */}
      <main className="w-full max-w-5xl my-auto py-4 z-10">
        {authenticatedPatient ? (
          <PatientDashboard patient={authenticatedPatient} onLogout={handleLogout} />
        ) : (
          /* ================= Main Kiosk Login & Registration Card ================= */
          <div className="w-full bg-white text-slate-800 rounded-3xl shadow-2xl shadow-blue-500/10 overflow-hidden flex flex-col md:flex-row border border-blue-100/80">
            
            {/* Left Panel: Audio-Guided Instructions & Help */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-8 md:w-5/12 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
              
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold text-blue-100 mb-6 border border-white/20">
                  <Sparkles size={14} className="text-yellow-300" />
                  <span>Audio-Assisted Smart Kiosk</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-4">
                  {langDict.welcomeTitle}
                </h2>
                
                <p className="text-blue-100 text-base sm:text-lg mb-8 leading-relaxed font-normal">
                  {langDict.welcomeSubtitle}
                </p>
              </div>

              {/* Audio Listen Button with Visual feedback */}
              <div className="space-y-4">
                <button 
                  type="button"
                  onClick={handleAudioGuide}
                  className={`w-full flex items-center space-x-3.5 p-4 rounded-2xl text-left transition-all duration-300 shadow-md ${
                    isSpeaking 
                      ? 'bg-emerald-500 text-white shadow-emerald-500/40 ring-4 ring-emerald-300/40 scale-[1.02]' 
                      : 'bg-white/15 hover:bg-white/25 text-white border border-white/20 active:scale-98'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${isSpeaking ? 'bg-white text-emerald-600' : 'bg-blue-500/40 text-cyan-300'}`}>
                    {isSpeaking ? <VolumeX size={26} /> : <Volume2 size={26} className="animate-pulse" />}
                  </div>
                  <div>
                    <span className="block text-base sm:text-lg font-bold leading-tight">
                      {isSpeaking ? "Tap to Stop Voice" : langDict.audioButtonText}
                    </span>
                    <span className="text-xs text-blue-200">
                      {language === 'hindi' ? "हिंदी आवाज़ में निर्देश" : language === 'marathi' ? "मराठी आवाज मार्गदर्शन" : "Voice guide in selected language"}
                    </span>
                  </div>
                </button>

                {/* Quick Auto-fill Demo Pills */}
                <div className="pt-2">
                  <div className="text-xs text-blue-200 font-semibold mb-2 flex items-center justify-between">
                    <span>Quick Demo Patient Login:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleAutoFillDemo('abha')}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-medium text-blue-100 transition"
                    >
                      ⚡ {langDict.quickDemoAbha}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAutoFillDemo('aadhaar')}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-medium text-blue-100 transition"
                    >
                      ⚡ {langDict.quickDemoAadhaar}
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Panel: Existing Patient Login (ABHA / Aadhaar) & New Patient Area */}
            <div className="p-6 sm:p-8 md:w-7/12 flex flex-col justify-between bg-white space-y-6">
              
              <div>
                {/* SECTION 1: Existing Patient Login via ABHA ID or Aadhaar */}
                <div className="pb-6 border-b border-slate-200">
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-800">
                        {langDict.existingPatientTitle || "Existing Patient Login"}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {langDict.existingPatientSubtitle || "Enter ABHA ID or Aadhaar Number for instant OPD Check-In"}
                      </p>
                    </div>

                    {/* Onscreen Keypad toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setShowNumpad(!showNumpad);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 rounded-xl border border-blue-200 transition"
                    >
                      <Keyboard size={14} />
                      <span>{showNumpad ? langDict.numpadToggleClose : langDict.numpadToggleOpen}</span>
                    </button>
                  </div>

                  {/* Switcher Tabs: ABHA ID vs Aadhaar */}
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-4 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleMethodChange('abha')}
                      className={`flex items-center justify-center space-x-1.5 sm:space-x-2 py-3 rounded-xl font-bold text-xs sm:text-sm transition ${
                        loginMethod === 'abha'
                          ? 'bg-white text-blue-700 shadow-md ring-2 ring-blue-500/20'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <CreditCard size={18} className={loginMethod === 'abha' ? 'text-blue-600' : 'text-slate-400'} />
                      <span className="truncate">{langDict.tabAbha}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMethodChange('aadhaar')}
                      className={`flex items-center justify-center space-x-1.5 sm:space-x-2 py-3 rounded-xl font-bold text-xs sm:text-sm transition ${
                        loginMethod === 'aadhaar'
                          ? 'bg-white text-blue-700 shadow-md ring-2 ring-blue-500/20'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Fingerprint size={18} className={loginMethod === 'aadhaar' ? 'text-blue-600' : 'text-slate-400'} />
                      <span className="truncate">{langDict.tabAadhaar}</span>
                    </button>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-3.5">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                        {loginMethod === 'abha' ? langDict.labelAbha : langDict.labelAadhaar}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={inputValue}
                          onChange={(e) => handleInputChange(e.target.value)}
                          placeholder={loginMethod === 'abha' ? langDict.placeholderAbha : langDict.placeholderAadhaar}
                          className="w-full text-xl sm:text-2xl font-mono font-bold tracking-widest px-4 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-2xl focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 text-slate-800 transition shadow-inner"
                        />
                        {inputValue && (
                          <button
                            type="button"
                            onClick={() => setInputValue('')}
                            className="absolute right-3.5 top-4 text-slate-400 hover:text-slate-600 p-1"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Aadhaar Biometric Scan Alternative Button */}
                    {loginMethod === 'aadhaar' && (
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            setIsBiometricOpen(true);
                          }}
                          className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow"
                        >
                          <Fingerprint size={18} className="text-cyan-400" />
                          <span>{langDict.biometricScanBtn}</span>
                        </button>
                      </div>
                    )}

                    {/* On-Screen Touch Numpad */}
                    {showNumpad && (
                      <div className="mt-3 animate-fadeIn">
                        <TouchNumpad
                          value={inputValue}
                          onChange={(val) => setInputValue(val)}
                          maxLength={loginMethod === 'abha' ? 14 : 12}
                          formatType={loginMethod === 'abha' ? 'abha' : 'aadhaar'}
                        />
                      </div>
                    )}

                    {/* Validation Error */}
                    {errorMessage && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl font-medium flex items-center gap-2 animate-fadeIn">
                        <ShieldAlert size={18} className="text-red-500 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* DPDP Consent */}
                    <div className="flex items-start space-x-3 bg-slate-50 hover:bg-slate-100/80 transition p-3 rounded-2xl border border-slate-200">
                      <input
                        type="checkbox"
                        id="consent"
                        checked={consentGranted}
                        onChange={(e) => {
                          sounds.playClick();
                          setConsentGranted(e.target.checked);
                          if (errorMessage) setErrorMessage('');
                        }}
                        className="w-5 h-5 text-blue-600 bg-white border-2 border-slate-300 rounded-lg focus:ring-blue-500 cursor-pointer mt-0.5 shrink-0"
                      />
                      <label htmlFor="consent" className="text-slate-600 text-xs cursor-pointer leading-snug">
                        {langDict.consentLabel}
                        <button 
                          type="button" 
                          onClick={() => {
                            sounds.playClick();
                            setIsConsentDetailsOpen(true);
                          }}
                          className="text-blue-600 font-bold hover:underline ml-1 inline-flex items-center gap-0.5"
                        >
                          <span>{langDict.viewDetails}</span>
                          <Info size={12} />
                        </button>
                      </label>
                    </div>

                    {/* Verify & Get Token Action Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center space-x-2 text-white text-lg font-bold py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] transition shadow-lg shadow-blue-500/20 disabled:bg-blue-400 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Sending Verification Code...</span>
                        </>
                      ) : (
                        <>
                          <span>{langDict.btnContinue}</span>
                          <ArrowRight size={20} />
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* SECTION 2: New Patient Registration Banner */}
                <div className="mt-5 p-5 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-2 border-emerald-200 rounded-3xl shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-md">
                        <UserPlus size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-emerald-950">
                          {langDict.newPatientBannerTitle}
                        </h3>
                        <p className="text-xs text-emerald-800 mt-0.5">
                          {langDict.newPatientBannerDesc}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-emerald-900 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Check size={15} className="text-emerald-600 font-bold shrink-0" />
                      <span>Aadhaar e-KYC / Thumb scan</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check size={15} className="text-emerald-600 font-bold shrink-0" />
                      <span>Instant 14-digit ABHA Creation</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setIsNewPatientOpen(true);
                    }}
                    className="w-full mt-4 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition shadow-md flex items-center justify-center gap-2 active:scale-95 text-base"
                  >
                    <UserPlus size={20} />
                    <span>{langDict.btnStartReg}</span>
                  </button>
                </div>
              </div>

              {/* Bottom Security Compliance Badge */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span className="text-[11px] sm:text-xs text-slate-500 font-medium">{langDict.dpdpBadge}</span>
                </div>
                <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-medium">
                  TLS 1.3 AES-256
                </span>
              </div>

            </div>

          </div>
        )}
      </main>

      {/* Kiosk Location & Help Desk Footer */}
      <footer className="w-full max-w-5xl flex flex-wrap justify-between items-center text-xs text-slate-600 py-3 border-t border-blue-200/80 gap-2 z-10 font-medium">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>{langDict.kioskLocation}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>ABDM Helpline: <strong className="text-slate-800 font-bold">14477 (Toll-Free)</strong></span>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              if (onOpenAdmin) onOpenAdmin();
            }}
            className="text-xs text-blue-700 hover:text-blue-900 font-bold underline flex items-center gap-1 ml-2"
          >
            <BarChart3 size={13} />
            <span>Admin Analytics</span>
          </button>
        </div>
      </footer>

      {/* ================= MODALS ================= */}

      {/* OTP Verification Modal */}
      <OtpModal
        isOpen={isOtpOpen}
        onClose={() => setIsOtpOpen(false)}
        identifier={inputValue}
        method={loginMethod}
        patient={currentPatient}
        onVerified={handlePatientVerified}
        langDict={langDict}
      />

      {/* Biometric Scanner Modal */}
      <BiometricModal
        isOpen={isBiometricOpen}
        onClose={() => setIsBiometricOpen(false)}
        aadhaarNumber={inputValue}
        onVerified={handlePatientVerified}
        langDict={langDict}
      />

      {/* New Patient Registration Modal (Contains Aadhaar, ABHA, Manual Form) */}
      <NewPatientModal
        isOpen={isNewPatientOpen}
        onClose={() => setIsNewPatientOpen(false)}
        onRegistered={handlePatientVerified}
        language={language}
        langDict={langDict}
      />

      {/* DPDP Consent Details Modal */}
      <ConsentDetailsModal
        isOpen={isConsentDetailsOpen}
        onClose={() => setIsConsentDetailsOpen(false)}
        language={language}
        langDict={langDict}
      />

    </div>
  );
};

export default LoginKiosk;
