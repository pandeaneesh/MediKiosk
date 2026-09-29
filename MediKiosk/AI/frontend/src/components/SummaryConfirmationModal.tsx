import React, { useState } from 'react';
import { Edit3, FileCheck, X, Check } from 'lucide-react';
import type { ClinicalData } from '../types';

interface SummaryConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicalData: ClinicalData;
  language?: string;
  onConfirm: () => void;
  onEditField: (field: string, newValue: any) => void;
}

export const SummaryConfirmationModal: React.FC<SummaryConfirmationModalProps> = ({
  isOpen,
  onClose,
  clinicalData,
  onConfirm,
  onEditField
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  if (!isOpen) return null;

  const handleStartEdit = (field: string, currentValue: any) => {
    setEditingField(field);
    setEditValue(Array.isArray(currentValue) ? currentValue.join(', ') : String(currentValue || ''));
  };

  const handleSaveEdit = () => {
    if (!editingField) return;
    if (editingField === 'severity') {
      const num = parseInt(editValue, 10);
      onEditField(editingField, isNaN(num) ? 5 : num);
    } else if (['associated_symptoms', 'medical_history', 'medication_history', 'allergies'].includes(editingField)) {
      onEditField(editingField, editValue.split(',').map(s => s.trim()).filter(Boolean));
    } else {
      onEditField(editingField, editValue);
    }
    setEditingField(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-slide-in flex flex-col max-h-[90vh]">
        {/* Header - Light theme */}
        <div className="bg-slate-50 border-b border-slate-200 p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-xs">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Review Your Health Summary</h2>
              <p className="text-xs text-slate-500">Please confirm if everything was understood correctly before doctor handover</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm bg-white">
          {editingField ? (
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 space-y-3">
              <h3 className="font-bold text-sky-900 text-xs uppercase tracking-wider">
                Editing: <span className="capitalize">{editingField.replace('_', ' ')}</span>
              </h3>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-sky-300 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-200"
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingField(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Save Change
                </button>
              </div>
            </div>
          ) : null}

          {/* List of Fields */}
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
            {/* Chief Complaint */}
            <div className="p-3 flex items-center justify-between hover:bg-white transition">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Chief Complaint</span>
                <p className="font-semibold text-slate-800 text-xs capitalize">{clinicalData.chief_complaint || '—'}</p>
              </div>
              <button
                type="button"
                onClick={() => handleStartEdit('chief_complaint', clinicalData.chief_complaint)}
                className="text-sky-600 hover:text-sky-800 p-1.5 rounded-md hover:bg-sky-50 cursor-pointer"
                title="Edit complaint"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Site */}
            <div className="p-3 flex items-center justify-between hover:bg-white transition">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Location (Site)</span>
                <p className="font-semibold text-slate-800 text-xs">{clinicalData.site || '—'}</p>
              </div>
              <button
                type="button"
                onClick={() => handleStartEdit('site', clinicalData.site)}
                className="text-sky-600 hover:text-sky-800 p-1.5 rounded-md hover:bg-sky-50 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Onset */}
            <div className="p-3 flex items-center justify-between hover:bg-white transition">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Onset / Duration</span>
                <p className="font-semibold text-slate-800 text-xs">{clinicalData.onset || clinicalData.duration || '—'}</p>
              </div>
              <button
                type="button"
                onClick={() => handleStartEdit('onset', clinicalData.onset)}
                className="text-sky-600 hover:text-sky-800 p-1.5 rounded-md hover:bg-sky-50 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Severity */}
            <div className="p-3 flex items-center justify-between hover:bg-white transition">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Pain Severity (0–10)</span>
                <p className="font-semibold text-slate-800 text-xs">{clinicalData.severity !== null ? `${clinicalData.severity}/10` : '—'}</p>
              </div>
              <button
                type="button"
                onClick={() => handleStartEdit('severity', clinicalData.severity)}
                className="text-sky-600 hover:text-sky-800 p-1.5 rounded-md hover:bg-sky-50 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Past Medical Conditions */}
            <div className="p-3 flex items-center justify-between hover:bg-white transition">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Chronic Conditions</span>
                <p className="font-semibold text-slate-800 text-xs">
                  {clinicalData.medical_history && clinicalData.medical_history.length > 0
                    ? clinicalData.medical_history.join(', ')
                    : 'None reported'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleStartEdit('medical_history', clinicalData.medical_history)}
                className="text-sky-600 hover:text-sky-800 p-1.5 rounded-md hover:bg-sky-50 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Allergies */}
            <div className="p-3 flex items-center justify-between hover:bg-white transition">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Known Allergies</span>
                <p className="font-semibold text-slate-800 text-xs">
                  {clinicalData.allergies && clinicalData.allergies.length > 0
                    ? clinicalData.allergies.join(', ')
                    : 'No known allergies'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleStartEdit('allergies', clinicalData.allergies)}
                className="text-sky-600 hover:text-sky-800 p-1.5 rounded-md hover:bg-sky-50 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Continue Chatting
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Looks Correct • Prepare Doctor Summary</span>
          </button>
        </div>
      </div>
    </div>
  );
};
