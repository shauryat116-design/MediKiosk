'use client';
import React from 'react';
import Link from 'next/link';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { useOfflineQueue } from '@/lib/hooks/useOfflineQueue';
import { useAudioFeedback } from '@/lib/hooks/useAudioFeedback';
import { Globe, Volume2, VolumeX, WifiOff, Stethoscope, ShieldCheck } from 'lucide-react';
import { Language } from '@/types/session';

export function Header() {
  const { language, setLanguage, abhaId } = useSessionStore();
  const { audioFeedbackEnabled, toggleAudioFeedback } = useUIStore();
  const { isOnline } = useOfflineQueue();
  const { playSound } = useAudioFeedback();

  const languageLabels: Record<string, string> = {
    hi: 'हिंदी',
    en: 'English',
  };

  const handleLangToggle = () => {
    playSound('tap');
    const langs: Language[] = ['hi', 'en'];
    const nextIdx = (langs.indexOf(language as Language) + 1) % langs.length;
    setLanguage(langs[nextIdx]);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm px-6 py-3.5 flex items-center justify-between">
      {/* Hospital Brand & Kiosk Identity */}
      <Link href="/" className="flex items-center gap-3.5 group cursor-pointer">
        <div className="w-12 h-12 rounded-2xl bg-[#004f45] flex items-center justify-center text-white shadow-md group-hover:bg-[#00695c] transition-colors">
          <Stethoscope className="w-7 h-7 text-emerald-300" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight leading-none">
              Swaasth Saathi
            </h1>
            <span className="text-xs bg-[#e8f5f2] text-[#004f45] font-extrabold px-2 py-0.5 rounded-full border border-[#a7d7cd]">
              स्वास्थ्य साथी
            </span>
          </div>
          <p className="text-xs font-semibold text-gray-500 mt-1">
            AYUSH OPD Smart Kiosk
          </p>
        </div>
      </Link>

      {/* Offline Indicator if disconnected */}
      {!isOnline && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-900 px-3.5 py-1.5 rounded-xl text-xs font-bold animate-pulse">
          <WifiOff className="w-4 h-4 text-amber-700" />
          <span>Offline Sync Active</span>
        </div>
      )}

      {/* Accessibility & ABHA Status Controls */}
      <div className="flex items-center gap-2.5">
        {/* Linked ABHA Badge */}
        {abhaId && (
          <div className="hidden lg:flex items-center gap-2 bg-[#e8f5f2] border border-[#a7d7cd] text-[#004f45] px-3.5 py-2 rounded-xl font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ABHA: {abhaId}</span>
          </div>
        )}

        {/* Language Switcher (English + Hindi) */}
        <button
          onClick={handleLangToggle}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 text-sm font-bold transition-all min-h-[46px]"
          title="Switch Language / भाषा बदलें"
        >
          <Globe className="w-4 h-4 text-[#004f45]" />
          <span>{languageLabels[language] || 'English'}</span>
        </button>

        {/* Voice Audio Guidance Toggle */}
        <button
          onClick={() => {
            playSound('tap');
            toggleAudioFeedback();
          }}
          className={`p-2.5 rounded-xl border text-sm font-bold flex items-center justify-center transition-all min-h-[46px] min-w-[46px] ${
            audioFeedbackEnabled
              ? 'bg-[#e8f5f2] border-[#a7d7cd] text-[#004f45]'
              : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'
          }`}
          title="Toggle Audio Voice Assistance / आवाज चालू/बंद"
        >
          {audioFeedbackEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
