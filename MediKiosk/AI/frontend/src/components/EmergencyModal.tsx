import React from 'react';
import { ShieldAlert, AlertTriangle, PhoneCall, CheckCircle, X } from 'lucide-react';
import type { RedFlagDetail } from '../types';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  redFlags: RedFlagDetail[];
  chiefComplaint?: string | null;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  redFlags
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border-2 border-red-500 shadow-2xl overflow-hidden animate-slide-in">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-5 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-7 h-7 text-white animate-bounce" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full">
                Clinical Safety Escalation
              </span>
              <h2 className="text-lg font-bold mt-1">Urgent Attention Recommended</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs sm:text-sm text-slate-700">
          <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 space-y-2 text-red-900">
            <div className="flex items-center space-x-2 font-bold text-red-800">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Potential Red-Flag Symptoms Detected:</span>
            </div>
            <ul className="space-y-1.5 pl-5 list-disc text-xs text-red-800 font-medium">
              {redFlags && redFlags.length > 0 ? (
                redFlags.map((flag, idx) => (
                  <li key={idx}>
                    <span className="font-bold">[{flag.urgency}] {flag.flag_name}:</span> {flag.description}
                  </li>
                ))
              ) : (
                <li>High risk cardiac or acute distress indicator reported in symptom stream.</li>
              )}
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Required Next Steps:</h3>
            <div className="space-y-2">
              <div className="flex items-start space-x-2 text-xs text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>The triage desk and hospital nursing staff have been automatically notified.</span>
              </div>
              <div className="flex items-start space-x-2 text-xs text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Please alert the nearest healthcare staff or proceed directly to the Emergency Room.</span>
              </div>
              <div className="flex items-start space-x-2 text-xs text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>All symptoms and details recorded so far have been preserved for the doctor.</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-500 italic">
            <strong>Clinical Notice:</strong> MediKiosk is an assistive history collection system and does not diagnose conditions. This escalation is based on clinical safety triage criteria.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-red-700 font-semibold text-xs">
            <PhoneCall className="w-4 h-4 animate-pulse" />
            <span>Emergency Alert Status: Active</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs"
          >
            I Understand / Review Clinical Data
          </button>
        </div>
      </div>
    </div>
  );
};
