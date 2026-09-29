import React from 'react';
import { Play, Sparkles } from 'lucide-react';
import type { Language } from '../types';

export interface ScenarioStep {
  option?: string;
  text?: string;
}

export interface DemoScenario {
  key: string;
  title: string;
  category: 'Allopathy' | 'AYUSH' | 'Safety';
  badge: string;
  language: Language;
  description: string;
  steps: ScenarioStep[];
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    key: 'ayush_amlapitta',
    title: '🌿 Amlapitta (Acidity) — AYUSH Flow',
    category: 'AYUSH',
    badge: 'Ayurveda',
    language: 'english',
    description: '10-point Dashavidha Pariksha, Pitta Prakriti & Tikshnagni evaluation',
    steps: [
      { option: 'system_ayush' },
      { option: 'english' },
      { option: 'consent_yes' },
      { text: 'I have severe burning in chest and sour belching after meals for 1 week' },
      { option: 'Upper abdomen / Stomach' },
      { option: '6' },
      { option: 'Medium / Moderate athletic build' },
      { option: 'Prefers cooler environment (Dislikes heat)' },
      { option: 'Excessive body heat, burning sensations, irritability, acid reflux' },
      { option: 'Very Good / Strong appetite (Tikshnagni)' },
      { option: 'Acidity / Burning in chest or throat' },
      { option: 'Spicy / Hot foods, Oily / Fried foods' },
      { option: 'Generally calm and balanced' },
      { option: 'Moderate endurance / Regular walking or light exercise' },
      { option: 'Good (Madhyama Sara)' },
      { option: 'Well-compacted & Sturdy (Susamhita)' },
      { option: 'Young adult (18–35 yrs) / Taruna' },
      { option: 'None of these' },
      { option: 'No' },
      { option: 'No (No known allergies)' },
      { option: 'looks_correct' }
    ]
  },
  {
    key: 'cardiac_red_flag',
    title: '🚨 Cardiac Chest Pain — Red-Flag Safety',
    category: 'Safety',
    badge: 'Emergency Triage',
    language: 'english',
    description: 'Instant critical safety alert & nurse station dispatch for acute coronary symptoms',
    steps: [
      { option: 'system_allopathy' },
      { option: 'english' },
      { option: 'consent_yes' },
      { text: 'I have severe crushing chest pain radiating to my left arm and sweating' }
    ]
  },
  {
    key: 'ayush_sandhivata',
    title: '🌿 Sandhivata (Joint Pain) — AYUSH Flow',
    category: 'AYUSH',
    badge: 'Ayurveda',
    language: 'hindi',
    description: 'Vata dominance, morning joint stiffness & classical Agni assessment',
    steps: [
      { option: 'system_ayush' },
      { option: 'hindi' },
      { option: 'consent_yes' },
      { text: 'मुझे दोनों घुटनों और जोड़ों में काफी दर्द और जकड़न महसूस होती है' },
      { option: 'Joints / Lower Back / Knees' },
      { option: '7' },
      { option: 'Slender / Thin build, dry skin, feels cold easily (Vata dominant tendencies)' },
      { option: 'Prefers warm environment (Dislikes cold / breeze)' },
      { option: 'Body stiffness, joint aches, gas/bloating, dryness, disturbed sleep' },
      { option: 'Irregular / Variable hunger (Vishamagni)' },
      { option: 'Gas / Abdominal cramping' },
      { option: 'Cold foods / Raw salads / Cold drinks' },
      { option: 'Tends to worry / Anxious or restless under pressure' },
      { option: 'Low stamina / Gets tired very quickly' },
      { option: 'Delicate / Low vitality (Avara Sara)' },
      { option: 'Loose / Lax frame (Asamhita)' },
      { option: 'Middle age (36–60 yrs) / Madhyama' },
      { option: 'None of these' },
      { option: 'No' },
      { option: 'No (No known allergies)' },
      { option: 'looks_correct' }
    ]
  },
  {
    key: 'allopathy_socrates_stomach',
    title: '🩺 Abdominal Pain — SOCRATES Flow',
    category: 'Allopathy',
    badge: 'Modern Medicine',
    language: 'english',
    description: 'Full SOCRATES breakdown: Site, Onset, Character, Radiation & Severity',
    steps: [
      { option: 'system_allopathy' },
      { option: 'english' },
      { option: 'consent_yes' },
      { text: 'I have stomach pain after eating meals' },
      { option: 'Upper abdomen / Stomach' },
      { option: '2-3 days ago' },
      { option: 'Burning / Acidity' },
      { option: 'No radiation (localized)' },
      { option: 'Nausea / Vomiting' },
      { option: 'Worse at night / after meals' },
      { option: 'Worse with food / Better with antacid' },
      { option: '5' },
      { option: 'None of these' },
      { option: 'No' },
      { option: 'No (No known allergies)' },
      { option: 'looks_correct' }
    ]
  }
];

interface DemoScenariosBarProps {
  onSelectScenario: (scenarioKey: string, lang: Language) => void;
  isLoading: boolean;
}

export const DemoScenariosBar: React.FC<DemoScenariosBarProps> = ({
  onSelectScenario,
  isLoading
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-xs text-slate-800 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-3 overflow-x-auto shadow-2xs">
      <div className="flex items-center gap-2 shrink-0">
        <Sparkles className="w-4 h-4 text-sky-600" />
        <span className="text-xs font-bold text-slate-700 tracking-wider uppercase">
          1-Click Test Scenarios:
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto py-0.5">
        {DEMO_SCENARIOS.map((scenario) => (
          <button
            key={scenario.key}
            type="button"
            disabled={isLoading}
            onClick={() => onSelectScenario(scenario.key, scenario.language)}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${scenario.category === 'AYUSH'
              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 shadow-2xs'
              : scenario.category === 'Safety'
                ? 'bg-red-50 hover:bg-red-100 text-red-800 border-red-300 shadow-2xs'
                : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-300 shadow-2xs'
              }`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{scenario.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
