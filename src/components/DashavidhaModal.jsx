import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  Activity, 
  Flame, 
  Heart, 
  ShieldCheck, 
  ArrowRight, 
  RotateCcw,
  Check,
  Award,
  BookOpen
} from 'lucide-react';
import { sounds } from '../utils/audioTTS';

export const DASHAVIDHA_QUESTIONS = [
  {
    id: "prakriti",
    number: 1,
    title: "1. Prakriti (प्रकृति) - Natural Constitution",
    question: "What is your primary natural body type and climatic reaction?",
    hint: "Body frame, skin texture, and natural inclination towards heat/cold",
    options: [
      { value: "Vata (वात)", desc: "Slender/thin frame, dry skin, sensitive to cold/wind, quick active mind", color: "blue" },
      { value: "Pitta (पित्त)", desc: "Medium muscular build, warm body, prone to sweating/acidity, sharp appetite", color: "amber" },
      { value: "Kapha (कफ)", desc: "Broad solid build, thick smooth skin, calm temperament, slow digestion", color: "emerald" },
      { value: "Pitta-Vataja (पित्त-वात)", desc: "Mixed constitution: sharp digestion with dry skin and cold sensitivity", color: "purple" },
      { value: "Vata-Kaphaja (वात-कफ)", desc: "Mixed constitution: slender frame with calm energy and occasional sluggishness", color: "indigo" }
    ]
  },
  {
    id: "vikriti",
    number: 2,
    title: "2. Vikriti (विकृति) - Current Imbalance",
    question: "Which primary bodily discomfort or distress are you experiencing?",
    hint: "Identifies active morbidity and dosha disturbance",
    options: [
      { value: "Vata Imbalance (वात दोष - Joint pain, stiffness, insomnia, gas)", desc: "Aching joints, dryness, erratic digestion or mental restlessness", color: "blue" },
      { value: "Pitta Imbalance (पित्त दोष - Acidity, burning sensation, inflammation)", desc: "Acid reflux, burning stomach/chest, skin rashes or excess heat", color: "rose" },
      { value: "Kapha Imbalance (कफ दोष - Heaviness, congestion, lethargy)", desc: "Chest mucus, water retention, sluggish metabolism and drowsiness", color: "emerald" },
      { value: "Balanced / Wellness (सम दोष - General health check-up)", desc: "No acute distress, seeking general vitality and immunity guidance", color: "teal" }
    ]
  },
  {
    id: "sara",
    number: 3,
    title: "3. Sara (सार) - Tissue Vitality & Dhatu Quality",
    question: "How would you describe your overall tissue vitality and endurance?",
    hint: "Quality of skin luster, bone density, muscle tone, and natural immunity (Ojas)",
    options: [
      { value: "Pravara Sara (प्रवर सार - High Vitality)", desc: "Lustrous skin, strong teeth and bones, high natural resistance to infections", color: "emerald" },
      { value: "Madhyama Sara (मध्यम सार - Moderate Vitality)", desc: "Average physical tone and endurance, balanced recovery", color: "blue" },
      { value: "Avara Sara (अवर सार - Low / Delicate Vitality)", desc: "Delicate build, easily fatigued, takes longer to recover from minor illness", color: "amber" }
    ]
  },
  {
    id: "samhanana",
    number: 4,
    title: "4. Samhanana (संहनन) - Body Compactness",
    question: "How is your skeletal frame and joint firmness?",
    hint: "Structural integrity and bone-joint compactness",
    options: [
      { value: "Su-samhanana (सुसंहनन - Compact & Sturdy)", desc: "Well-knit firm joints, symmetrical posture, high physical stability", color: "emerald" },
      { value: "Madhyama Samhanana (मध्यम संहनन - Moderate)", desc: "Balanced structural build with normal joint mobility", color: "blue" },
      { value: "Hina Samhanana (हीन संहनन - Frail / Loose)", desc: "Thin delicate frame, hyper-flexible or loose ligaments, prone to sprains", color: "amber" }
    ]
  },
  {
    id: "pramana",
    number: 5,
    title: "5. Pramana (प्रमाण) - Anthropometric Proportions",
    question: "How are your physical measurements relative to healthy norms?",
    hint: "Body Mass Index (BMI) and physical proportions",
    options: [
      { value: "Pramanavat (प्रमाणवत - Balanced BMI 18.5 - 24.9)", desc: "Healthy height-to-weight ratio with balanced anatomical proportions", color: "emerald" },
      { value: "Ati-krisha (अतिकृश - Lean / Underweight BMI < 18.5)", desc: "Prominent tendons, low body fat reserve, delicate bone frame", color: "blue" },
      { value: "Ati-sthula (अतिस्थूल - Heavy / Overweight BMI ≥ 25)", desc: "Excess adipose tissue, heavy frame, tendency to retain water", color: "amber" }
    ]
  },
  {
    id: "satmya",
    number: 6,
    title: "6. Satmya (सात्म्य) - Dietary & Environmental Adaptability",
    question: "How easily does your system adapt to different foods and seasons?",
    hint: "Habituation, tolerance to spices, climate shifts, and varied foods",
    options: [
      { value: "Sarva-satmya (सर्वसात्म्य - High Adaptability)", desc: "Easily digests diverse regional foods, adjusts well to seasonal weather shifts", color: "emerald" },
      { value: "Madhyama Satmya (मध्यम सात्म्य - Moderate)", desc: "Adapts well to routine home food, slightly sensitive to very sour/spicy food", color: "blue" },
      { value: "Eka-satmya / Avara (एकसात्म्य - High Sensitivity)", desc: "Delicate stomach, frequent food intolerances or seasonal allergies", color: "amber" }
    ]
  },
  {
    id: "sattva",
    number: 7,
    title: "7. Sattva (सत्त्व) - Mental Strength & Emotional Stamina",
    question: "How is your psychological endurance and response to stress/pain?",
    hint: "Emotional stability, patience, anxiety control, and courage",
    options: [
      { value: "Pravara Sattva (प्रवर सत्त्व - Strong Mental Resolve)", desc: "Calm under pressure, high pain tolerance, optimistic and clear-minded", color: "emerald" },
      { value: "Madhyama Sattva (मध्यम सत्त्व - Moderate Resilience)", desc: "Copes well with encouragement and clear explanation of treatment", color: "blue" },
      { value: "Avara Sattva (अवर सत्त्व - Anxious / Low Pain Tolerance)", desc: "Easily stressed, sensitive to pain, requires gentle reassurance", color: "amber" }
    ]
  },
  {
    id: "aharaShakti",
    number: 8,
    title: "8. Ahara Shakti (आहार शक्ति) - Digestive & Metabolic Fire",
    question: "How is your appetite (Abhyavaharana) and food digestion (Jarana)?",
    hint: "Digestive fire (Agni) and post-meal comfort",
    options: [
      { value: "Samagni (समाग्नि - Balanced Digestion)", desc: "Consistent healthy hunger, food digests smoothly without burning or bloating", color: "emerald" },
      { value: "Tikshnagni (तीक्ष्णाग्नि - Hyperactive / High Acidity)", desc: "Intense frequent hunger, quick burning sensation, prone to acid reflux", color: "rose" },
      { value: "Mandagni (मन्दाग्नि - Sluggish Digestion)", desc: "Low appetite, heavy post-meal fullness lasting several hours", color: "amber" },
      { value: "Vishamagni (विषमाग्नि - Irregular Appetite)", desc: "Unpredictable digestion: fluctuating hunger, gas, and abdominal bloating", color: "blue" }
    ]
  },
  {
    id: "vyayamaShakti",
    number: 9,
    title: "9. Vyayama Shakti (व्यायाम शक्ति) - Physical Endurance",
    question: "What is your capacity for physical exertion and brisk walking?",
    hint: "Cardiovascular endurance and fatigue threshold",
    options: [
      { value: "Pravara (प्रवर - High Physical Endurance)", desc: "Can briskly walk or exercise for 45+ minutes with quick recovery", color: "emerald" },
      { value: "Madhyama (मध्यम - Moderate Stamina)", desc: "Comfortable with daily active chores and 20-30 min walks", color: "blue" },
      { value: "Avara (अवर - Low Stamina / Easily Fatigued)", desc: "Fatigued quickly, breathless with mild physical exertion", color: "amber" }
    ]
  },
  {
    id: "vaya",
    number: 10,
    title: "10. Vaya (वय) - Life Stage & Biological Age",
    question: "Which classical Ayurvedic age bracket do you belong to?",
    hint: "Dosha predominance according to age category",
    options: [
      { value: "Balya Avastha (बाल्यावस्था - Childhood, < 16 Yrs)", desc: "Growth & development stage, Kapha naturally predominant", color: "cyan" },
      { value: "Madhyama Avastha (मध्यमावस्था - Adult, 16 - 60 Yrs)", desc: "Active metabolic & career stage, Pitta naturally predominant", color: "blue" },
      { value: "Vriddha Avastha (वृद्धावस्था - Senior, > 60 Yrs)", desc: "Graceful mature stage, Vata naturally predominant, joint care needed", color: "purple" }
    ]
  }
];

