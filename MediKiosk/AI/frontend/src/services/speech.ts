import type { Language } from '../types';
import { ApiService } from './api';

// Browser Locale Mappings for Pan-Indian Languages
const LOCALE_MAP: Record<Language, string[]> = {
  english: ['en-IN', 'en-US', 'en-GB'],
  hindi: ['hi-IN', 'hi'],
  marathi: ['mr-IN', 'mr', 'hi-IN'],
  gujarati: ['gu-IN', 'gu', 'hi-IN'],
  tamil: ['ta-IN', 'ta'],
  telugu: ['te-IN', 'te'],
  kannada: ['kn-IN', 'kn'],
  malayalam: ['ml-IN', 'ml'],
  bengali: ['bn-IN', 'bn-BD', 'bn'],
  punjabi: ['pa-IN', 'pa'],
  odia: ['or-IN', 'or'],
  assamese: ['as-IN', 'as', 'bn-IN'],
  urdu: ['ur-IN', 'ur', 'hi-IN']
};

export class SpeechService {
  private activeRecognition: any = null;
  private isDesiredActive = false;
  private isListening = false;
  private isSpeaking = false;
  private currentLanguage: Language = 'english';
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private activeAudioElement: HTMLAudioElement | null = null;
  private speechSequenceToken = 0;

  // Audio level meter
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private animFrameId: number | null = null;

  constructor() {
    this.initVoices();
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        this.cachedVoices = v;
      }
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  getBestVoiceForLanguage(lang: Language): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = this.cachedVoices.length > 0 ? this.cachedVoices : window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const candidateLocales = LOCALE_MAP[lang] || ['en-IN', 'en-US'];
    const primaryPrefix = candidateLocales[0].split('-')[0].toLowerCase();

    // 1. Direct language code match (e.g. 'hi-IN', 'ta-IN', 'te-IN', etc.)
    const exactLanguageVoices = voices.filter(v => {
      const vLang = v.lang.replace('_', '-').toLowerCase();
      return vLang.startsWith(primaryPrefix);
    });

    if (exactLanguageVoices.length > 0) {
      const naturalVoice = exactLanguageVoices.find(v =>
        v.name.includes('Natural') ||
        v.name.includes('Online') ||
        v.name.includes('Google') ||
        v.name.includes('India') ||
        v.name.includes('हिन्दी')
      );
      return naturalVoice || exactLanguageVoices[0];
    }

    // 2. Name-based match for Indian language in Edge / Windows / Chrome
    const nameMatch = voices.find(v => {
      const n = v.name.toLowerCase();
      if (lang === 'hindi' && (n.includes('hindi') || n.includes('हिन्दी') || n.includes('swara') || n.includes('madhur') || n.includes('kalpana') || n.includes('hemant'))) return true;
      if (lang === 'marathi' && (n.includes('marathi') || n.includes('मराठी') || n.includes('aarohi') || n.includes('manohar'))) return true;
      if (lang === 'gujarati' && (n.includes('gujarati') || n.includes('ગુજરાતી') || n.includes('dhwani') || n.includes('niranjan'))) return true;
      if (lang === 'tamil' && (n.includes('tamil') || n.includes('தமிழ்') || n.includes('pallavi') || n.includes('valluvar'))) return true;
      if (lang === 'telugu' && (n.includes('telugu') || n.includes('తెలుగు') || n.includes('mohan') || n.includes('chitra'))) return true;
      if (lang === 'kannada' && (n.includes('kannada') || n.includes('ಕನ್ನಡ') || n.includes('gagan') || n.includes('sapna'))) return true;
      if (lang === 'malayalam' && (n.includes('malayalam') || n.includes('മലയാളം') || n.includes('midhun') || n.includes('sobhana'))) return true;
      if (lang === 'bengali' && (n.includes('bengali') || n.includes('bangla') || n.includes('বাংলা') || n.includes('tanishaa') || n.includes('bashkar'))) return true;
      if (lang === 'punjabi' && (n.includes('punjabi') || n.includes('ਪੰਜਾਬੀ') || n.includes('harmohan') || n.includes('raavi'))) return true;
      if (lang === 'odia' && (n.includes('odia') || n.includes('oriya') || n.includes('ଓଡ଼ିଆ'))) return true;
      if (lang === 'assamese' && (n.includes('assamese') || n.includes('অসমীয়া') || n.includes('bengali'))) return true;
      if (lang === 'urdu' && (n.includes('urdu') || n.includes('اردو') || n.includes('salman') || n.includes('gul'))) return true;
      return false;
    });
    if (nameMatch) return nameMatch;

