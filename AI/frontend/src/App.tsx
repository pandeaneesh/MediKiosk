import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LeftPanel } from './components/LeftPanel';
import { ChatArea } from './components/ChatArea';
import { RightPanel } from './components/RightPanel';
import { EmergencyModal } from './components/EmergencyModal';
import { SummaryConfirmationModal } from './components/SummaryConfirmationModal';
import { DoctorSummaryView } from './components/DoctorSummaryView';
import { DemoScenariosBar, DEMO_SCENARIOS } from './components/DemoScenariosBar';
import { ApiService } from './services/api';
import type {
  ChatMessage, ClinicalData, Language, SessionPhase,
  RedFlagDetail, DoctorSummary, MedicalSystem
} from './types';

export const App: React.FC = () => {
  const [sessionId, setSessionId] = useState<string>('');
  const [medicalSystem, setMedicalSystem] = useState<MedicalSystem>('allopathy');
  const [language, setLanguage] = useState<Language>('english');
  const [currentPhase, setCurrentPhase] = useState<SessionPhase>('select_system');
  const [progressPercentage, setProgressPercentage] = useState<number>(5);
  const [clinicalData, setClinicalData] = useState<ClinicalData>({
    chief_complaint: null,
    symptom: null,
    site: null,
    onset: null,
    character: null,
    radiation: null,
    associated_symptoms: [],
    timing: null,
    aggravating_factors: [],
    relieving_factors: [],
    severity: null,
    duration: null,
    previous_occurrences: null,
    medical_history: [],
    medication_history: [],
    allergies: [],
    red_flags: [],
    patient_own_words: [],
    missing_information: []
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [redFlags, setRedFlags] = useState<RedFlagDetail[]>([]);
  const [doctorSummary, setDoctorSummary] = useState<DoctorSummary | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState<boolean>(false);
  const [isDoctorViewOpen, setIsDoctorViewOpen] = useState<boolean>(false);

  // Maintain ref to avoid stale closures during rapid scenario execution
  const sessionIdRef = useRef<string>('');
  const languageRef = useRef<Language>('english');

  const updateSessionId = (newId: string) => {
    sessionIdRef.current = newId;
    setSessionId(newId);
  };

  const updateLanguage = (newLang: Language) => {
    languageRef.current = newLang;
    setLanguage(newLang);
  };

  // Initialize a new session
  const initSession = useCallback(async (lang: Language = 'english'): Promise<string> => {
    setIsLoading(true);
    updateLanguage(lang);
    try {
      const data = await ApiService.startSession(lang);
      updateSessionId(data.session_id);
      if (data.medical_system) {
        setMedicalSystem(data.medical_system === 'ayush' ? 'ayush' : 'allopathy');
      }
      setCurrentPhase(data.current_phase);
      setProgressPercentage(data.progress_percentage);
      setClinicalData(data.clinical_data);
      setMessages([data.ai_message]);
      setRedFlags(data.red_flag_details || []);
      setDoctorSummary(data.doctor_summary || null);
      return data.session_id;
    } catch (err) {
      console.warn("Backend starting with local fallback:", err);
      const fallbackId = `local-${Date.now()}`;
      updateSessionId(fallbackId);
      setCurrentPhase('select_system');
      setProgressPercentage(5);
      setMessages([{
        id: 'init-msg',
        role: 'ai',
        content: "Welcome to MediKiosk. Please select your preferred medical system to begin the interview / चिकित्सा पद्धति का चयन करें:",
        timestamp: new Date().toISOString(),
        question_type: 'system_select',
        options: [
          { label: 'Allopathy (Modern Medicine)', value: 'system_allopathy', icon: '🩺', subtitle: 'Standard clinical assessment & SOCRATES symptom analysis' },
          { label: 'AYUSH (Ayurveda)', value: 'system_ayush', icon: '🌿', subtitle: 'Ayurvedic assessment & classical Dashavidha Pariksha' }
        ],
        language: lang
      }]);
      return fallbackId;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initSession('english');
  }, [initSession]);

  // Direct send message with explicit target session ID
  const sendMessageInternal = async (targetSessionId: string, text: string, selectedOption?: string) => {
    if (!targetSessionId) return;
    setIsLoading(true);

    // If selected option is a language choice, update language immediately
    const knownLangs: Language[] = [
      'english', 'hindi', 'marathi', 'gujarati', 'tamil',
      'telugu', 'kannada', 'malayalam', 'bengali', 'punjabi',
      'odia', 'assamese', 'urdu'
    ];
    if (selectedOption && knownLangs.includes(selectedOption.toLowerCase() as Language)) {
      updateLanguage(selectedOption.toLowerCase() as Language);
    }

    const currentLang = (selectedOption && knownLangs.includes(selectedOption.toLowerCase() as Language))
      ? (selectedOption.toLowerCase() as Language)
      : languageRef.current;

    // Optimistically append patient message
    const patientMsg: ChatMessage = {
      id: `pt-${Date.now()}-${Math.random()}`,
      role: 'patient',
      content: text,
      timestamp: new Date().toISOString(),
      options: [],
      question_type: 'open_text',
      language: currentLang
    };
    setMessages(prev => [...prev, patientMsg]);

    try {
      const response = await ApiService.sendMessage(
        targetSessionId,
        text,
        selectedOption,
        currentLang
      );

      if (response.language) {
        updateLanguage(response.language as Language);
      } else if (response.ai_message?.language) {
        updateLanguage(response.ai_message.language as Language);
      }

      if (response.medical_system) {
        setMedicalSystem(response.medical_system === 'ayush' ? 'ayush' : 'allopathy');
      }
      setCurrentPhase(response.current_phase);
      setProgressPercentage(response.progress_percentage);
      setClinicalData(response.clinical_data);
      setMessages(prev => [...prev, response.ai_message]);

      if (response.red_flag) {
        setRedFlags(response.red_flag_details || []);
        setIsEmergencyModalOpen(true);
      }

      if (response.doctor_summary) {
        setDoctorSummary(response.doctor_summary);
      }

      if (response.current_phase === 'review_confirmation') {
        setIsConfirmationModalOpen(true);
      }

      if (response.is_completed && response.doctor_summary) {
        setIsDoctorViewOpen(true);
      }
    } catch (err) {
      console.error("Error sending message:", err);
      const fallbackAiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: "Thank you. I have recorded that information. Could you please provide any further details regarding your symptoms?",
        timestamp: new Date().toISOString(),
        options: [],
        question_type: 'open_text',
        language: currentLang
      };
      setMessages(prev => [...prev, fallbackAiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (text: string, selectedOption?: string) => {
    const knownLangs: Language[] = [
      'english', 'hindi', 'marathi', 'gujarati', 'tamil',
      'telugu', 'kannada', 'malayalam', 'bengali', 'punjabi',
      'odia', 'assamese', 'urdu'
    ];
    if (selectedOption && knownLangs.includes(selectedOption.toLowerCase() as Language)) {
      updateLanguage(selectedOption.toLowerCase() as Language);
    }
    const activeId = sessionIdRef.current || sessionId;
    return sendMessageInternal(activeId, text, selectedOption);
  };

  // Language change from UI
  const handleLanguageChange = (newLang: Language) => {
    updateLanguage(newLang);
    handleSendMessage(newLang, newLang);
  };

  // Trigger Emergency Desk Escalation
  const handleTriggerEmergency = async () => {
    const activeId = sessionIdRef.current || sessionId;
    try {
      await ApiService.triggerEmergency(activeId, "Patient pressed Emergency Nurse Assistance button");
    } catch (e) { }

    const emergencyFlag: RedFlagDetail = {
      flag_name: "Emergency Nurse Station Activated",
      description: "Patient manually triggered urgent assistance from kiosk interface.",
      urgency: "CRITICAL",
      timestamp: new Date().toISOString(),
      recommended_action: "Immediate nursing station dispatch."
    };
    setRedFlags(prev => [...prev, emergencyFlag]);
    setIsEmergencyModalOpen(true);
  };

  // Edit clinical field from review modal
  const handleEditField = async (fieldName: string, newValue: any) => {
    const activeId = sessionIdRef.current || sessionId;
    try {
      const res = await ApiService.editClinicalField(activeId, fieldName, newValue);
      if (res && res.clinical_data) {
        setClinicalData(res.clinical_data);
      }
    } catch (e) {
      setClinicalData(prev => ({ ...prev, [fieldName]: newValue }));
    }
  };

  // Final confirmation approved
  const handleConfirmSummary = () => {
    handleSendMessage("Looks correct", "looks_correct");
    setIsDoctorViewOpen(true);
  };

  // Run automated demo scenario
  const handleSelectScenario = async (scenarioKey: string, lang: Language) => {
    const scenario = DEMO_SCENARIOS.find(s => s.key === scenarioKey);
    if (!scenario) return;

    // Reset modals
    setIsEmergencyModalOpen(false);
    setIsConfirmationModalOpen(false);
    setIsDoctorViewOpen(false);

    const newSessionId = await initSession(lang);

    // Step through the scenario with natural timing
    for (let i = 0; i < scenario.steps.length; i++) {
      const step = scenario.steps[i];
      await new Promise(r => setTimeout(r, 650));
      if (step.option) {
        await sendMessageInternal(newSessionId, step.option, step.option);
      } else if (step.text) {
        await sendMessageInternal(newSessionId, step.text);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans">
      {/* Top Demo Scenarios Bar */}
      <DemoScenariosBar
        onSelectScenario={handleSelectScenario}
        isLoading={isLoading}
      />

      {/* Main 3-Panel Kiosk Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel: Branding, Status, Language, Progress */}
        <LeftPanel
          sessionId={sessionId}
          medicalSystem={medicalSystem}
          language={language}
          onLanguageChange={handleLanguageChange}
          currentPhase={currentPhase}
          progressPercentage={progressPercentage}
          onTriggerEmergency={handleTriggerEmergency}
        />

        {/* Center Panel: AI Message Stream, Quick Replies, Voice Input */}
        <ChatArea
          messages={messages}
          language={language}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onResetSession={() => initSession(language)}
        />

        {/* Right Panel: Live Collected Clinical Data Card */}
        <RightPanel
          medicalSystem={medicalSystem}
          clinicalData={clinicalData}
          redFlags={redFlags}
          onOpenSummaryModal={() => setIsDoctorViewOpen(true)}
        />
      </div>

      {/* Emergency Escalation Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        redFlags={redFlags}
        chiefComplaint={clinicalData.chief_complaint}
      />

      {/* Patient Review & Confirmation Modal */}
      <SummaryConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        clinicalData={clinicalData}
        language={language}
        onConfirm={handleConfirmSummary}
        onEditField={handleEditField}
      />

      {/* Doctor-Ready Clinical Handover Report View */}
      <DoctorSummaryView
        summary={doctorSummary}
        isOpen={isDoctorViewOpen}
        onClose={() => setIsDoctorViewOpen(false)}
      />
    </div>
  );
};

export default App;
