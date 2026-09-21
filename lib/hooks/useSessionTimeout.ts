import { useEffect, useState } from 'react';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { useUIStore } from '@/lib/stores/uiStore';

export function useSessionTimeout() {
  const { expiresAt, resetSession } = useSessionStore();
  const { setShowTimeoutWarning } = useUIStore();
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600);

  useEffect(() => {
    const interval = setInterval(() => {
      const remainingMs = new Date(expiresAt).getTime() - Date.now();
      const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));
      setSecondsRemaining(remainingSec);

      // Show warning modal when 2 minutes (120 sec) remaining
      if (remainingSec <= 120 && remainingSec > 0) {
        setShowTimeoutWarning(true);
      } else {
        setShowTimeoutWarning(false);
      }

      // Auto-logout/reset when timer hits 0
      if (remainingSec <= 0) {
        resetSession();
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, resetSession, setShowTimeoutWarning]);

  const formattedTime = `${Math.floor(secondsRemaining / 60)}:${(secondsRemaining % 60)
    .toString()
    .padStart(2, '0')}`;

  return { secondsRemaining, formattedTime };
}
