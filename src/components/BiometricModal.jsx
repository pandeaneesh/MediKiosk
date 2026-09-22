import React, { useState, useEffect } from 'react';
import { Fingerprint, X, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { sounds } from '../utils/audioTTS';
import { getPatientByIdentifier } from '../utils/api';

const BiometricModal = ({ isOpen, onClose, aadhaarNumber, onVerified, langDict }) => {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setScanning(false);
      setProgress(0);
      setIsSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartScan = () => {
    if (scanning || isSuccess) return;
    setScanning(true);
    setProgress(10);
    sounds.playBeep(520, 0.2, 'sawtooth');

    let current = 10;
    const interval = setInterval(() => {
      current += 15;
      if (current >= 100) {
        clearInterval(interval);
        setProgress(100);
        setScanning(false);
        setIsSuccess(true);
        sounds.playSuccess();

        setTimeout(() => {
          const patientData = getPatientByIdentifier(aadhaarNumber || "5481 9023 1184", 'aadhaar');
          onVerified(patientData);
        }, 1200);
      } else {
        setProgress(current);
        sounds.playBeep(600 + current * 3, 0.05);
      }
    }, 280);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative text-center">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X size={22} />
          </button>
          
          <h3 className="text-2xl font-bold">{langDict.scanFingerTitle}</h3>
          <p className="text-slate-400 text-sm mt-1">{langDict.scanFingerInstruction}</p>
        </div>

        {/* Scanner Pad Interactive Area */}
        <div className="p-8 flex flex-col items-center justify-center">
          
          {/* Glowing scanner ring */}
          <div
            onClick={handleStartScan}
            className={`w-44 h-44 rounded-3xl cursor-pointer flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 ${
              isSuccess 
                ? 'bg-emerald-50 border-4 border-emerald-500 shadow-emerald-200' 
                : scanning
                ? 'bg-blue-900 border-4 border-blue-400 shadow-2xl shadow-blue-500/50 scale-105'
                : 'bg-slate-900 border-4 border-slate-700 hover:border-blue-500 shadow-xl'
            }`}
          >
            {/* Animated Laser Scanning Line */}
            {scanning && (
              <div className="absolute inset-x-0 h-1.5 bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-scan z-10"></div>
            )}

            {isSuccess ? (
              <CheckCircle2 size={80} className="text-emerald-500 animate-bounce" />
            ) : (
              <Fingerprint 
                size={88} 
                className={`transition-colors duration-300 ${
                  scanning ? 'text-cyan-400 animate-pulse' : 'text-slate-400'
                }`} 
              />
            )}

            {/* Scanning Percentage Overlay */}
            {scanning && (
              <div className="absolute bottom-2 text-cyan-300 font-mono text-xs font-bold bg-slate-950/80 px-2.5 py-0.5 rounded-full">
                {progress}%
              </div>
            )}
          </div>

          {/* Prompt / Instruction */}
          <div className="mt-6">
            {isSuccess ? (
              <div className="text-emerald-700 font-bold text-lg">
                {langDict.matchSuccess}
              </div>
            ) : scanning ? (
              <div className="text-blue-600 font-semibold text-lg animate-pulse flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-ping"></div>
                <span>{langDict.scanningText}</span>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={handleStartScan}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl text-lg shadow-md transition"
                >
                  Tap to Start Biometric Scan
                </button>
                <p className="text-xs text-slate-400 mt-2">Simulates UIDAI STQC certified optical biometric sensor</p>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-slate-100 w-full flex items-center justify-center text-xs text-slate-500 gap-1.5">
            <ShieldCheck size={16} className="text-blue-600" />
            <span>UIDAI Biometric Authentication Protocol v2.5</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default BiometricModal;
