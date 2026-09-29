import React from 'react';
import { Shield, X, Check, Lock, Database, EyeOff, FileText, Volume2 } from 'lucide-react';
import { speakInstruction } from '../utils/audioTTS';

const ConsentDetailsModal = ({ isOpen, onClose, language = 'english' }) => {
  if (!isOpen) return null;

  const handleReadAloud = () => {
    const text = language === 'hindi'
      ? "डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम 2023 के तहत आपकी सभी स्वास्थ्य जानकारी पूरी तरह सुरक्षित और 256-बिट एन्क्रिप्टेड है। यह केवल आपके अस्पताल परामर्श और ओपीडी टोकन के लिए उपयोग होगी।"
      : language === 'marathi'
      ? "डिजिटल वैयक्तिक डेटा संरक्षण कायदा २०२३ अंतर्गत तुमची आरोग्य माहिती पूर्णपणे सुरक्षित आहे. ती केवळ ओपीडी तपासणीसाठी वापरली जाईल."
      : "Under the Digital Personal Data Protection Act 2023 and ABDM Framework, your health records are strictly encrypted with 256-bit AES standards. Data is used exclusively for hospital consultation, triage, and queue management.";
    
    speakInstruction(text, language);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 p-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-500/20 border border-blue-400/40 rounded-xl text-blue-400">
              <Shield size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold">DPDP Act 2023 & ABDM Privacy Framework</h3>
              <p className="text-xs text-blue-200">Patient Consent & Data Governance Architecture</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-700">
          
          {/* Audio read aloud banner */}
          <div className="flex items-center justify-between p-3.5 bg-blue-50 border border-blue-200 rounded-2xl">
            <div className="flex items-center space-x-2 text-blue-900 font-medium text-sm">
              <Volume2 size={20} className="text-blue-600 animate-pulse" />
              <span>Need audio summary? Listen in your selected language.</span>
            </div>
            <button
              onClick={handleReadAloud}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow transition"
            >
              Play Audio
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center space-x-2 text-blue-700 font-bold mb-1.5">
                <Lock size={18} />
                <span>Zero Data Selling Policy</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Health information is never shared with third-party advertisers or commercial entities. All records are restricted to the National Health Authority (NHA) gateway.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold mb-1.5">
                <Database size={18} />
                <span>Purpose-Limited Consultation</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your ABHA / Aadhaar identifier is only used to pull relevant medical history for the treating doctor during today's visit.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center space-x-2 text-indigo-700 font-bold mb-1.5">
                <EyeOff size={18} />
                <span>Right to Revoke & Access Logs</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                You retain full rights under the DPDP Act 2023 to view data access audit logs and revoke ABHA consent at any time via the official ABHA mobile app.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center space-x-2 text-amber-700 font-bold mb-1.5">
                <FileText size={18} />
                <span>256-bit AES Encryption</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Data transmitted between this kiosk terminal and the hospital HMIS server is encrypted end-to-end with TLS 1.3 cryptographic protocols.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-100 rounded-2xl text-xs text-slate-600 leading-relaxed border border-slate-200">
            <strong>Statutory Reference:</strong> Digital Personal Data Protection Act 2023 (Act No. 22 of 2023) & Ayushman Bharat Digital Mission Guidelines issued by Ministry of Health & Family Welfare (MoHFW), Govt. of India.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition shadow"
          >
            I Understand & Agree
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConsentDetailsModal;
