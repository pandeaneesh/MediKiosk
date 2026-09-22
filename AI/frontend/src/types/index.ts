export type MedicalSystem = 'allopathy' | 'ayush';

export type Language =
  | 'english'
  | 'hindi'
  | 'marathi'
  | 'gujarati'
  | 'tamil'
  | 'telugu'
  | 'kannada'
  | 'malayalam'
  | 'bengali'
  | 'punjabi'
  | 'odia'
  | 'assamese'
  | 'urdu';

export type SessionPhase =
  | 'select_system'
  | 'language_select'
  | 'consent'
  | 'chief_complaint'
  | 'socrates_questions'
  | 'ayurveda_dashavidha'
  | 'medical_history'
  | 'medication_history'
  | 'allergies'
  | 'review_confirmation'
  | 'completed'
  | 'emergency_escalation';

export type QuestionType =
  | 'system_select'
  | 'language_select'
  | 'consent'
  | 'open_text'
  | 'single_choice'
  | 'multi_choice'
  | 'pain_scale'
  | 'severity_scale'
  | 'confirmation';

export interface QuickOption {
  label: string;
  value: string;
  subtitle?: string;
  icon?: string;
  is_red_flag?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'ai' | 'patient' | 'system';
  content: string;
  timestamp: string;
  options?: QuickOption[];
  question_type?: QuestionType;
  language?: Language | string;
  is_emergency?: boolean;
  audio_base64?: string;
}

export interface RedFlagDetail {
  flag_name: string;
  description: string;
  urgency: string;
  recommended_action?: string;
  timestamp?: string;
}

export interface DashavidhaParikshaData {
  prakriti?: {
    body_build?: string;
    temperature_preference?: string;
    [key: string]: any;
  };
  vikriti?: {
    recent_changes?: string[];
    dosha_tendency?: string;
    [key: string]: any;
  };
  sara?: string;
  samhanana?: string;
  pramana?: string;
  satmya?: string[];
  satva?: string;
  ahara_shakti?: {
    appetite_level?: string;
    post_meal?: string;
    [key: string]: any;
  };
  vyayama_shakti?: string;
  vaya?: string;
}

export interface ClinicalData {
  chief_complaint?: string | null;
  symptom?: string | null;
  site?: string | null;
  onset?: string | null;
  character?: string | null;
  radiation?: string | null;
  associated_symptoms?: string[];
  timing?: string | null;
  aggravating_factors?: string[];
  relieving_factors?: string[];
  severity?: number | null;
  duration?: string | null;
  previous_occurrences?: string | null;
  medical_history?: string[];
  medication_history?: string[];
  allergies?: string[];
  dashavidha_pariksha?: DashavidhaParikshaData;
  red_flags?: string[];
  patient_own_words?: string[];
  missing_information?: string[];
}

export interface DoctorSummary {
  patient_id: string;
  session_id: string;
  timestamp: string;
  medical_system: string;
  language_used: string;
  patient_complaint: string;
  socrates_summary?: Record<string, any> | null;
  dashavidha_pariksha?: Record<string, any> | null;
  chronic_history: string[];
  current_medications: string[];
  allergies: string[];
  triage_level: string;
  red_flags: RedFlagDetail[];
  ai_note: string;
  transcript_excerpt?: ChatMessage[];
}

export interface ChatResponse {
  session_id: string;
  medical_system: string;
  language?: Language | string;
  current_phase: SessionPhase;
  progress_percentage: number;
  ai_message: ChatMessage;
  clinical_data: ClinicalData;
  red_flag?: boolean;
  red_flag_details?: RedFlagDetail[];
  is_completed?: boolean;
  doctor_summary?: DoctorSummary | null;
}