export const DEFAULT_DASHAVIDHA = {
  prakriti: "Pitta-Vataja (पित्त-वात)",
  vikriti: "Pitta Imbalance (पित्त दोष / अम्लपित्त - Acidity & Reflux)",
  sara: "Madhyama Sara (मध्यम सार - Moderate Vitality)",
  samhanana: "Su-samhanana (सुसंहनन - Compact & Sturdy)",
  pramana: "Pramanavat (प्रमाणवत - Balanced BMI 18.5 - 24.9)",
  satmya: "Madhyama Satmya (मध्यम सात्म्य - Moderate Adaptability)",
  sattva: "Pravara Sattva (प्रवर सत्त्व - High Mental Resolve)",
  aharaShakti: "Tikshnagni (तीक्ष्णाग्नि - Hyperactive Digestive Fire)",
  vyayamaShakti: "Madhyama (मध्यम - Moderate Stamina)",
  vaya: "Madhyama Avastha (मध्यमावस्था - Adult 16-60 Yrs)"
};

const DashavidhaModal = ({ isOpen, onClose, currentData, onSave, patientName = "Patient" }) => {
  const [answers, setAnswers] = useState(currentData || DEFAULT_DASHAVIDHA);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  if (!isOpen) return null;

  const handleSelectOption = (questionId, value) => {
    sounds.playClick();
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleQuickPreset = (presetType) => {
    sounds.playSuccess();
    if (presetType === 'pitta') {
      setAnswers({
        prakriti: "Pitta (पित्त)",
        vikriti: "Pitta Imbalance (पित्त दोष - Acidity, burning sensation, inflammation)",
        sara: "Pravara Sara (प्रवर सार - High Vitality)",
        samhanana: "Su-samhanana (सुसंहनन - Compact & Sturdy)",
        pramana: "Pramanavat (प्रमाणवत - Balanced BMI 18.5 - 24.9)",
        satmya: "Madhyama Satmya (मध्यम सात्म्य - Moderate)",
        sattva: "Pravara Sattva (प्रवर सत्त्व - Strong Mental Resolve)",
        aharaShakti: "Tikshnagni (तीक्ष्णाग्नि - Hyperactive / High Acidity)",
        vyayamaShakti: "Pravara (प्रवर - High Physical Endurance)",
        vaya: "Madhyama Avastha (मध्यमावस्था - Adult, 16 - 60 Yrs)"
      });
    } else if (presetType === 'vata') {
      setAnswers({
        prakriti: "Vata (वात)",
        vikriti: "Vata Imbalance (वात दोष - Joint pain, stiffness, insomnia, gas)",
        sara: "Madhyama Sara (मध्यम सार - Moderate Vitality)",
        samhanana: "Madhyama Samhanana (मध्यम संहनन - Moderate)",
        pramana: "Ati-krisha (अतिकृश - Lean / Underweight BMI < 18.5)",
        satmya: "Eka-satmya / Avara (एकसात्म्य - High Sensitivity)",
        sattva: "Madhyama Sattva (मध्यम सत्त्व - Moderate Resilience)",
        aharaShakti: "Vishamagni (विषमाग्नि - Irregular Appetite)",
        vyayamaShakti: "Madhyama (मध्यम - Moderate Stamina)",
        vaya: "Madhyama Avastha (मध्यमावस्था - Adult, 16 - 60 Yrs)"
      });
    } else {
      setAnswers({
        prakriti: "Kapha (कफ)",
        vikriti: "Kapha Imbalance (कफ दोष - Heaviness, congestion, lethargy)",
        sara: "Pravara Sara (प्रवर सार - High Vitality)",
        samhanana: "Su-samhanana (सुसंहनन - Compact & Sturdy)",
        pramana: "Ati-sthula (अतिस्थूल - Heavy / Overweight BMI ≥ 25)",
        satmya: "Sarva-satmya (सर्वसात्म्य - High Adaptability)",
        sattva: "Pravara Sattva (प्रवर सत्त्व - Strong Mental Resolve)",
        aharaShakti: "Mandagni (मन्दाग्नि - Sluggish Digestion)",
        vyayamaShakti: "Avara (अवर - Low Stamina / Easily Fatigued)",
        vaya: "Madhyama Avastha (मध्यमावस्था - Adult, 16 - 60 Yrs)"
      });
    }
  };

  const handleSaveAndComplete = () => {
    sounds.playSuccess();

    if (onSave) {
      onSave(answers);
    }
    onClose();
  };

  const currentQ = DASHAVIDHA_QUESTIONS[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-emerald-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 px-6 py-4 text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center space-x-3 z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-emerald-200">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight">
                  Ayurvedic Dashavidha Pariksha
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/30 text-emerald-100 border border-emerald-400/40">
                  दशविध परीक्षा • 10 Questions
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium">
                Clinical Constitutional Assessment for {patientName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition z-10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Demo Fill Presets Bar */}
        <div className="px-6 py-2.5 bg-emerald-50/70 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-bold text-emerald-900 flex items-center gap-1.5">
            <BookOpen size={14} className="text-emerald-700" />
            <span>1-Click Assessment Presets:</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickPreset('pitta')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 transition text-[11px]"
            >
              ⚡ Pitta Profile (Acidity / Active)
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('vata')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-100 text-blue-800 font-bold border border-blue-200 transition text-[11px]"
            >
              ⚡ Vata Profile (Joints / Dry)
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('kapha')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-teal-100 text-teal-800 font-bold border border-teal-200 transition text-[11px]"
            >
              ⚡ Kapha Profile (Congestion)
            </button>
          </div>
        </div>

        {/* Navigation Step Pills (1 to 10) */}
        <div className="px-6 pt-3 pb-2 bg-slate-50 border-b border-slate-200 overflow-x-auto flex items-center gap-1.5 scrollbar-thin">
          {DASHAVIDHA_QUESTIONS.map((q, idx) => {
            const isAnswered = !!answers[q.id];
            const isCurrent = currentStep === idx;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => { sounds.playClick(); setCurrentStep(idx); setShowSummary(false); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${
                  isCurrent
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : isAnswered
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-white text-slate-500 border border-slate-200'
                }`}
              >
                <span>{idx + 1}.</span>
                <span>{q.id.charAt(0).toUpperCase() + q.id.slice(1)}</span>
                {isAnswered && <Check size={11} className="text-emerald-700" />}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => { sounds.playClick(); setShowSummary(true); }}
            className={`px-3 py-1 rounded-lg text-xs font-black whitespace-nowrap transition flex items-center gap-1 ${
              showSummary ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
            }`}
          >
            <span>📋 Scorecard</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {!showSummary ? (
            <div>
              {/* Question Header */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                    Question {currentStep + 1} of 10
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Ayurvedic Clinical Metric</span>
                </div>
                <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-2">
                  {currentQ.title}
                </h4>
                <p className="text-sm font-semibold text-slate-700 mt-1">
                  {currentQ.question}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 italic">
                  💡 {currentQ.hint}
                </p>
              </div>

              {/* Options List */}
              <div className="grid gap-3">
                {currentQ.options.map((opt) => {
                  const isSelected = answers[currentQ.id] === opt.value;
                  return (
                    <div
                      key={opt.value}
                      onClick={() => handleSelectOption(currentQ.id, opt.value)}
                      className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-start justify-between gap-3 text-left ${
                        isSelected
                          ? 'bg-emerald-50/80 border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-extrabold ${isSelected ? 'text-emerald-900' : 'text-slate-900'}`}>
                            {opt.value}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-medium">
                          {opt.desc}
                        </p>
                      </div>

                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check size={14} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Prev / Next controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-4">
                <button
                  type="button"
                  disabled={currentStep === 0}
                  onClick={() => { sounds.playClick(); setCurrentStep(prev => Math.max(0, prev - 1)); }}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-300 rounded-xl text-xs disabled:opacity-40 transition"
                >
                  ← Previous
                </button>

                {currentStep < 9 ? (
                  <button
                    type="button"
                    onClick={() => { sounds.playClick(); setCurrentStep(prev => Math.min(9, prev + 1)); }}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <span>Next Question</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { sounds.playClick(); setShowSummary(true); }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
                  >
                    <span>Review 10 Insights Scorecard</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Summary & Scorecard View */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300">
                    Calculated Ayurvedic Profile
                  </span>
                  <h4 className="text-xl sm:text-2xl font-black mt-0.5">
                    {answers.prakriti}
                  </h4>
                  <p className="text-xs text-emerald-100 mt-1">
                    Current Morbidity (Vikriti): <strong className="text-white">{answers.vikriti}</strong>
                  </p>
                </div>
                <div className="text-center sm:text-right shrink-0">
                  <span className="text-[11px] text-emerald-200 block">Digestive Fire (Agni)</span>
                  <span className="text-sm font-extrabold text-amber-300">{answers.aharaShakti}</span>
                </div>
              </div>

              {/* 10 Items Review Grid */}
              <div className="grid sm:grid-cols-2 gap-2.5">
                {DASHAVIDHA_QUESTIONS.map((q) => (
                  <div key={q.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase block">
                      {q.title}
                    </span>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">
                      {answers[q.id] || "Pending Assessment"}
                    </p>
                  </div>
                ))}
              </div>

              {/* Ayurvedic Guidance Note */}
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-extrabold flex items-center gap-1 text-amber-950">
                  <Sparkles size={14} /> Personalized Lifestyle & Ahara Guidance:
                </span>
                <p>
                  Based on your <strong>{answers.prakriti}</strong> prakriti and <strong>{answers.aharaShakti}</strong>, favor warm, freshly cooked meals with mild cooling herbs (Coriander, Cumin, Fennel). Avoid excessive chili and irregular meal hours.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Ayush 2.0 Dashavidha Framework • Charaka Samhita Vimanashana</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-white hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndComplete}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold shadow-md transition flex items-center gap-1.5"
            >
              <CheckCircle2 size={16} />
              <span>Save 10 Insights to Token & Chart</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashavidhaModal;
