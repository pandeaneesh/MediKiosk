import React from 'react';
import { Delete, RotateCcw } from 'lucide-react';
import { sounds } from '../utils/audioTTS';

const TouchNumpad = ({ value, onChange, onEnter, maxLength = 10, formatType = 'mobile' }) => {
  const handleDigit = (digit) => {
    sounds.playClick();
    // Strip hyphens/spaces to calculate raw length
    const rawVal = value.replace(/[\s-]/g, '');
    if (rawVal.length >= maxLength) return;

    const newRaw = rawVal + digit;
    applyFormattedValue(newRaw);
  };

  const handleBackspace = () => {
    sounds.playClick();
    const rawVal = value.replace(/[\s-]/g, '');
    if (rawVal.length === 0) return;
    const newRaw = rawVal.slice(0, -1);
    applyFormattedValue(newRaw);
  };

  const handleClear = () => {
    sounds.playAlert();
    onChange('');
  };

  const applyFormattedValue = (raw) => {
    if (formatType === 'mobile') {
      // Format as XXXXX XXXXX (10 digits)
      const truncated = raw.slice(0, 10);
      let formatted = '';
      for (let i = 0; i < truncated.length; i++) {
        if (i === 5) formatted += ' ';
        formatted += truncated[i];
      }
      onChange(formatted);
    } else if (formatType === 'abha') {
      // Format as XX-XXXX-XXXX-XXXX (14 digits)
      const truncated = raw.slice(0, 14);
      let formatted = '';
      for (let i = 0; i < truncated.length; i++) {
        if (i === 2 || i === 6 || i === 10) formatted += '-';
        formatted += truncated[i];
      }
      onChange(formatted);
    } else if (formatType === 'aadhaar') {
      // Format as XXXX XXXX XXXX (12 digits)
      const truncated = raw.slice(0, 12);
      let formatted = '';
      for (let i = 0; i < truncated.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += ' ';
        formatted += truncated[i];
      }
      onChange(formatted);
    } else {
      onChange(raw);
    }
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];

  return (
    <div className="bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-2xl">
      <div className="flex items-center justify-between mb-3 px-1 text-slate-300 text-xs font-semibold uppercase tracking-wider">
        <span>Touch Keypad</span>
        <span className="text-blue-400">Tap numbers on screen</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {keys.map((key) => {
          if (key === 'C') {
            return (
              <button
                key={key}
                type="button"
                onClick={handleClear}
                className="h-14 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 active:scale-95 transition font-bold text-lg"
                title="Clear All"
              >
                <RotateCcw size={20} className="mr-1" />
                <span>CLR</span>
              </button>
            );
          }
          if (key === '⌫') {
            return (
              <button
                key={key}
                type="button"
                onClick={handleBackspace}
                className="h-14 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 border border-slate-700 active:scale-95 transition font-bold text-lg"
                title="Backspace"
              >
                <Delete size={22} />
              </button>
            );
          }
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleDigit(key)}
              className="h-14 flex items-center justify-center rounded-xl bg-slate-800/90 hover:bg-blue-600 text-white font-bold text-2xl border border-slate-700 hover:border-blue-400 active:scale-95 transition shadow-sm"
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TouchNumpad;
