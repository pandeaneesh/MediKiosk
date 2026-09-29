import React from 'react';
import {
  ClipboardList, AlertTriangle, HeartPulse, MapPin,
  Clock, Pill, FileText, ShieldAlert, Sparkles
} from 'lucide-react';
import type { ClinicalData, RedFlagDetail, MedicalSystem } from '../types';

interface RightPanelProps {
  medicalSystem?: MedicalSystem;
  clinicalData: ClinicalData;
  redFlags: RedFlagDetail[];
  onOpenSummaryModal?: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  medicalSystem = 'allopathy',
  clinicalData,
  redFlags,
  onOpenSummaryModal
}) => {
  const isAyush = medicalSystem === 'ayush';
  const dp = clinicalData.dashavidha_pariksha || {};

  const getSeverityColor = (score?: number | null) => {
    if (score === null || score === undefined) return 'bg-slate-200 text-slate-600';
    if (score <= 3) return 'bg-emerald-500 text-white';
    if (score <= 6) return 'bg-amber-500 text-white';
    return 'bg-red-600 text-white';
  };

  const getSeverityLabel = (score?: number | null) => {
    if (score === null || score === undefined) return 'Not Rated';
    if (score === 0) return 'No Pain';
    if (score <= 3) return 'Mild';
    if (score <= 6) return 'Moderate';
    if (score <= 8) return 'Severe';
    return 'Extreme / Unbearable';
  };

  // Count captured Dashavidha parameters
  const dashavidhaCount = [
    dp.prakriti, dp.vikriti, dp.sara, dp.samhanana, dp.pramana,
    dp.satmya && dp.satmya.length > 0, dp.satva, dp.ahara_shakti,
    dp.vyayama_shakti, dp.vaya
  ].filter(Boolean).length;

  return (
    <aside className="w-full lg:w-88 bg-white border-l border-slate-200 flex flex-col justify-between p-5 shadow-xs overflow-y-auto max-h-screen">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <ClipboardList className={`w-5 h-5 ${isAyush ? 'text-emerald-700' : 'text-sky-600'}`} />
            <h2 className="font-bold text-sm text-slate-800 tracking-tight">
              {isAyush ? 'Ayurvedic EHR Record' : 'Collected Clinical Data'}
            </h2>
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center space-x-1 ${isAyush
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isAyush ? 'bg-emerald-600' : 'bg-blue-500'}`}></span>
            <span>{isAyush ? '🌿 Dashavidha Active' : 'Real-time EHR'}</span>
          </span>
        </div>

        {/* Red Flags Alert Banner (if any) */}
        {redFlags && redFlags.length > 0 && (
          <div className="bg-red-50 border border-red-300 rounded-xl p-3 space-y-1.5 animate-pulse-subtle">
            <div className="flex items-center space-x-1.5 text-red-800 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Safety Escalation Active</span>
            </div>
            <div className="space-y-1 text-[11px] text-red-700">
              {redFlags.map((flag, idx) => (
                <div key={idx} className="flex items-start space-x-1">
                  <span className="font-semibold">• [{flag.urgency}]</span>
                  <span>{flag.flag_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chief Complaint Card */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
            <HeartPulse className={`w-3.5 h-3.5 ${isAyush ? 'text-emerald-600' : 'text-sky-600'}`} />
            <span>Chief Complaint / मुख्य समस्या</span>
          </div>
          <p className="text-xs font-semibold text-slate-800 capitalize">
            {clinicalData.chief_complaint || <span className="text-slate-400 font-normal italic">Awaiting patient statement...</span>}
          </p>
        </div>

        {/* AYUSH / Dashavidha Pariksha Panel */}
        {isAyush ? (
          <div className="space-y-2.5">
            <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dashavidha Pariksha (दशविध परीक्षा)</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {dashavidhaCount} / 10
                </span>
              </div>

              <div className="w-full bg-emerald-100/70 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(dashavidhaCount / 10) * 100}%` }}
                ></div>
              </div>

              {/* 10-point checklist overview */}
              <div className="space-y-1.5 pt-1 text-[11px]">
                {/* 1. Prakriti */}
                <div className="flex items-start justify-between bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-slate-600 font-medium">1. Prakriti (प्रकृति):</span>
                  <span className="text-slate-800 font-semibold text-right max-w-[160px] truncate">
                    {dp.prakriti?.body_build || <span className="text-slate-300 italic font-normal">Pending</span>}
                  </span>
                </div>

                {/* 2. Vikriti */}
                <div className="flex items-start justify-between bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-slate-600 font-medium">2. Vikriti (विकृति):</span>
                  <span className="text-slate-800 font-semibold text-right max-w-[160px] truncate">
                    {dp.vikriti?.recent_changes?.join(', ') || <span className="text-slate-300 italic font-normal">Pending</span>}
                  </span>
                </div>

                {/* 3. Ahara Shakti */}
                <div className="flex items-start justify-between bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-slate-600 font-medium">3. Ahara (अग्नि/आहार):</span>
                  <span className="text-slate-800 font-semibold text-right max-w-[160px] truncate">
                    {dp.ahara_shakti?.appetite_level || <span className="text-slate-300 italic font-normal">Pending</span>}
                  </span>
                </div>

                {/* 4. Satmya */}
                <div className="flex items-start justify-between bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-slate-600 font-medium">4. Satmya (सात्म्य):</span>
                  <span className="text-slate-800 font-semibold text-right max-w-[160px] truncate">
                    {dp.satmya && dp.satmya.length > 0 ? dp.satmya.join(', ') : <span className="text-slate-300 italic font-normal">Pending</span>}
                  </span>
                </div>

                {/* 5. Sattva */}
                <div className="flex items-start justify-between bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-slate-600 font-medium">5. Sattva (सत्त्व):</span>
                  <span className="text-slate-800 font-semibold text-right max-w-[160px] truncate">
                    {dp.satva || <span className="text-slate-300 italic font-normal">Pending</span>}
                  </span>
                </div>

                {/* 6. Vyayama */}
                <div className="flex items-start justify-between bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-slate-600 font-medium">6. Vyayama (व्यायाम):</span>
                  <span className="text-slate-800 font-semibold text-right max-w-[160px] truncate">
                    {dp.vyayama_shakti || <span className="text-slate-300 italic font-normal">Pending</span>}
                  </span>
                </div>

                {/* 7. Sara */}
                <div className="flex items-start justify-between bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-slate-600 font-medium">7. Sara (सार बल):</span>
                  <span className="text-slate-800 font-semibold text-right max-w-[160px] truncate">
                    {dp.sara || <span className="text-slate-300 italic font-normal">Pending</span>}
                  </span>
                </div>

                {/* 8. Samhanana */}
                <div className="flex items-start justify-between bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-slate-600 font-medium">8. Samhanana (संहनन):</span>
                  <span className="text-slate-800 font-semibold text-right max-w-[160px] truncate">
                    {dp.samhanana || <span className="text-slate-300 italic font-normal">Pending</span>}
                  </span>
                </div>

                {/* 9. Vaya */}
                <div className="flex items-start justify-between bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-slate-600 font-medium">9. Vaya (वय/आयु):</span>
                  <span className="text-slate-800 font-semibold text-right max-w-[160px] truncate">
                    {dp.vaya || <span className="text-slate-300 italic font-normal">Pending</span>}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* SOCRATES Core Grid for Allopathy */
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Site */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 space-y-1">
              <span className="text-[10px] font-medium text-slate-500 flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>Location (Site)</span>
              </span>
              <p className="text-[11px] font-semibold text-slate-800 truncate">
                {clinicalData.site || <span className="text-slate-400 font-normal italic">—</span>}
              </p>
            </div>

            {/* Onset */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 space-y-1">
              <span className="text-[10px] font-medium text-slate-500 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Onset / Duration</span>
              </span>
              <p className="text-[11px] font-semibold text-slate-800 truncate">
                {clinicalData.onset || clinicalData.duration || <span className="text-slate-400 font-normal italic">—</span>}
              </p>
            </div>

            {/* Character */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 space-y-1">
              <span className="text-[10px] font-medium text-slate-500">Character / Quality</span>
              <p className="text-[11px] font-semibold text-slate-800 truncate">
                {clinicalData.character || <span className="text-slate-400 font-normal italic">—</span>}
              </p>
            </div>

            {/* Radiation */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 space-y-1">
              <span className="text-[10px] font-medium text-slate-500">Radiation</span>
              <p className="text-[11px] font-semibold text-slate-800 truncate">
                {clinicalData.radiation || <span className="text-slate-400 font-normal italic">—</span>}
              </p>
            </div>
          </div>
        )}

        {/* Severity Gauge */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider">Pain / Discomfort Scale</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${getSeverityColor(clinicalData.severity)}`}>
              {clinicalData.severity !== null && clinicalData.severity !== undefined ? `${clinicalData.severity} / 10` : '—'}
            </span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${(clinicalData.severity ?? 0) > 6
                ? 'bg-red-500'
                : (clinicalData.severity ?? 0) > 3
                  ? 'bg-amber-500'
                  : isAyush ? 'bg-emerald-500' : 'bg-sky-500'
                }`}
              style={{ width: `${((clinicalData.severity ?? 0) / 10) * 100}%` }}
            ></div>
          </div>

          <p className="text-[10px] text-slate-500 text-right font-medium">
            Rating: <span className="font-semibold text-slate-700">{getSeverityLabel(clinicalData.severity)}</span>
          </p>
        </div>

        {/* Medical & Medication History */}
        <div className="space-y-2 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 space-y-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
              <FileText className="w-3 h-3 text-slate-400" />
              <span>Past Medical Conditions</span>
            </span>
            <p className="text-[11px] text-slate-800 font-medium">
              {clinicalData.medical_history && clinicalData.medical_history.length > 0
                ? clinicalData.medical_history.join(', ')
                : <span className="text-slate-400 font-normal italic">None reported</span>}
            </p>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 space-y-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
              <Pill className="w-3 h-3 text-slate-400" />
              <span>Current Medications / formulations</span>
            </span>
            <p className="text-[11px] text-slate-800 font-medium">
              {clinicalData.medication_history && clinicalData.medication_history.length > 0
                ? clinicalData.medication_history.join(', ')
                : <span className="text-slate-400 font-normal italic">None reported</span>}
            </p>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 space-y-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
              <ShieldAlert className="w-3 h-3 text-slate-400" />
              <span>Known Allergies</span>
            </span>
            <p className="text-[11px] text-slate-800 font-medium">
              {clinicalData.allergies && clinicalData.allergies.length > 0
                ? clinicalData.allergies.join(', ')
                : <span className="text-slate-400 font-normal italic">No known allergies</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Doctor Summary Action */}
      {onOpenSummaryModal && (
        <div className="pt-3 border-t border-slate-100 mt-3">
          <button
            type="button"
            onClick={onOpenSummaryModal}
            className={`w-full text-white py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition shadow-xs hover:shadow-sm active:scale-[0.99] cursor-pointer ${isAyush
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
              : 'bg-sky-600 hover:bg-sky-700 shadow-sky-200'
              }`}
          >
            <FileText className="w-3.5 h-3.5 text-white" />
            <span>{isAyush ? 'View Vaidya Clinical Summary' : 'View Doctor Clinical Summary'}</span>
          </button>
        </div>
      )}
    </aside>
  );
};
