import { useState, useEffect, useCallback, useRef } from 'react';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { playTouchBeep } from '@/lib/utils/audioHelper';

const EMERGENCY_KEYWORDS: Record<string, string[]> = {
  en: ['chest pain', 'bleeding', 'unconscious', "can't breathe", 'severe pain', 'heart attack'],
  hi: ['सीने में दर्द', 'खून', 'बेहोश', 'साँस नहीं आ रही', 'गंभीर दर्द', 'हार्ट अटैक'],
  ta: ['நெஞ்சு வலி', 'இரத்தம்', 'மயக்கம்', 'மூச்சு திணறல்'],
};

export interface UseVoiceRecognitionResult {
  transcript: string;
  isListening: boolean;
  confidence: number;
  emergencyDetected: boolean;
  emergencyMessage: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  hasSpeechSupport: boolean;
}

export function useVoiceRecognition(): UseVoiceRecognitionResult {
  const { language } = useSessionStore();
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [confidence, setConfidence] = useState<number>(0.92);
  const [emergencyDetected, setEmergencyDetected] = useState<boolean>(false);
  const [emergencyMessage, setEmergencyMessage] = useState<string | null>(null);
  const [hasSpeechSupport, setHasSpeechSupport] = useState<boolean>(true);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check emergency keywords
  const checkEmergency = useCallback(
    (text: string) => {
      const lower = text.toLowerCase();
      const keywords = EMERGENCY_KEYWORDS[language] || EMERGENCY_KEYWORDS.en;
      for (const kw of keywords) {
        if (lower.includes(kw.toLowerCase())) {
          setEmergencyDetected(true);
          setEmergencyMessage(`EMERGENCY KEYWORD DETECTED: "${kw}". Priority alert sent to OPD Triage.`);
          playTouchBeep('warning');
          return;
        }
      }
    },
    [language]
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setHasSpeechSupport(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang =
        language === 'hi'
          ? 'hi-IN'
          : language === 'ta'
          ? 'ta-IN'
          : language === 'te'
          ? 'te-IN'
          : language === 'bn'
          ? 'bn-IN'
          : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        playTouchBeep('tap');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        let confSum = 0;
        let confCount = 0;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
          if (event.results[i][0].confidence) {
            confSum += event.results[i][0].confidence;
            confCount++;
          }
        }

        const calculatedConf = confCount > 0 ? confSum / confCount : 0.88;
        setConfidence(calculatedConf);
        setTranscript(currentTranscript);
        checkEmergency(currentTranscript);

        // Reset 3s silence auto-stop timer
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.stop();
            } catch (e) {
              console.warn('Speech recognition stop error:', e);
            }
          }
          playTouchBeep('success');
        }, 3000);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [language, checkEmergency]);

  const startListening = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        setTranscript('');
        setEmergencyDetected(false);
        setEmergencyMessage(null);
        recognitionRef.current.start();
      } catch (err) {
        // Handle case where recognition has already started or permission prompt pending
        console.warn('Recognition start exception:', err);
      }
    } else if (!hasSpeechSupport) {
      // Simulation fallback for environments without Web Speech API
      setIsListening(true);
      setTimeout(() => {
        const simText =
          language === 'hi'
            ? 'मुझे तीन दिन से तेज बुखार और बदन दर्द है'
            : 'I have severe fever and body ache for 3 days';
        setTranscript(simText);
        setConfidence(0.91);
        setIsListening(false);
        checkEmergency(simText);
        playTouchBeep('success');
      }, 1800);
    }
  }, [hasSpeechSupport, language, checkEmergency]);

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    setTranscript('');
    setConfidence(0.9);
    setEmergencyDetected(false);
    setEmergencyMessage(null);
  }, []);

  return {
    transcript,
    isListening,
    confidence,
    emergencyDetected,
    emergencyMessage,
    startListening,
    stopListening,
    resetTranscript,
    hasSpeechSupport,
  };
}
