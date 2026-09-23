import React, { useState } from 'react';
import {
  FileText, Printer, Download, Copy, Check, X, ShieldAlert,
  Sparkles, Leaf, Activity
} from 'lucide-react';
import type { DoctorSummary } from '../types';

interface DoctorSummaryViewProps {
  isOpen: boolean;
  onClose: () => void;
  summary: DoctorSummary | null;
}

export const DoctorSummaryView: React.FC<DoctorSummaryViewProps> = ({
  isOpen,
  onClose,
  summary
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !summary) return null;

  const isAyush = summary.medical_system.toLowerCase().includes('ayush') || summary.medical_system.toLowerCase().includes('ayurveda');

  const handleCopyText = () => {
    const text = `
=====================================================
🏥 MEDIKIOSK CLINICAL HISTORY HANDOVER REPORT
=====================================================
Patient ID: ${summary.patient_id}
Session ID: ${summary.session_id}
Timestamp: ${summary.timestamp}
Medical System: ${summary.medical_system}
Language: ${summary.language_used}
Triage Level: [${summary.triage_level}]

CHIEF COMPLAINT:
${summary.patient_complaint}

${summary.socrates_summary ? `SOCRATES SYMPTOM EXPLORATION:
${Object.entries(summary.socrates_summary)
        .map(([k, v]) => `• ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
        .join('\n')}` : ''}

${summary.dashavidha_pariksha ? `DASHAVIDHA PARIKSHA (दशविध परीक्षा):
${Object.entries(summary.dashavidha_pariksha)
        .map(([k, v]) => `• ${k}: ${v}`)
        .join('\n')}` : ''}

PAST MEDICAL CONDITIONS:
${summary.chronic_history.join(', ')}

CURRENT MEDICATIONS:
${summary.current_medications.join(', ')}

ALLERGIES:
${summary.allergies.join(', ')}

CLINICAL NOTICE:
${summary.ai_note}
=====================================================
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(summary, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `medikiosk_handover_${summary.patient_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none animate-slide-in">
        {/* Modal Top Bar (Light theme) */}
        <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 text-slate-800 border-b border-slate-200 px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs ${isAyush ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>
              {isAyush ? <Leaf className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {isAyush ? 'Ayurvedic Vaidya Handover Report' : 'Doctor Clinical Handover Report'}
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${summary.triage_level === 'EMERGENCY'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : summary.triage_level === 'PRIORITY'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                  {summary.triage_level}
                </span>
              </div>
              <p className="text-xs text-slate-500">Structured patient history collected at outpatient kiosk</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition flex items-center gap-1.5 text-xs font-semibold shadow-2xs cursor-pointer"
              title="Copy note to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition flex items-center gap-1.5 text-xs font-semibold shadow-2xs cursor-pointer"
              title="Print report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadJSON}
              className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 transition flex items-center gap-1.5 text-xs font-semibold shadow-2xs cursor-pointer"
              title="Download JSON EHR"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm bg-slate-50/60 print:p-8 print:bg-white">
          {/* Header Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hospital Outpatient Kiosk</span>
                <h1 className="text-lg font-black text-slate-900">Patient Clinical Summary Handover</h1>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                  {summary.patient_id}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-semibold">Session ID</span>
                <p className="font-mono font-semibold text-slate-700 truncate">{summary.session_id}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-semibold">Medical System</span>
                <p className={`font-semibold ${isAyush ? 'text-emerald-700' : 'text-blue-700'}`}>{summary.medical_system}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-semibold">Interview Language</span>
                <p className="font-semibold text-slate-700">{summary.language_used}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-semibold">Timestamp</span>
                <p className="font-semibold text-slate-700">{summary.timestamp}</p>
              </div>
            </div>
          </div>

          {/* Red Flag Alert if Any */}
          {summary.red_flags && summary.red_flags.length > 0 && (
            <div className="bg-red-50 border border-red-300 rounded-2xl p-4 text-red-900 space-y-2 shadow-xs">
              <div className="flex items-center space-x-2 font-bold text-red-800 text-xs uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Urgent Red-Flag Findings ({summary.red_flags.length})</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {summary.red_flags.map((flag, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-red-200 shadow-2xs">
                    <p className="font-bold text-red-900">[{flag.urgency}] {flag.flag_name}</p>
                    <p className="text-slate-700 text-[11px] mt-0.5">{flag.description}</p>
                    {flag.recommended_action && (
                      <p className="text-emerald-700 text-[11px] font-semibold mt-1">Recommended Action: {flag.recommended_action}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chief Complaint */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Chief Presenting Complaint / मुख्य समस्या</span>
            <p className="text-sm font-bold text-slate-900 capitalize">{summary.patient_complaint}</p>
          </div>

          {/* Dashavidha Pariksha for AYUSH */}
          {isAyush && summary.dashavidha_pariksha && (
            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200/80">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>Dashavidha Pariksha (दशविध परीक्षा — 10 Classical Ayurvedic Parameters)</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(summary.dashavidha_pariksha).map(([param, val]) => (
                  <div key={param} className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs flex flex-col justify-between">
                    <span className="text-[11px] font-bold text-slate-600">{param}</span>
                    <span className="text-slate-900 font-semibold text-xs mt-1">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SOCRATES Breakdown for Allopathy */}
          {!isAyush && summary.socrates_summary && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-sky-600" />
                  <span>SOCRATES Clinical Symptom Exploration</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {Object.entries(summary.socrates_summary).map(([key, value]) => (
                  <div key={key} className="bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400">{key}</span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chronic History, Meds, Allergies Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Past Medical Conditions</span>
              <p className="font-semibold text-slate-800">{summary.chronic_history.join(', ') || 'None reported'}</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Current Medications</span>
              <p className="font-semibold text-slate-800">{summary.current_medications.join(', ') || 'None reported'}</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Known Allergies</span>
              <p className="font-semibold text-slate-800">{summary.allergies.join(', ') || 'No known allergies'}</p>
            </div>
          </div>

          {/* Strict Non-Diagnostic Notice */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-[11px] text-amber-900 space-y-1">
            <span className="font-bold uppercase tracking-wider text-[10px] text-amber-800">Clinical Responsibility & Governance Notice</span>
            <p className="leading-relaxed">{summary.ai_note}</p>
          </div>
        </div>

        {/* Modal Bottom Bar (Hidden in Print) */}
        <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-500 font-medium">Ready for practitioner clinical examination</span>
          <button
            type="button"
            onClick={onClose}
            className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Close & Return
          </button>
        </div>
      </div>
    </div>
  );
};