    // 3. Indic sibling phonetic fallback for regional languages without dedicated desktop voice packs
    if (['marathi', 'gujarati', 'punjabi', 'odia', 'assamese', 'urdu'].includes(lang)) {
      const hindiVoice = voices.find(v => {
        const vLang = v.lang.replace('_', '-').toLowerCase();
        const vName = v.name.toLowerCase();
        return vLang.startsWith('hi') || vName.includes('hindi') || vName.includes('हिन्दी') || vName.includes('swara');
      });
      if (hindiVoice) return hindiVoice;
    }

    // 4. Dravidian sibling fallback (Kannada/Malayalam to Telugu/Tamil if missing)
    if (lang === 'kannada' || lang === 'malayalam') {
      const dravidianVoice = voices.find(v => {
        const vLang = v.lang.replace('_', '-').toLowerCase();
        return vLang.startsWith('ta') || vLang.startsWith('te') || vLang.startsWith('hi');
      });
      if (dravidianVoice) return dravidianVoice;
    }

    // 5. English fallback ONLY when English is explicitly requested
    if (lang === 'english') {
      const enMatch = voices.find(v => v.lang.replace('_', '-').toLowerCase().startsWith('en-in')) ||
        voices.find(v => v.lang.replace('_', '-').toLowerCase().startsWith('en'));
      if (enMatch) return enMatch;
    }

