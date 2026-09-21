'use client';
import React from 'react';
import { useSessionTimeout } from '@/lib/hooks/useSessionTimeout';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { Clock, PlusCircle } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function SessionTimer() {
  const { secondsRemaining, formattedTime } = useSessionTimeout();
  const { extendSession } = useSessionStore();
  const { showTimeoutWarning, setShowTimeoutWarning } = useUIStore();

  const isLowTime = secondsRemaining <= 180; // 3 mins remaining

  return (
    <>
      <div
        className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border-3 shadow-md transition-all font-extrabold text-xl ${
          isLowTime
            ? 'bg-red-100 border-red-500 text-red-900 animate-pulse'
            : 'bg-emerald-50 border-emerald-500 text-emerald-900'
        }`}
      >
        <Clock className={`w-7 h-7 ${isLowTime ? 'text-red-700' : 'text-emerald-700'}`} />
        <span>⏱️ {formattedTime} remaining</span>
        <button
          onClick={extendSession}
          className="ml-2 p-2 hover:bg-white/60 rounded-xl flex items-center gap-1 text-base text-primary-800 underline"
          title="Extend Session Time"
        >
          <PlusCircle className="w-5 h-5" />
          <span>+5m</span>
        </button>
      </div>

      {/* Timeout Alert Modal */}
      <Dialog
        isOpen={showTimeoutWarning}
        onClose={() => setShowTimeoutWarning(false)}
        title="⚠️ Session Timeout Warning / सत्र का समय समाप्त हो रहा है"
      >
        <div className="space-y-6 text-center py-4">
          <p className="text-2xl font-bold text-gray-800">
            Your kiosk session will expire in <span className="text-red-600 font-black">{formattedTime}</span> due to inactivity.
          </p>
          <p className="text-xl text-gray-600">
            निष्क्रियता के कारण आपका सत्र शीघ्र ही समाप्त हो जाएगा। क्या आप अधिक समय चाहते हैं?
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              variant="primary"
              size="kiosk"
              onClick={() => {
                extendSession();
                setShowTimeoutWarning(false);
              }}
            >
              ⏳ Extend Session (+5 Mins) / समय बढ़ाएं
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
