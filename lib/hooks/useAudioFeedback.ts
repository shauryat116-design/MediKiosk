import { useCallback } from 'react';
import { useUIStore } from '@/lib/stores/uiStore';
import { playTouchBeep, speakText } from '@/lib/utils/audioHelper';
import { useSessionStore } from '@/lib/stores/sessionStore';

export function useAudioFeedback() {
  const { audioFeedbackEnabled } = useUIStore();
  const { language } = useSessionStore();

  const playSound = useCallback(
    (type: 'tap' | 'success' | 'warning' | 'error' = 'tap') => {
      if (audioFeedbackEnabled) {
        playTouchBeep(type);
      }
    },
    [audioFeedbackEnabled]
  );

  const speak = useCallback(
    (text: string) => {
      if (audioFeedbackEnabled) {
        speakText(text, language);
      }
    },
    [audioFeedbackEnabled, language]
  );

  return { playSound, speak };
}
