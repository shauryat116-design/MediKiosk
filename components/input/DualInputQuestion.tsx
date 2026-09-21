'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useVoiceRecognition } from '@/lib/hooks/useVoiceRecognition';
import { useAudioFeedback } from '@/lib/hooks/useAudioFeedback';
import { Mic, MicOff, AlertOctagon, CheckCircle2, Volume2, RefreshCw, Sparkles, Check, ArrowRight } from 'lucide-react';
import { ScaleSlider } from './ScaleSlider';
import { BodyDiagram } from './BodyDiagram';
import { Language } from '@/types/session';

export interface DualInputQuestionProps {
  questionKey: string;
  questionText: string;
  questionAudio?: string;
  inputType: 'open' | 'choice' | 'scale' | 'date' | 'body';
  choices?: { label: string; value: string; icon?: string }[];
  voiceEnabled?: boolean;
  language: Language;
  onAnswer: (answer: any) => void;
  onSkip?: () => void;
}

/** Helper to match body part location from voice */
function matchBodyPartFromSpeech(transcript: string): string | null {
  if (!transcript) return null;
  const lower = transcript.toLowerCase();

  const bodyMap: Record<string, string[]> = {
    head: ['head', 'neck', 'सिर', 'गर्दन', 'माथा'],
    chest: ['chest', 'heart', 'छाती', 'फेफड़े', 'सीना'],
    stomach: ['stomach', 'abdomen', 'belly', 'पेट', 'पाचन'],
    shoulder_right: ['right shoulder', 'दायां कंधा', 'दाहिना कंधा'],
    shoulder_left: ['left shoulder', 'बायां कंधा', 'बाया कंधा'],
    knee_joints: ['knee', 'joint', 'leg', 'घुटने', 'जोड़', 'पैर'],
  };

  for (const [partId, keywords] of Object.entries(bodyMap)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return partId;
    }
  }

  return null;
}

/** Helper to parse numeric pain scale from voice */
function parseNumberFromSpeech(transcript: string): number | null {
  if (!transcript) return null;
  const lower = transcript.toLowerCase();

  const digitMatch = lower.match(/\b([1-9]|10)\b/);
  if (digitMatch) return Number(digitMatch[1]);

  const wordMap: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    एक: 1, दो: 2, तीन: 3, चार: 4, पाँच: 5, पांच: 5,
    छह: 6, सात: 7, आठ: 8, नौ: 9, दस: 10,
  };

  for (const [word, num] of Object.entries(wordMap)) {
    if (lower.includes(word)) return num;
  }

  return null;
}

