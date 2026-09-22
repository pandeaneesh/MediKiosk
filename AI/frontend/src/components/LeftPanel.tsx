import React from 'react';
import {
  HeartPulse, Activity, CheckCircle2,
  Globe, Stethoscope, Leaf, HelpCircle, PhoneCall
} from 'lucide-react';
import type { MedicalSystem, Language, SessionPhase } from '../types';

export interface LeftPanelProps {
  sessionId?: string;
  medicalSystem: MedicalSystem;
  language: Language;
  currentPhase: SessionPhase;
  progressPercentage: number;
  onLanguageChange: (newLang: Language) => void;
  onTriggerEmergency: () => void;
  onResetSession?: () => void;
}

const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: 'english', label: 'English', native: 'English' },
  { code: 'hindi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'marathi', label: 'Marathi', native: 'मराठी' },
  { code: 'gujarati', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'tamil', label: 'Tamil', native: 'தமிழ்' },
  { code: 'telugu', label: 'Telugu', native: 'తెలుగు' },
  { code: 'kannada', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'malayalam', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'bengali', label: 'Bengali', native: 'বাংলা' },
  { code: 'punjabi', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'odia', label: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'assamese', label: 'Assamese', native: 'অসমীয়া' },
  { code: 'urdu', label: 'Urdu', native: 'اردو' }
];

const PHASE_LABELS: Record<SessionPhase, { title: string; subtitle: string }> = {
  select_system: { title: '1. Pathway Selection', subtitle: 'Choose Allopathy or AYUSH' },
  language_select: { title: '2. Language Choice', subtitle: 'Select preferred dialect' },
  consent: { title: '3. Clinical Consent', subtitle: 'Terms & non-diagnostic notice' },
  chief_complaint: { title: '4. Chief Complaint', subtitle: 'Primary reason for visit' },
  socrates_questions: { title: '5. SOCRATES Analysis', subtitle: 'Site, Onset, Character, Severity' },
  ayurveda_dashavidha: { title: '5. Dashavidha Pariksha', subtitle: 'Prakriti, Vikriti, Agni & Sara' },
  medical_history: { title: '6. Chronic Conditions', subtitle: 'Past health history' },
  medication_history: { title: '7. Current Medicines', subtitle: 'Daily prescriptions & herbs' },
  allergies: { title: '8. Known Allergies', subtitle: 'Drug & food sensitivities' },
  review_confirmation: { title: '9. Summary Review', subtitle: 'Verify patient details' },
  completed: { title: '10. Doctor Handover', subtitle: 'Ready for practitioner consult' },
  emergency_escalation: { title: 'Emergency Escalation', subtitle: 'Nurse station dispatched' }
};

export const LeftPanel: React.FC<LeftPanelProps> = ({
  medicalSystem,
  language,
  currentPhase,
  progressPercentage,
  onLanguageChange,
  onTriggerEmergency
}) => {
  const isAyush = medicalSystem === 'ayush';
  const phaseInfo = PHASE_LABELS[currentPhase] || { title: 'Triage Interview', subtitle: 'Collecting symptoms' };

  return (
    <aside className="w-full lg:w-80 bg-white text-slate-800 flex flex-col justify-between p-5 border-r border-slate-200 shadow-xs overflow-y-auto max-h-screen">
      <div className="space-y-5">
        {/* Brand Header */}
        <div className="flex items-center space-x-3 pb-2 border-b border-slate-100">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-md shadow-sky-100 shrink-0">
            <HeartPulse className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-base tracking-tight text-slate-900">
                MediKiosk
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-md border border-sky-200">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Outpatient History & Triage</p>
          </div>
        </div>

        {/* Clinical Pathway Badge */}
        <div className={`p-3.5 rounded-2xl border transition-all ${isAyush
          ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950 shadow-2xs'
          : 'bg-sky-50/90 border-sky-200 text-sky-950 shadow-2xs'
          }`}>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-1.5">
            <span className={`flex items-center gap-1.5 ${isAyush ? 'text-emerald-800' : 'text-sky-800'}`}>
              {isAyush ? <Leaf className="w-4 h-4 text-emerald-600" /> : <Stethoscope className="w-4 h-4 text-sky-600" />}
              <span>{isAyush ? 'AYUSH / Ayurveda' : 'Allopathy'}</span>
            </span>
            <span className={`w-2 h-2 rounded-full ${isAyush ? 'bg-emerald-500' : 'bg-sky-500'} animate-ping`}></span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {isAyush
              ? '🌿 Dashavidha Pariksha (दशविध परीक्षा) constitution & Agni assessment'
              : '🩺 SOCRATES symptom exploration & emergency red-flag triage'}
          </p>
        </div>

        {/* Language Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-600" />
              <span>Language / भाषा</span>
            </span>
            <span className="text-[11px] text-sky-600 font-bold">{language}</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => onLanguageChange(lang.code)}
                className={`px-2.5 py-2 rounded-xl text-xs font-semibold transition text-left flex items-center justify-between border cursor-pointer ${language === lang.code
                  ? 'bg-sky-600 text-white border-sky-600 shadow-xs shadow-sky-200'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
              >
                <span>{lang.native}</span>
                {language === lang.code && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Progress Meter */}
        <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-600" />
              <span>Interview Progress</span>
            </span>
            <span className="font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full text-[11px]">
              {progressPercentage}%
            </span>
          </div>

          <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isAyush
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                : 'bg-gradient-to-r from-sky-500 to-blue-600'
                }`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-900">{phaseInfo.title}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{phaseInfo.subtitle}</p>
          </div>
        </div>

        {/* Triage Safety Notice */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-[11px] text-amber-900 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-900 font-bold">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Kiosk Triage Notice</span>
          </div>
          <p className="leading-tight text-amber-800">
            Conversational assistant for medical history collection. Doctor will review full report during examination.
          </p>
        </div>
      </div>

      {/* Emergency Nurse Dispatch Button */}
      <div className="pt-4 border-t border-slate-100 space-y-1.5 mt-4">
        <button
          type="button"
          onClick={onTriggerEmergency}
          className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition shadow-sm shadow-red-200 active:scale-98 cursor-pointer"
        >
          <PhoneCall className="w-4 h-4 animate-bounce" />
          <span>Need Immediate Nurse Assistance</span>
        </button>
        <p className="text-[10px] text-center text-slate-400">Press if feeling dizzy, severe pain, or difficulty breathing</p>
      </div>
    </aside>
  );
};
