import type { ChatResponse, DoctorSummary, Language } from '../types';

const API_ENDPOINTS = [
  '/api',
  'http://127.0.0.1:8000/api',
  'http://localhost:8000/api'
];

async function fetchWithFallback(path: string, options: RequestInit): Promise<Response> {
  let lastError: any = null;
  for (const base of API_ENDPOINTS) {
    try {
      const url = `${base}${path}`;
      const res = await fetch(url, options);
      if (res.ok) {
        return res;
      }
      // If server returned 4xx/5xx, return response so caller handles status
      if (res.status >= 400 && res.status < 500) {
        return res;
      }
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || new Error(`Failed to reach MediKiosk backend API across all endpoints.`);
}

export class ApiService {
  static async startSession(language: Language = 'english'): Promise<ChatResponse> {
    const res = await fetchWithFallback('/session/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language })
    });
    if (!res.ok) {
      throw new Error(`Failed to start session: ${res.statusText}`);
    }
    return res.json();
  }

  static async sendMessage(
    sessionId: string,
    message?: string,
    selectedOption?: string,
    language?: Language,
    audioBase64?: string
  ): Promise<ChatResponse> {
    const res = await fetchWithFallback('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        message: message || '',
        selected_option: selectedOption || null,
        language: language || null,
        audio_base64: audioBase64 || null
      })
    });
    if (!res.ok) {
      throw new Error(`Chat error: ${res.statusText}`);
    }
    return res.json();
  }

  static async getDoctorSummary(sessionId: string): Promise<DoctorSummary> {
    const res = await fetchWithFallback(`/session/${sessionId}/summary`, {
      method: 'GET'
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch summary: ${res.statusText}`);
    }
    return res.json();
  }

  static async editClinicalField(sessionId: string, fieldName: string, newValue: any): Promise<any> {
    const res = await fetchWithFallback(`/session/${sessionId}/edit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        field_name: fieldName,
        new_value: newValue
      })
    });
    if (!res.ok) {
      throw new Error(`Failed to edit field: ${res.statusText}`);
    }
    return res.json();
  }

  static async triggerEmergency(sessionId: string, reason: string): Promise<any> {
    const res = await fetchWithFallback('/emergency/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        hospital_unit: 'Emergency Triage & Resuscitation',
        reason
      })
    });
    if (!res.ok) {
      throw new Error(`Emergency trigger error: ${res.statusText}`);
    }
    return res.json();
  }

  static async injectOCRDocument(sessionId: string, docType: string, extractedText: string): Promise<any> {
    const res = await fetchWithFallback('/ocr/inject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        document_type: docType,
        extracted_text: extractedText
      })
    });
    if (!res.ok) {
      throw new Error(`OCR inject error: ${res.statusText}`);
    }
    return res.json();
  }

  static async synthesizeSpeech(text: string, language: string = 'hindi'): Promise<string | null> {
    try {
      const res = await fetchWithFallback('/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.audio_base64) {
          return data.audio_base64;
        }
      }
    } catch (e) {
      console.warn("Bhashini TTS notice:", e);
    }
    return null;
  }
}
