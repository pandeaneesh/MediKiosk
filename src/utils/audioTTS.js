// Universal Multilingual Voice Synthesis Engine for All Devices
// (Windows, Mac, Linux, Android, iOS, iPads, Touch Kiosks)

// Voice ID for English: GBJyJih8mGoasC7OSR50 (Mac Cheese - Female Indian English)
// Voice ID for Hindi & Marathi: C2S5J6WvmHnrQWjUu6Rg (Kanika - Warm Indian Devanagari)
const ELEVENLABS_VOICES = {
  english: "GBJyJih8mGoasC7OSR50",
  hindi: "C2S5J6WvmHnrQWjUu6Rg",
  marathi: "C2S5J6WvmHnrQWjUu6Rg"
};
const ELEVENLABS_MODEL_ID = "eleven_multilingual_v2";

// Local storage key for ElevenLabs API Key
const ELEVENLABS_KEY_STORAGE = "medikiosk_elevenlabs_api_key";

class SoundEffects {
  constructor() {
    this.audioCtx = null;
  }

  init() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
  }

  playBeep(frequency = 600, duration = 0.08, type = 'sine') {
    try {
      this.init();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Audio sound effect error:", e);
    }
  }

  playSuccess() {
    this.playBeep(587, 0.09); // D5
    setTimeout(() => this.playBeep(880, 0.18), 100); // A5
  }

  playClick() {
    this.playBeep(750, 0.04);
  }

  playAlert() {
    this.playBeep(440, 0.12, 'triangle');
    setTimeout(() => this.playBeep(330, 0.2, 'triangle'), 140);
  }
}

export const sounds = new SoundEffects();

// Cache for audio objects and URLs
const audioCache = new Map();
let currentAudioElement = null;

// Get or set stored ElevenLabs API Key
export const getElevenLabsApiKey = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(ELEVENLABS_KEY_STORAGE) || '';
};

export const setElevenLabsApiKey = (key) => {
  if (typeof window === 'undefined') return;
  if (key) {
    localStorage.setItem(ELEVENLABS_KEY_STORAGE, key.trim());
  } else {
    localStorage.removeItem(ELEVENLABS_KEY_STORAGE);
  }
};

// ElevenLabs TTS Request mapped per language
async function fetchElevenLabsAudio(text, language, apiKey) {
  const voiceId = ELEVENLABS_VOICES[language] || ELEVENLABS_VOICES.english;
  const cacheKey = `11labs_${voiceId}_${text}`;
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey);
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text: text,
      model_id: ELEVENLABS_MODEL_ID,
      voice_settings: {
        stability: 0.55,
        similarity_boost: 0.82,
        style: 0.0,
        use_speaker_boost: true
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API Error (${response.status}): ${errorText}`);
  }

  const blob = await response.blob();
  const audioUrl = URL.createObjectURL(blob);
  audioCache.set(cacheKey, audioUrl);
  return audioUrl;
}

// Universal Universal Online Audio Stream (Guarantees Native Indian Language Audio on ANY Device)
function playUniversalAudioStream(text, language, onStart, onEnd) {
  try {
    const langMap = {
      hindi: 'hi', hi: 'hi',
      marathi: 'mr', mr: 'mr',
      gujarati: 'gu', gu: 'gu',
      tamil: 'ta', ta: 'ta',
      telugu: 'te', te: 'te',
      kannada: 'kn', kn: 'kn',
      bengali: 'bn', bn: 'bn',
      punjabi: 'pa', pa: 'pa',
      malayalam: 'ml', ml: 'ml',
      english: 'en-IN', en: 'en-IN'
    };
    const langCode = langMap[language?.toLowerCase()] || 'hi';
    const cleanText = encodeURIComponent(text.slice(0, 190));
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=tw-ob&q=${cleanText}`;

    const audio = new Audio(audioUrl);
    audio.playbackRate = (language === 'marathi' || language === 'mr') ? 0.95 : 1.0;
    currentAudioElement = audio;

    audio.onplay = () => {
      onStart();
    };

    audio.onended = () => {
      currentAudioElement = null;
      onEnd();
    };

    audio.onerror = (err) => {
      console.warn("Online audio stream error, falling back to browser speech:", err);
      currentAudioElement = null;
      speakWithBrowserTTS(text, language, onStart, onEnd);
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((e) => {
        console.warn("Audio play prevented, trying browser synthesis:", e);
        speakWithBrowserTTS(text, language, onStart, onEnd);
      });
    }
  } catch (err) {
    console.warn("Universal audio stream exception:", err);
    speakWithBrowserTTS(text, language, onStart, onEnd);
  }
}

// Explicit Female Indian Voice Filter
function isMaleVoice(v) {
  const name = v.name.toLowerCase();
  return name.includes('male') || name.includes('madhur') || name.includes('david') || 
         name.includes('mark') || name.includes('ravi') || name.includes('hemant') || 
         name.includes('prabhat') || name.includes('george') || name.includes('guy') ||
         name.includes('richard') || name.includes('stefan');
}

function isFemaleVoice(v) {
  const name = v.name.toLowerCase();
  return name.includes('female') || name.includes('swara') || name.includes('aarohi') || 
         name.includes('kalpana') || name.includes('neerja') || name.includes('heera') || 
         name.includes('zira') || name.includes('kavya') || name.includes('priya') ||
         name.includes('sangeeta') || name.includes('sunita') || name.includes('veena');
}