export function DualInputQuestion({
  questionKey,
  questionText,
  inputType,
  choices = [],
  voiceEnabled = true,
  language,
  onAnswer,
  onSkip,
}: DualInputQuestionProps) {
  const {
    transcript,
    isListening,
    confidence,
    emergencyDetected,
    emergencyMessage,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecognition();
  const { playSound, speak } = useAudioFeedback();

  const [selectedChoice, setSelectedChoice] = useState<string | number | object | null>(null);
  const [scaleVal, setScaleVal] = useState<number>(5);
  const [isVoiceInputActive, setIsVoiceInputActive] = useState<boolean>(false);

  const autoStartTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-speak question & auto-start microphone after 1.8s delay
  useEffect(() => {
    stopListening();
    resetTranscript();
    setSelectedChoice(null);
    setIsVoiceInputActive(false);

    if (autoStartTimerRef.current) {
      clearTimeout(autoStartTimerRef.current);
      autoStartTimerRef.current = null;
    }

    speak(questionText);

    if (voiceEnabled) {
      autoStartTimerRef.current = setTimeout(() => {
        startListening();
      }, 1800);
    }

    return () => {
      if (autoStartTimerRef.current) {
        clearTimeout(autoStartTimerRef.current);
        autoStartTimerRef.current = null;
      }
      stopListening();
    };
  }, [questionKey, questionText, voiceEnabled, speak, startListening, stopListening, resetTranscript]);

  // When patient speaks, preserve the FULL spoken sentence
  useEffect(() => {
    if (transcript && transcript.trim().length > 0) {
      setIsVoiceInputActive(true);
      if (inputType === 'scale') {
        const parsedNum = parseNumberFromSpeech(transcript);
        if (parsedNum !== null) {
          setScaleVal(parsedNum);
          setSelectedChoice(parsedNum);
        } else {
          setSelectedChoice(transcript);
        }
      } else if (inputType === 'body') {
        const matchedBody = matchBodyPartFromSpeech(transcript);
        if (matchedBody) {
          setSelectedChoice(matchedBody);
        } else {
          setSelectedChoice(transcript);
        }
      } else {
        setSelectedChoice(transcript);
      }
    }
  }, [transcript, inputType]);

  const handleTouchSelect = (val: any) => {
    playSound('tap');
    setIsVoiceInputActive(false);
    setSelectedChoice(val);
  };

  const handleSubmit = () => {
    const finalAnswer = isVoiceInputActive && transcript ? transcript : (selectedChoice !== null ? selectedChoice : transcript);
    if (finalAnswer !== null && finalAnswer !== '') {
      playSound('success');
      onAnswer(finalAnswer);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Emergency Alert Banner if triggered */}
      {emergencyDetected && (
        <div className="bg-red-600 text-white rounded-2xl p-5 shadow-lg flex items-center gap-4 animate-shake border-2 border-red-700">
          <AlertOctagon className="w-10 h-10 text-yellow-300 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-black uppercase tracking-wide">🚨 Priority Clinical Triage Notice</h3>
            <p className="text-base font-bold mt-0.5">{emergencyMessage}</p>
            <p className="text-xs text-yellow-200 mt-0.5">Emergency desk alerted automatically.</p>
          </div>
        </div>
      )}

      {/* Primary Question Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-black text-[#004f45] uppercase tracking-wider">
              Health Intake Question / स्वास्थ्य प्रश्न
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-snug">
              {questionText}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => speak(questionText)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#e8f5f2] hover:bg-[#d8efe9] border border-[#a7d7cd] text-[#004f45] text-xs font-bold transition self-start sm:self-center"
            title="Listen Question Audio"
          >
            <Volume2 className="w-4 h-4" />
            <span>Listen Audio</span>
          </button>
        </div>
      </div>

      {/* CORE Voice Recording Section (Primary Input) */}
      {voiceEnabled && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-6">
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-lg ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse ring-8 ring-red-100'
                  : 'bg-[#004f45] hover:bg-[#00695c] text-white active:scale-95 ring-8 ring-[#e8f5f2]'
              }`}
              title={isListening ? 'Stop Recording' : 'Tap to Speak'}
            >
              {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
              <span className="text-xs font-black mt-1 tracking-wider uppercase">
                {isListening ? 'Stop' : 'SPEAK'}
              </span>
            </button>

            <div className="mt-4 space-y-1">
              <p className="text-base sm:text-lg font-bold text-gray-800">
                {isListening ? (
                  <span className="text-red-600 font-extrabold flex items-center justify-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                    Listening to your voice... (बोलिए, हम सुन रहे हैं)
                  </span>
                ) : (
                  '🎤 Speak your symptoms naturally (or tap mic to re-record)'
                )}
              </p>
              <p className="text-xs text-gray-400 font-medium">
                Speaks Hindi, English, Tamil, Telugu & Bengali
              </p>
            </div>
          </div>

          {/* Live Recognized Voice Display Card */}
          {transcript && (
            <div className="bg-[#f4fbf9] border border-[#a7d7cd] rounded-2xl p-5 text-left space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#004f45] uppercase tracking-wider">
                  Live Recognized Speech / पहचानी गई आवाज
                </span>
                <span className="text-xs font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Confidence: {Math.round(confidence * 100)}%
                </span>
              </div>
              <p className="text-xl font-bold text-gray-900 italic leading-relaxed">
                "{transcript}"
              </p>
              <button
                type="button"
                onClick={() => {
                  resetTranscript();
                  startListening();
                }}
                className="text-xs text-[#004f45] hover:underline font-bold flex items-center gap-1.5 pt-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Spoken Answer / दोबारा बोलें</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Alternative Touch Controls (Secondary Input) */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">
          👇 OR Tap your response below (स्पर्श द्वारा चुनें):
        </p>

        {inputType === 'choice' && (
          <div className="space-y-4">
            {/* Custom Spoken Badge if speech was used */}
            {typeof selectedChoice === 'string' &&
              selectedChoice.trim().length > 0 &&
              !choices.some((c) => c.value === selectedChoice || c.label === selectedChoice) && (
                <div className="bg-[#e8f5f2] border border-[#a7d7cd] rounded-2xl p-4 text-left font-bold text-base text-[#004f45] flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-xs uppercase font-extrabold text-[#004f45] block">
                      Captured Spoken Input / दर्ज किया गया उत्तर:
                    </span>
                    <span className="text-lg font-black text-gray-900">"{selectedChoice}"</span>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                </div>
              )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {choices.map((choice) => {
                const isSelected = selectedChoice === choice.label || selectedChoice === choice.value;
                return (
                  <button
                    key={choice.value}
                    type="button"
                    onClick={() => handleTouchSelect(choice.label)}
                    className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 min-h-[76px] shadow-sm active:scale-98 ${
                      isSelected
                        ? 'bg-[#e8f5f2] border-[#004f45] ring-4 ring-[#e8f5f2]'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {choice.icon && <span className="text-3xl flex-shrink-0">{choice.icon}</span>}
                    <div className="flex-1 min-w-0">
                      <span className="text-base sm:text-lg font-bold text-gray-900 block truncate">
                        {choice.label}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#004f45] text-white flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {inputType === 'scale' && (
          <ScaleSlider
            value={scaleVal}
            onChange={(val) => {
              setScaleVal(val);
              handleTouchSelect(val);
            }}
          />
        )}

        {inputType === 'body' && (
          <BodyDiagram
            selectedPart={typeof selectedChoice === 'string' ? selectedChoice : ''}
            onSelectPart={(part) => handleTouchSelect(part)}
          />
        )}

        {inputType === 'open' && (
          <textarea
            value={typeof selectedChoice === 'string' ? selectedChoice : transcript || ''}
            onChange={(e) => handleTouchSelect(e.target.value)}
            rows={4}
            placeholder="Speak or type your symptoms here... (बोलिए या टाइप करें)"
            className="w-full text-lg p-5 rounded-2xl border-2 border-gray-300 focus:border-[#004f45] focus:ring-4 focus:ring-[#e8f5f2] font-semibold bg-gray-50/50 outline-none"
          />
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="w-full sm:w-auto py-3 px-6 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition"
          >
            Skip Question / छोड़ें
          </button>
        )}

        <button
          type="button"
          disabled={selectedChoice === null && (!transcript || transcript.trim().length === 0)}
          onClick={handleSubmit}
          className="w-full sm:w-auto sm:ml-auto py-4 px-8 rounded-2xl bg-[#004f45] hover:bg-[#00695c] text-white font-extrabold text-base shadow-md transition active:scale-98 flex items-center justify-center gap-2 disabled:opacity-40 min-h-[52px]"
        >
          <span>Confirm & Next / पुष्टि करें</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}