    return null;
  }

  /**
   * Format text specifically for crisp text-to-speech pronunciation,
   * especially for Dashavidha Pariksha numbers, Sanskrit terms, and clinical options.
   */
  formatForSpeech(text: string, lang: Language): string {
    let spoken = text;

    if (lang === 'english') {
      spoken = spoken
        .replace(/1\.\s*Prakriti\s*\([^)]*\):?/gi, 'Number 1, Prakriti, Body Constitution: ')
        .replace(/2\.\s*Vikriti\s*\([^)]*\):?/gi, 'Number 2, Vikriti, Recent Imbalance: ')
        .replace(/3\.\s*Ahara Shakti\s*\([^)]*\):?/gi, 'Number 3, Ahara Shakti, Digestive Fire: ')
        .replace(/4\.\s*Satmya\s*\([^)]*\):?/gi, 'Number 4, Satmya, Dietary Habituation: ')
        .replace(/5\.\s*Sattva\s*\([^)]*\):?/gi, 'Number 5, Sattva, Mental Resilience: ')
        .replace(/6\.\s*Vyayama Shakti\s*\([^)]*\):?/gi, 'Number 6, Vyayama Shakti, Physical Endurance: ')
        .replace(/7\.\s*Sara\s*\([^)]*\):?/gi, 'Number 7, Sara, Tissue Vitality: ')
        .replace(/8\.\s*Samhanana\s*\([^)]*\):?/gi, 'Number 8, Samhanana, Frame Compactness: ')
        .replace(/9\.\s*Vaya\s*\([^)]*\):?/gi, 'Number 9, Vaya, Life Stage: ')
        .replace(/Ahara Shakti\s*\(Jarana Shakti\):?/gi, 'Ahara Shakti, Post-meal Digestion: ')
        .replace(/Prakriti Thermal Sensitivity:?/gi, 'Prakriti, Thermal Sensitivity: ');

      spoken = spoken.replace(/\([^\w\s-]+\)/g, '');
    } else if (lang === 'hindi') {
      spoken = spoken
        .replace(/१\.\s*प्रकृति\s*\([^)]*\):?/gi, 'पहला, प्रकृति, शारीरिक गठन: ')
        .replace(/२\.\s*विकृति\s*\([^)]*\):?/gi, 'दूसरा, विकृति, दोष असंतुलन: ')
        .replace(/३\.\s*आहार शक्ति\s*\([^)]*\):?/gi, 'तीसरा, आहार शक्ति, अग्नि और भूख: ')
        .replace(/४\.\s*सात्म्य\s*\([^)]*\):?/gi, 'चौथा, सात्म्य, आहार अनुकूलता: ')
        .replace(/५\.\s*सत्त्व\s*\([^)]*\):?/gi, 'पांचवां, सत्त्व, मानसिक बल: ')
        .replace(/६\.\s*व्यायाम शक्ति\s*\([^)]*\):?/gi, 'छठा, व्यायाम शक्ति, शारीरिक श्रम क्षमता: ')
        .replace(/७\.\s*सार\s*\([^)]*\):?/gi, 'सातवां, सार, धातु सारता और बल: ')
        .replace(/८\.\s*संहनन\s*\([^)]*\):?/gi, 'आठवां, संहनन, शारीरिक सुदृढ़ता: ')
        .replace(/९\.\s*वय\s*\([^)]*\):?/gi, 'नौवां, वय, आयु वर्ग: ');
    } else if (lang === 'marathi') {
      spoken = spoken
        .replace(/१\.\s*प्रकृति\s*\([^)]*\):?/gi, 'पहिले, प्रकृति, शारीरिक ठेवण: ')
        .replace(/२\.\s*विकृति:?/gi, 'दुसरे, विकृति, दोष बदल: ')
        .replace(/३\.\s*आहार शक्ति:?/gi, 'तिसरे, आहार शक्ति, भूक व पचन: ')
        .replace(/४\.\s*सात्म्य:?/gi, 'चौथे, सात्म्य, अनुकूल आहार: ')
        .replace(/५\.\s*सत्त्व\s*\([^)]*\):?/gi, 'पाचवे, सत्त्व, मानसिक बळ: ')
        .replace(/६\.\s*व्यायाम शक्ति:?/gi, 'सहावे, व्यायाम शक्ति, श्रम क्षमता: ')
        .replace(/७\.\s*सार\s*\([^)]*\):?/gi, 'सातवे, सार, एकूण ताकद: ')
        .replace(/८\.\s*संहनन:?/gi, 'आठवे, संहनन, हाडांची रचना: ')
        .replace(/९\.\s*वय\s*\([^)]*\):?/gi, 'नववे, वय, वयाचा टप्पा: ');
    } else if (lang === 'gujarati') {
      spoken = spoken
        .replace(/૧\.\s*પ્રકૃતિ\s*\([^)]*\):?/gi, 'પહેલું, પ્રકૃતિ: ')
        .replace(/૨\.\s*વિકૃતિ:?/gi, 'બીજું, વિકૃતિ: ')
        .replace(/૩\.\s*આહાર શક્તિ:?/gi, 'ત્રીજું, આહાર શક્તિ: ');
    } else if (lang === 'tamil') {
      spoken = spoken
        .replace(/1\.\s*பிரகிருதி:?/gi, 'ஒன்று, பிரகிருதி: ')
        .replace(/2\.\s*விக்ருதி:?/gi, 'இரண்டு, விக்ருதி: ');
    } else if (lang === 'telugu') {
      spoken = spoken
        .replace(/1\.\s*ప్రకృతి:?/gi, 'ఒకటి, ప్రకృతి: ')
        .replace(/2\.\s*వికృతి:?/gi, 'రెండు, వికృతి: ');
    } else if (lang === 'kannada') {
      spoken = spoken
        .replace(/೧\.\s*ಪ್ರಕೃತಿ:?/gi, 'ಒಂದು, ಪ್ರಕೃತಿ: ')
        .replace(/೨\.\s*ವಿಕೃತಿ:?/gi, 'ಎರಡು, ವಿಕೃತಿ: ');
    } else if (lang === 'malayalam') {
      spoken = spoken
        .replace(/1\.\s*പ്രകൃതി:?/gi, 'ഒന്ന്, പ്രകൃതി: ')
        .replace(/2\.\s*വികൃതി:?/gi, 'രണ്ട്, വികൃതി: ');
    } else if (lang === 'bengali') {
      spoken = spoken
        .replace(/১\.\s*প্রকৃতি:?/gi, 'প্রথম, প্রকৃতি: ')
        .replace(/২\.\s*বিকৃতি:?/gi, 'দ্বিতীয়, বিকৃতি: ');
    } else if (lang === 'punjabi') {
      spoken = spoken
        .replace(/1\.\s*ਪ੍ਰਕ੍ਰਿਤੀ:?/gi, 'ਪਹਿਲਾ, ਪ੍ਰਕ੍ਰਿਤੀ: ')
        .replace(/2\.\s*ਵਿਕ੍ਰਿਤੀ:?/gi, 'ਦੂਜਾ, ਵਿਕ੍ਰਿਤੀ: ');
    }

    // Clean emojis, markdown symbols, and formatting noise
    spoken = spoken
      .replace(/[*_#⚠️📄✓✕✎🩺🌿❤️🔥🦴🌡️🧠•]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return spoken;
  }

  /**
   * Start microphone audio visualizer to track live sound volume (0-100)
   */
  private startAudioLevelMeter(onLevelChange?: (level: number) => void) {
    if (typeof window === 'undefined' || !onLevelChange) return;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        this.micStream = stream;
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (!AudioContextClass) return;

          this.audioContext = new AudioContextClass();
          this.analyser = this.audioContext.createAnalyser();
          this.analyser.fftSize = 64;

          const source = this.audioContext.createMediaStreamSource(stream);
          source.connect(this.analyser);

          const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

          const updateMeter = () => {
            if (!this.isListening || !this.analyser) {
              onLevelChange(0);
              return;
            }
            this.analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            const normalizedLevel = Math.min(100, Math.round((average / 128) * 100));
            onLevelChange(normalizedLevel);

            if (this.isDesiredActive) {
              this.animFrameId = requestAnimationFrame(updateMeter);
            }
          };

          updateMeter();
        } catch (e) {
          console.warn("Audio meter setup notice:", e);
        }
      }).catch((e) => {
        console.warn("Mic stream notice for audio meter:", e);
      });
    }
  }

  private stopAudioLevelMeter() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }
    this.analyser = null;
  }

  /**
   * Start fresh speech recognition session with per-turn transcript reconstruction.
   */
  startListening(
    lang: Language,
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (err: string) => void,
    onEnd?: () => void,
    onAudioLevel?: (level: number) => void
  ) {
    if (typeof window === 'undefined') {
      if (onError) onError("Browser window is not available.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (onError) onError("Speech recognition is not natively supported in this browser. Please use Chrome or Edge.");
      return;
    }

    // Teardown prior session completely
    this.stopListening();

    this.currentLanguage = lang;
    this.isDesiredActive = true;

    // Start live audio meter for real-time visual feedback
    this.startAudioLevelMeter(onAudioLevel);

    const initRecognitionSession = () => {
      if (!this.isDesiredActive) return;

      if (this.activeRecognition) {
        try {
          this.activeRecognition.onend = null;
          this.activeRecognition.onerror = null;
          this.activeRecognition.onresult = null;
          this.activeRecognition.abort();
        } catch (e) {}
        this.activeRecognition = null;
      }

      try {
        const recognition = new SpeechRecognition();
        this.activeRecognition = recognition;

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        const candidateLocales = LOCALE_MAP[this.currentLanguage] || ['en-IN', 'en-US'];
        recognition.lang = candidateLocales[0] || 'en-IN';

        recognition.onstart = () => {
          this.isListening = true;
        };

        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = 0; i < event.results.length; ++i) {
            const res = event.results[i];
            if (res.isFinal) {
              finalTranscript += res[0].transcript + ' ';
            } else {
              interimTranscript += res[0].transcript;
            }
          }

          const liveFullText = (finalTranscript + interimTranscript).replace(/\s+/g, ' ').trim();
          if (liveFullText) {
            onResult(liveFullText, !!finalTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          const errType = event.error;
          console.warn("Speech recognition event notice:", errType);

          if (errType === 'no-speech') {
            // Patient paused naturally - keep desired state active
            return;
          }

          if (errType === 'not-allowed' || errType === 'service-not-allowed') {
            this.isDesiredActive = false;
            this.isListening = false;
            this.stopAudioLevelMeter();
            if (onError) onError("Microphone access is blocked. Please click the padlock icon in your browser address bar and allow Microphone.");
            return;
          }

          if (errType === 'audio-capture') {
            if (onError) onError("No microphone audio detected. Please check that your microphone is plugged in and unmuted.");
            return;
          }

          if (onError) {
            onError(`Speech status: ${errType}. Speaking again or typing will work.`);
          }
        };

        recognition.onend = () => {
          if (this.isDesiredActive) {
            setTimeout(() => {
              if (this.isDesiredActive) {
                initRecognitionSession();
              }
            }, 150);
          } else {
            this.isListening = false;
            this.stopAudioLevelMeter();
            if (onEnd) onEnd();
          }
        };

        recognition.start();
        this.isListening = true;
      } catch (e: any) {
        console.warn("SpeechRecognition start exception:", e);
        if (this.isDesiredActive) {
          setTimeout(() => {
            if (this.isDesiredActive) {
              try {
                this.activeRecognition?.start();
              } catch (err) {}
            }
          }, 250);
        }
      }
    };

    initRecognitionSession();
  }

  stopListening() {
    this.isDesiredActive = false;
    this.isListening = false;
    this.stopAudioLevelMeter();

    if (this.activeRecognition) {
      try {
        this.activeRecognition.onend = null;
        this.activeRecognition.onerror = null;
        this.activeRecognition.onresult = null;
        this.activeRecognition.abort();
      } catch (e) {}
      this.activeRecognition = null;
    }
  }

  /**
   * Speak text: First attempts Bhashini Indian voice synthesis via backend,
   * seamlessly falling back to browser SpeechSynthesis if unconfigured.
   * Guarantees strictly ONE single voice stream at any time.
   */
  async speak(
    text: string,
    lang: Language,
    onStart?: () => void,
    onEnd?: () => void
  ) {
    this.cancelSpeech();
    const token = ++this.speechSequenceToken;

    const cleanText = this.formatForSpeech(text, lang);
    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    // 1. Try Bhashini Server-Side Voice Synthesis
    try {
      const bhashiniAudioBase64 = await ApiService.synthesizeSpeech(cleanText, lang);

      // Check if a newer speech request or cancelSpeech occurred while fetching
      if (token !== this.speechSequenceToken) {
        return;
      }

      if (bhashiniAudioBase64) {
        // Ensure browser synthesis is completely canceled
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }

        const audio = new Audio(`data:audio/wav;base64,${bhashiniAudioBase64}`);
        this.activeAudioElement = audio;

        audio.onplay = () => {
          if (token !== this.speechSequenceToken) {
            audio.pause();
            return;
          }
          this.isSpeaking = true;
          if (onStart) onStart();
        };

        audio.onended = () => {
          if (token === this.speechSequenceToken) {
            this.isSpeaking = false;
            this.activeAudioElement = null;
            if (onEnd) onEnd();
          }
        };

        audio.onerror = () => {
          if (token === this.speechSequenceToken) {
            this.isSpeaking = false;
            this.activeAudioElement = null;
            // Fallback to browser TTS on audio element error
            this.speakWithBrowserTTS(cleanText, lang, onStart, onEnd, token);
          }
        };

        await audio.play();
        return;
      }
    } catch (e) {
      console.warn("Bhashini playback notice, falling back to browser synthesis:", e);
    }

    if (token !== this.speechSequenceToken) {
      return;
    }

    // 2. Fallback to Browser Web Speech API
    this.speakWithBrowserTTS(cleanText, lang, onStart, onEnd, token);
  }

  private speakWithBrowserTTS(
    cleanText: string,
    lang: Language,
    onStart?: () => void,
    onEnd?: () => void,
    token?: number
  ) {
    if (token !== undefined && token !== this.speechSequenceToken) {
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const candidateLocales = LOCALE_MAP[lang] || ['en-IN', 'en-US'];
    utterance.lang = candidateLocales[0] || 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voice = this.getBestVoiceForLanguage(lang);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }

    utterance.onstart = () => {
      if (token !== undefined && token !== this.speechSequenceToken) {
        window.speechSynthesis.cancel();
        return;
      }
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (token === undefined || token === this.speechSequenceToken) {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      }
    };

    utterance.onerror = (e) => {
      if (token === undefined || token === this.speechSequenceToken) {
        this.isSpeaking = false;
        console.warn("Speech synthesis notice:", e);
        if (onEnd) onEnd();
      }
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      this.isSpeaking = false;
      console.warn("Speech synthesis speak exception:", e);
      if (onEnd) onEnd();
    }
  }

  cancelSpeech() {
    this.speechSequenceToken++;

    if (this.activeAudioElement) {
      try {
        this.activeAudioElement.onplay = null;
        this.activeAudioElement.onended = null;
        this.activeAudioElement.onerror = null;
        this.activeAudioElement.pause();
        this.activeAudioElement.src = '';
      } catch (e) {}
      this.activeAudioElement = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
  }
}

export const speechService = new SpeechService();