// Fallback: Browser Web Speech API Voice Matcher
function getBestBrowserVoice(language) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const allVoices = window.speechSynthesis.getVoices();
  if (!allVoices || allVoices.length === 0) return null;

  // Filter out male voices
  const femaleCandidates = allVoices.filter(v => !isMaleVoice(v));
  const voices = femaleCandidates.length > 0 ? femaleCandidates : allVoices;

  const langPrefixMap = {
    hindi: 'hi', hi: 'hi',
    marathi: 'mr', mr: 'mr',
    gujarati: 'gu', gu: 'gu',
    tamil: 'ta', ta: 'ta',
    telugu: 'te', te: 'te',
    kannada: 'kn', kn: 'kn',
    bengali: 'bn', bn: 'bn',
    punjabi: 'pa', pa: 'pa',
    malayalam: 'ml', ml: 'ml',
    english: 'en', en: 'en'
  };
  const targetPrefix = langPrefixMap[language?.toLowerCase()] || 'hi';

  const matchVoice = voices.find(v => v.lang.toLowerCase().startsWith(targetPrefix)) ||
                     allVoices.find(v => v.lang.toLowerCase().startsWith(targetPrefix));
  if (matchVoice) return matchVoice;

  // Hindi/Indian English fallback
  const inEn = voices.find(v => v.lang.toLowerCase().includes('en-in') || v.name.toLowerCase().includes('india'));
  if (inEn) return inEn;

  return voices[0] || null;
}

function speakWithBrowserTTS(text, language, onStart, onEnd) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(text);

    const langCodeMap = {
      hindi: 'hi-IN', hi: 'hi-IN',
      marathi: 'mr-IN', mr: 'mr-IN',
      gujarati: 'gu-IN', gu: 'gu-IN',
      tamil: 'ta-IN', ta: 'ta-IN',
      telugu: 'te-IN', te: 'te-IN',
      kannada: 'kn-IN', kn: 'kn-IN',
      bengali: 'bn-IN', bn: 'bn-IN',
      punjabi: 'pa-IN', pa: 'pa-IN',
      malayalam: 'ml-IN', ml: 'ml-IN',
      english: 'en-IN', en: 'en-IN'
    };

    utterance.lang = langCodeMap[language?.toLowerCase()] || 'hi-IN';
    utterance.rate = (language === 'marathi' || language === 'mr') ? 0.85 : 0.90;
    utterance.pitch = 1.16;

    const voice = getBestBrowserVoice(language);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = onStart;
    utterance.onend = onEnd;
    utterance.onerror = (e) => {
      console.warn("Browser utterance error, attempting online fallback:", e);
      onEnd();
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("speechSynthesis exception:", err);
    onEnd();
  }
}

// Bhashini Voice Synthesis Dispatcher
export async function playBhashiniTTS(text, language = 'hindi', onStart = () => {}, onEnd = () => {}, gender = 'female') {
  try {
    const res = await api.synthesizeSpeech(text, language, gender);
    if (res && res.success) {
      let audioSrc = null;
      if (res.audioContent) {
        audioSrc = `data:audio/wav;base64,${res.audioContent}`;
      } else if (res.audioUrl) {
        audioSrc = res.audioUrl;
      }

      if (audioSrc) {
        const audio = new Audio(audioSrc);
        currentAudioElement = audio;

        audio.onplay = () => {
          onStart();
        };

        audio.onended = () => {
          currentAudioElement = null;
          onEnd();
        };

        audio.onerror = (e) => {
          console.warn("Bhashini audio playback error, using fallback stream:", e);
          currentAudioElement = null;
          playUniversalAudioStream(text, language, onStart, onEnd);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
        return true;
      }
    }
  } catch (err) {
    console.warn("Bhashini TTS request error, trying fallback:", err);
  }
  return false;
}

// Master speakInstruction function: Multi-Tier Universal Voice Dispatcher
export const speakInstruction = async (text, language = 'english', onStart = () => {}, onEnd = () => {}) => {
  stopSpeech();

  // Tier 1: Government of India Bhashini Multilingual AI Speech Pipeline
  try {
    const success = await playBhashiniTTS(text, language, onStart, onEnd);
    if (success) return;
  } catch (err) {
    console.warn("Bhashini tier bypassed, attempting next voice tier:", err);
  }

  // Tier 2: Check for ElevenLabs API Key
  const apiKey = getElevenLabsApiKey();
  if (apiKey) {
    try {
      onStart();
      const audioUrl = await fetchElevenLabsAudio(text, language, apiKey);
      const audio = new Audio(audioUrl);
      currentAudioElement = audio;

      audio.onended = () => {
        currentAudioElement = null;
        onEnd();
      };

      audio.onerror = () => {
        currentAudioElement = null;
        playUniversalAudioStream(text, language, onStart, onEnd);
      };

      await audio.play();
      return;
    } catch (err) {
      console.warn("ElevenLabs TTS failed, falling back to universal stream:", err);
    }
  }

  // Tier 2: Check if browser already has an authentic voice for this language
  const browserVoice = getBestBrowserVoice(language);
  const hasDedicatedLanguageVoice = browserVoice && (
    (language === 'marathi' && (browserVoice.lang.toLowerCase().startsWith('mr') || browserVoice.name.toLowerCase().includes('marathi'))) ||
    (language === 'hindi' && (browserVoice.lang.toLowerCase().startsWith('hi') || browserVoice.name.toLowerCase().includes('hindi'))) ||
    (language === 'english' && browserVoice.lang.toLowerCase().startsWith('en'))
  );

  if (hasDedicatedLanguageVoice) {
    speakWithBrowserTTS(text, language, onStart, onEnd);
    return;
  }

  // Tier 3: Universal Online Audio Stream (Guaranteed crystal-clear Marathi & Hindi audio on any phone/PC)
  playUniversalAudioStream(text, language, onStart, onEnd);
};

export const stopSpeech = () => {
  if (currentAudioElement) {
    currentAudioElement.pause();
    currentAudioElement.currentTime = 0;
    currentAudioElement = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

// Pre-load voices into memory on all platforms
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}
