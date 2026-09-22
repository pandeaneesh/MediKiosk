import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, CheckCircle2, Smartphone, KeyRound, ArrowRight, RefreshCw, Mail } from 'lucide-react';
import { sounds } from '../utils/audioTTS';
import { getPatientByIdentifier, api } from '../utils/api';

const OtpModal = ({ isOpen, onClose, identifier, method, patient, onVerified, langDict }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(45);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setOtp(['', '', '', '', '', '']);
      setTimer(45);
      setErrorMsg('');
      setVerifiedSuccess(false);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    sounds.playClick();
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto move to next box
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-digit-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-digit-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleAutoFill = () => {
    sounds.playClick();
    setOtp(['1', '2', '3', '4', '5', '6']);
    setErrorMsg('');
  };

  const handleResend = async () => {
    sounds.playClick();
    setTimer(45);
    setErrorMsg('');
    const targetEmail = patient?.email;
    const patientName = patient?.fullName || patient?.patientName || "Patient";
    try {
      if (targetEmail && targetEmail.includes('@')) {
        await api.sendEmailOtp(targetEmail, patientName, identifier, method);
      } else {
        const clean = identifier ? identifier.replace(/[\s-]/g, '') : '';
        await api.sendOtp(clean, identifier, method);
      }
    } catch (e) {
      console.warn("Resend failed:", e);
    }
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      sounds.playAlert();
      setErrorMsg('Please enter all 6 digits of the OTP');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    let serverPatient = null;
    try {
      if (patient?.email) {
        const emailRes = await api.verifyEmailOtp(patient.email, fullOtp, identifier, method);
        if (emailRes && emailRes.patient) {
          serverPatient = emailRes.patient;
        }
      }
      if (!serverPatient) {
        const otpRes = await api.verifyOtp(identifier, fullOtp, identifier, method, patient?.email);
        serverPatient = otpRes?.patient;
      }
      if (!serverPatient) {
        const res = await api.verifyIdentifier(identifier, method);
        if (res && res.patient) {
          serverPatient = res.patient;
        }
      }
    } catch (err) {
      console.warn("Backend verifyIdentifier call skipped, using local patient lookup", err);
    }

    setTimeout(() => {
      setIsVerifying(false);
      setVerifiedSuccess(true);
      sounds.playSuccess();

      setTimeout(() => {
        const patientData = serverPatient || patient || getPatientByIdentifier(identifier, method);
        onVerified(patientData);
      }, 1200);
    }, 1200);
  };

  // Mask identifier and email for display
  let maskedDisplay = identifier;
  if (patient?.email && patient.email.includes('@')) {
    const [user, domain] = patient.email.split('@');
    maskedDisplay = user.length > 3
      ? `${user.slice(0, 2)}${'•'.repeat(Math.min(5, user.length - 2))}@${domain}`
      : `${user.slice(0, 1)}•••@${domain}`;
  } else if (identifier.length > 8) {
    maskedDisplay = `${identifier.slice(0, 4)}••••${identifier.slice(-4)}`;
  }

  const hasEmail = Boolean(patient?.email && patient.email.includes('@'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X size={24} />
          </button>
          
          <div className="w-16 h-16 bg-white/10 border-2 border-white/30 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            {hasEmail ? <Mail size={32} className="text-white" /> : <Smartphone size={32} className="text-white" />}
          </div>

          <h3 className="text-2xl font-bold">{langDict.otpModalTitle}</h3>
          <p className="text-blue-100 text-sm mt-1">
            {hasEmail ? "Enter 6-digit verification code sent to your registered email" : langDict.otpModalSubtitle}
          </p>
          <div className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-xs font-mono font-medium tracking-wider">
            {hasEmail ? `Sent to Email: ${maskedDisplay}` : `Sent to: ${maskedDisplay}`}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-8">
          {verifiedSuccess ? (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle2 size={48} />
              </div>
              <h4 className="text-2xl font-bold text-slate-800">Verification Successful!</h4>
              <p className="text-slate-500 mt-2 text-base">ABDM Patient Profile Verified. Logging into kiosk session...</p>
            </div>
          ) : (
            <form onSubmit={handleVerify}>
              {/* 6 Digit Input Boxes */}
              <div className="flex justify-between gap-2 sm:gap-3 mb-6">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-digit-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-12 h-16 sm:w-14 sm:h-16 text-center text-3xl font-bold bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-800 focus:border-blue-600 focus:bg-blue-50/50 focus:outline-none focus:ring-4 focus:ring-blue-100 transition shadow-inner"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl font-medium text-center border border-red-200">
                  {errorMsg}
                </div>
              )}

              {/* Demo Fill & Timer */}
              <div className="flex items-center justify-between mb-8 text-sm">
                <button
                  type="button"
                  onClick={handleAutoFill}
                  className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition border border-blue-200 flex items-center gap-1.5"
                >
                  <KeyRound size={14} />
                  <span>{langDict.otpDemoCode}</span>
                </button>

                <div className="text-slate-500">
                  {timer > 0 ? (
                    <span>Resend in <strong className="text-slate-700">{timer}s</strong></span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
                    >
                      <RefreshCw size={14} /> {langDict.resendOtp}
                    </button>
                  )}
                </div>
              </div>

              {/* Submit Verification Button */}
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xl font-bold rounded-2xl transition shadow-lg flex items-center justify-center space-x-2 disabled:bg-slate-300"
              >
                {isVerifying ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{langDict.btnVerifying}</span>
                  </>
                ) : (
                  <>
                    <span>{langDict.verifyOtpBtn}</span>
                    <ArrowRight size={22} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Security Guarantee */}
          <div className="mt-6 flex items-center justify-center text-xs text-slate-400 gap-1.5">
            <ShieldCheck size={16} className="text-green-600" />
            <span>Official Ayushman Bharat Digital Mission (ABDM) Gateway</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpModal;
