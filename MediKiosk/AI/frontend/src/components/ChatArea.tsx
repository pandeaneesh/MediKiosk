import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send, Mic, MicOff, Volume2, VolumeX, Bot, User,
  Sparkles, AlertCircle, RotateCcw, Radio, RefreshCw
} from 'lucide-react';
import type { ChatMessage, QuickOption, Language } from '../types';
import { speechService } from '../services/speech';

interface ChatAreaProps {
  messages: ChatMessage[];
  language: Language;
  onSendMessage: (text: string, selectedOption?: string) => void;
  isLoading: boolean;
  onResetSession: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  language,
  onSendMessage,
  isLoading,
  onResetSession
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isAutoVoiceMode, setIsAutoVoiceMode] = useState(true);
  const [selectedMultiOptions, setSelectedMultiOptions] = useState<string[]>([]);
  const [severityValue, setSeverityValue] = useState<number>(5);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isAutoVoiceModeRef = useRef(isAutoVoiceMode);
  const languageRef = useRef(language);
  const speechTranscriptRef = useRef(speechTranscript);
  const lastSpokenMessageIdRef = useRef<string | null>(null);
  const silenceTimerRef = useRef<any>(null);
  const isSubmittingSpeechRef = useRef(false);

  isAutoVoiceModeRef.current = isAutoVoiceMode;
  languageRef.current = language;
  speechTranscriptRef.current = speechTranscript;

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isListening, speechTranscript]);

  const stopListeningSession = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    speechService.stopListening();
    setIsListening(false);
    setAudioLevel(0);
  }, []);

  // Automatic submission when patient finishes speaking
  const autoSubmitSpokenAnswer = useCallback((transcriptText: string) => {
    const textToSend = transcriptText.trim();
    if (!textToSend || isLoading || isSubmittingSpeechRef.current) return;

    isSubmittingSpeechRef.current = true;
    stopListeningSession();
    speechService.cancelSpeech();
    setInputText('');
    setSpeechTranscript('');

    onSendMessage(textToSend);

    setTimeout(() => {
      isSubmittingSpeechRef.current = false;
    }, 500);
  }, [isLoading, onSendMessage, stopListeningSession]);

  // Handle Voice Input start
  const startListeningSession = useCallback(() => {
    if (isSubmittingSpeechRef.current || isLoading) return;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    speechService.cancelSpeech();
    setSpeechError(null);
    setSpeechTranscript('');
    setInputText('');
    setIsListening(true);

    const activeLang = (messages.length > 0 && (messages[messages.length - 1]?.language as Language)) || languageRef.current || 'english';

    speechService.startListening(
      activeLang,
      (transcript, isFinal) => {
        const cleaned = transcript.trim();
        setSpeechTranscript(cleaned);
        setInputText(cleaned); // Keep input box in sync in real time

        if (!cleaned || isSubmittingSpeechRef.current) return;

        // Reset silence debounce timer on every spoken syllable
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // Auto-submit after natural completion pause (750ms if isFinal, 1100ms for interim)
        const silenceDelay = isFinal ? 750 : 1100;
        silenceTimerRef.current = setTimeout(() => {
          autoSubmitSpokenAnswer(cleaned);
        }, silenceDelay);
      },
      (error) => {
        console.warn("Speech recognition notice:", error);
        setSpeechError(error);
        setIsListening(false);
        setAudioLevel(0);
      },
      () => {
        setIsListening(false);
        setAudioLevel(0);
      },
      (level) => {
        setAudioLevel(level);
      }
    );
  }, [messages, isLoading, autoSubmitSpokenAnswer]);

  // Read latest AI message aloud exactly once and seamlessly trigger voice listening with zero latency
  useEffect(() => {
    if (messages.length > 0 && isAudioEnabled) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'ai') {
        // Prevent re-speaking the same message on re-renders (e.g. isLoading or language state changes)
        if (lastSpokenMessageIdRef.current === lastMsg.id) {
          return;
        }
        lastSpokenMessageIdRef.current = lastMsg.id;

        // Immediate mic shutdown while AI speaks so mic never hears AI audio
        stopListeningSession();

        const msgLang = (lastMsg.language as Language) || language;
        speechService.speak(
          lastMsg.content,
          msgLang,
          () => {
            // Speech started
          },
          () => {
            // Speech ended -> Auto-listen immediately (50ms buffer to release audio track)
            if (isAutoVoiceModeRef.current && !isLoading && !isSubmittingSpeechRef.current) {
              setTimeout(() => {
                if (isAutoVoiceModeRef.current && !speechService.isCurrentlySpeaking()) {
                  startListeningSession();
                }
              }, 50);
            }
          }
        );
      }
    }
  }, [messages, language, isAudioEnabled, isLoading, startListeningSession, stopListeningSession]);

  // Handle Text Submission
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    const textToSend = (inputText || speechTranscript).trim();
    if (!textToSend || isLoading) return;
    stopListeningSession();
    speechService.cancelSpeech();
    setInputText('');
    setSpeechTranscript('');
    onSendMessage(textToSend);
  };

  // Handle Quick Option Click
  const handleOptionClick = (opt: QuickOption) => {
    if (isLoading) return;
    stopListeningSession();
    speechService.cancelSpeech();
    setInputText('');
    setSpeechTranscript('');
    onSendMessage(opt.label, opt.value);
  };

  // Handle Multi-choice toggle
  const toggleMultiOption = (val: string) => {
    if (selectedMultiOptions.includes(val)) {
      setSelectedMultiOptions(selectedMultiOptions.filter(v => v !== val));
    } else {
      setSelectedMultiOptions([...selectedMultiOptions, val]);
    }
  };

  const submitMultiChoice = () => {
    stopListeningSession();
    speechService.cancelSpeech();
    setInputText('');
    setSpeechTranscript('');
    if (selectedMultiOptions.length === 0) {
      onSendMessage("None of these", "None of these");
    } else {
      onSendMessage(selectedMultiOptions.join(', '), selectedMultiOptions.join(', '));
    }
    setSelectedMultiOptions([]);
  };

  // Manual Toggle Voice Input
  const toggleSpeechRecognition = () => {
    if (isListening) {
      const text = (speechTranscript || inputText).trim();
      stopListeningSession();
      setInputText('');
      setSpeechTranscript('');
      if (text) {
        onSendMessage(text);
      }
    } else {
      speechService.cancelSpeech();
      setInputText('');
      setSpeechTranscript('');
      startListeningSession();
    }
  };

  // Play audio on demand for a message
  const handlePlayAudio = (text: string, msgLang?: string) => {
    const targetLang = (msgLang as Language) || language;
    speechService.speak(text, targetLang);
  };

  // Latest AI message to extract options
  const latestAiMessage = messages.slice().reverse().find(m => m.role === 'ai');

  return (
    <main className="flex-1 flex flex-col h-full bg-slate-50/60 relative overflow-hidden">
      {/* Header Bar */}
      <div className="h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between z-10 shadow-2xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse"></div>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            AI Clinical Consultation Stream
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Hands-free Simultaneous Voice Mode Toggle */}
          <button
            type="button"
            onClick={() => {
              const nextVal = !isAutoVoiceMode;
              setIsAutoVoiceMode(nextVal);
              if (!nextVal) stopListeningSession();
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition cursor-pointer ${isAutoVoiceMode
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs'
              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
            title="Auto-listen for voice response as soon as AI finishes speaking"
          >
            <Radio className={`w-3.5 h-3.5 ${isAutoVoiceMode ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">{isAutoVoiceMode ? 'Hands-Free Voice: ON' : 'Hands-Free: OFF'}</span>
          </button>

          {/* Audio Output Toggle */}
          <button
            type="button"
            onClick={() => {
              if (isAudioEnabled) {
                speechService.cancelSpeech();
              }
              setIsAudioEnabled(!isAudioEnabled);
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition cursor-pointer ${isAudioEnabled
              ? 'bg-sky-50 border-sky-300 text-sky-800 shadow-2xs'
              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
            title={isAudioEnabled ? "Voice question reading active" : "Voice question reading muted"}
          >
            {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5 text-sky-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden md:inline">{isAudioEnabled ? "Speaker On" : "Muted"}</span>
          </button>

          {/* New Session Button */}
          <button
            type="button"
            onClick={() => {
              lastSpokenMessageIdRef.current = null;
              speechService.cancelSpeech();
              stopListeningSession();
              onResetSession();
            }}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 flex items-center space-x-1 transition shadow-2xs cursor-pointer"
            title="Start new patient session"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isAI = msg.role === 'ai';
          const isEmergency = msg.is_emergency;

          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 animate-slide-in ${isAI ? 'justify-start' : 'justify-end'
                }`}
            >
              {isAI && (
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${isEmergency ? 'bg-red-600 text-white' : 'bg-gradient-to-tr from-sky-600 to-blue-600 text-white'
                  }`}>
                  {isEmergency ? <AlertCircle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[78%] rounded-2xl p-4 text-sm leading-relaxed shadow-xs transition-all ${isAI
                  ? isEmergency
                    ? 'bg-red-50 border-2 border-red-400 text-red-950 font-medium'
                    : 'bg-white border border-slate-200/90 text-slate-800'
                  : 'bg-gradient-to-r from-sky-600 to-blue-600 text-white font-medium rounded-br-xs shadow-sky-100 shadow-sm'
                  }`}
              >
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400">
                  <span className={isAI ? (isEmergency ? 'text-red-700 font-bold' : 'text-sky-700 font-bold') : 'text-sky-100'}>
                    {isAI ? 'MediKiosk Clinical Assistant' : 'Patient Response'}
                  </span>
                  <div className="flex items-center space-x-2">
                    {isAI && (
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(msg.content, msg.language)}
                        className="text-slate-400 hover:text-sky-600 transition p-0.5 cursor-pointer"
                        title="Replay spoken question"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className="text-[10px] opacity-70">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="whitespace-pre-line text-[13px] sm:text-[14px]">
                  {msg.content}
                </div>
              </div>

              {!isAI && (
                <div className="w-9 h-9 rounded-2xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center space-x-3 animate-slide-in">
            <div className="w-9 h-9 rounded-2xl bg-sky-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl py-3 px-4 shadow-xs flex items-center space-x-2 text-xs text-slate-600 font-medium">
              <Sparkles className="w-4 h-4 text-sky-600 animate-spin" />
              <span>Analyzing clinical symptoms & preparing question...</span>
            </div>
          </div>
        )}

        {/* Live Voice Recognition Waveform & Feedback Banner */}
        {isListening && (
          <div className="flex items-start space-x-3 animate-slide-in">
            <div className="w-9 h-9 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs ring-4 ring-rose-100 animate-pulse">
              <Mic className="w-4 h-4" />
            </div>
            <div className="bg-white border-2 border-rose-200 rounded-2xl p-4 shadow-md flex-1 text-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                  <span className="font-bold text-rose-700 text-[13px]">
                    Microphone Active — Listening... / बोलें / बोला
                  </span>
                </div>

                {/* Real-time Voice Equalizer bars reacting to sound level */}
                <div className="flex items-end space-x-1 h-5 px-2 py-0.5 bg-rose-50 rounded-lg border border-rose-100">
                  {[0.4, 0.8, 1.2, 0.9, 0.6].map((multiplier, i) => {
                    const barHeight = Math.max(4, Math.min(20, (audioLevel * multiplier * 0.25) + 4));
                    return (
                      <span
                        key={i}
                        className="w-1 bg-rose-500 rounded-full transition-all duration-75"
                        style={{ height: `${barHeight}px` }}
                      ></span>
                    );
                  })}
                </div>
              </div>

              {/* Live Spoken Transcript Preview */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 min-h-[44px] flex items-center">
                {speechTranscript ? (
                  <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                    "{speechTranscript}"
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic flex items-center space-x-1.5">
                    <span>Listening for your words... Speak clearly into your microphone</span>
                  </p>
                )}
              </div>

              {/* Automatic Voice Completion Status */}
              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5 font-medium">
                  {speechTranscript ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-emerald-700 font-semibold">Auto-processing when you finish speaking...</span>
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      <span>Speak naturally into your microphone</span>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={stopListeningSession}
                  className="text-slate-400 hover:text-slate-600 font-medium hover:underline text-[11px] cursor-pointer"
                  title="Pause microphone"
                >
                  Mute mic
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Speech Error Notice if any */}
        {speechError && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{speechError}</span>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={startListeningSession}
                className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry Mic</span>
              </button>
              <button
                type="button"
                onClick={() => inputRef.current?.focus()}
                className="text-sky-700 font-bold hover:underline"
              >
                Type below
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Interactive Answer Area (Options / Severity / Voice / Text) */}
      <div className="bg-white border-t border-slate-200 p-4 sm:p-5 space-y-3 shadow-lg">
        {/* Render contextual quick options if present on latest AI message */}
        {latestAiMessage && latestAiMessage.options && latestAiMessage.options.length > 0 && !isLoading && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
              <span>Suggested Quick Responses</span>
            </span>

            {/* Severity Scale 0-10 Special Selector */}
            {latestAiMessage.question_type === 'severity_scale' || latestAiMessage.question_type === 'pain_scale' ? (
              <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Select Pain Score (0 = No Pain, 10 = Worst):</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 bg-sky-100 text-sky-800 rounded-lg">
                    Selected: {severityValue} / 10
                  </span>
                </div>

                <div className="grid grid-cols-11 gap-1">
                  {Array.from({ length: 11 }).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSeverityValue(idx);
                        onSendMessage(String(idx), String(idx));
                      }}
                      className={`h-10 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${severityValue === idx
                        ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-300'
                        : 'bg-white hover:bg-sky-50 text-slate-700 border border-slate-200'
                        }`}
                    >
                      {idx}
                    </button>
                  ))}
                </div>
              </div>
            ) : latestAiMessage.question_type === 'multi_choice' ? (
              /* Multi-choice options with Submit button */
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                  {latestAiMessage.options.map((opt, idx) => {
                    const isSelected = selectedMultiOptions.includes(opt.value);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleMultiOption(opt.value)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium transition border flex items-center space-x-1.5 shadow-2xs active:scale-[0.98] cursor-pointer ${isSelected
                          ? 'bg-sky-600 text-white border-sky-600 font-semibold shadow-xs'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                      >
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={submitMultiChoice}
                    className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    Confirm Selection →
                  </button>
                </div>
              </div>
            ) : (
              /* Single-choice quick options */
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                {latestAiMessage.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleOptionClick(opt)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium transition border flex items-center space-x-1.5 shadow-2xs active:scale-[0.98] cursor-pointer ${opt.is_red_flag
                      ? 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100 font-semibold'
                      : 'bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-800 border-slate-200 hover:border-sky-300'
                      }`}
                  >
                    {opt.icon && <span className="text-sm">{opt.icon}</span>}
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Input Controls: Voice & Text */}
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`h-11 px-4 rounded-xl font-semibold text-xs flex items-center space-x-2 transition shadow-xs active:scale-95 shrink-0 cursor-pointer ${isListening
              ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse shadow-rose-200'
              : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200'
              }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                <span className="hidden sm:inline">Stop & Send</span>
                {/* Audio wave bars */}
                <div className="flex items-center space-x-0.5 h-4 ml-1">
                  <span className="w-1 bg-white rounded-full wave-bar" style={{ animationDelay: '0s' }}></span>
                  <span className="w-1 bg-white rounded-full wave-bar" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-1 bg-white rounded-full wave-bar" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-sky-600" />
                <span className="hidden sm:inline">Speak Answer</span>
              </>
            )}
          </button>

          {/* Text Input Box */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your answer or speak naturally..."
              disabled={isLoading}
              className="w-full h-11 pl-4 pr-11 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-100 transition shadow-2xs"
            />
            <button
              type="submit"
              disabled={!inputText.trim() && !speechTranscript.trim()}
              className="absolute right-1.5 top-1.5 h-8 w-8 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 disabled:hover:bg-sky-600 text-white rounded-lg flex items-center justify-center transition active:scale-95 shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};
