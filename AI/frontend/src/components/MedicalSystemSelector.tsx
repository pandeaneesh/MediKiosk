import React from 'react';

interface MedicalSystemSelectorProps {
  onSelect: (optionValue: string) => void;
  disabled?: boolean;
}

export const MedicalSystemSelector: React.FC<MedicalSystemSelectorProps> = ({
  onSelect,
  disabled = false
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto py-6 px-4 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3 border border-blue-200">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          Step 1: Clinical Pathway Selection
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Select Medical Approach / चिकित्सा पद्धति का चयन करें
        </h2>
        <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto">
          Please select your preferred healthcare system. The clinical history-taking interview will adapt its questions accordingly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Allopathy Card */}
        <button
          type="button"
          onClick={() => onSelect('system_allopathy')}
          disabled={disabled}
          className="group relative p-6 bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 text-left flex flex-col justify-between overflow-hidden focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-50 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110 pointer-events-none"></div>

          <div>
            <div className="w-14 h-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-3xl shadow-md mb-5 group-hover:scale-105 transition-transform">
              🩺
            </div>

            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Allopathy
              </h3>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                Modern Medicine
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
              एलोपैथी / आधुनिक चिकित्सा
            </p>

            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Standard clinical assessment structured around chief complaints and the clinical <strong>SOCRATES</strong> framework.
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="text-blue-500 font-bold">✓</span>
                <span>SOCRATES Pain & Symptom Breakdown</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="text-blue-500 font-bold">✓</span>
                <span>Immediate Red-Flag Emergency Triage</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="text-blue-500 font-bold">✓</span>
                <span>General Physician Handover Report</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-blue-600 font-semibold text-sm">
            <span>Proceed with Allopathy</span>
            <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </button>

        {/* AYUSH / Ayurveda Card */}
        <button
          type="button"
          onClick={() => onSelect('system_ayush')}
          disabled={disabled}
          className="group relative p-6 bg-white rounded-2xl border-2 border-emerald-200 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 text-left flex flex-col justify-between overflow-hidden focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-50 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110 pointer-events-none"></div>

          <div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-3xl shadow-md mb-5 group-hover:scale-105 transition-transform">
              🌿
            </div>

            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                AYUSH / Ayurveda
              </h3>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                Traditional
              </span>
            </div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mt-1">
              आयुर्वेद / दशविध परीक्षा
            </p>

            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Holistic Ayurvedic assessment incorporating classical <strong>Dashavidha Pariksha (दशविध परीक्षा)</strong>.
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Prakriti & Vikriti Constitution Observation</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Ahara Shakti (Agni/Digestion) & Satmya</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Ayurvedic Vaidya Practitioner Handover</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-emerald-700 font-semibold text-sm">
            <span>Proceed with Ayurveda</span>
            <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-slate-400">
          💡 Full Pan-Indian Multilingual Support: 13 Indian languages with Bhashini & Web Speech voice integration.
        </p>
      </div>
    </div>
  );
};
