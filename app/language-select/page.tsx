'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { useAudioFeedback } from '@/lib/hooks/useAudioFeedback';
import { Language } from '@/types/session';
import { ProgressStepper } from '@/components/shared/ProgressStepper';
import { Globe, Volume2, Check } from 'lucide-react';

interface LanguageOption {
  code: Language;
  nameNative: string;
  nameEn: string;
  flag: string;
  script: string;
  audioPrompt: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', nameNative: 'English', nameEn: 'English', flag: '🇬🇧', script: 'Select English language', audioPrompt: 'English language selected' },
  { code: 'hi', nameNative: 'हिंदी', nameEn: 'Hindi', flag: '🇮🇳', script: 'नमस्ते, भाषा का चयन करें', audioPrompt: 'हिंदी भाषा चुनी गई है' },
];

export default function LanguageSelectPage() {
  const router = useRouter();
  const { language, setLanguage } = useSessionStore();
  const { playSound, speak } = useAudioFeedback();

  const handleSelectLanguage = (lang: LanguageOption) => {
    playSound('success');
    setLanguage(lang.code);
    speak(lang.audioPrompt);
    router.push('/consent');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
      <ProgressStepper currentStep={2} />

      <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8">
        
        {/* Title Header */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-[#e8f5f2] border border-[#a7d7cd] flex items-center justify-center text-[#004f45] mx-auto mb-2">
            <Globe className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
            Select Your Preferred Language / भाषा चुनें
          </h2>
          <p className="text-sm sm:text-base font-semibold text-gray-500">
            Tap your language to hear voice prompts and speak symptoms comfortably.
          </p>
        </div>

        {/* Language Selection Touch Cards: English & Hindi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;

            return (
              <button
                key={lang.code}
                onClick={() => handleSelectLanguage(lang)}
                className={`p-7 rounded-2xl border-2 text-left transition-all duration-200 shadow-sm active:scale-98 flex items-center gap-5 min-h-[120px] ${
                  isSelected
                    ? 'bg-[#e8f5f2] border-[#004f45] ring-4 ring-[#e8f5f2]'
                    : 'bg-white border-gray-200 hover:border-[#004f45] hover:bg-gray-50/80'
                }`}
              >
                <span className="text-5xl flex-shrink-0">{lang.flag}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-black text-gray-900 truncate">
                    {lang.nameNative}
                  </h3>
                  <p className="text-xs font-bold text-gray-500 mt-0.5">{lang.nameEn}</p>
                  <p className="text-xs font-semibold text-gray-400 truncate mt-1">{lang.script}</p>
                </div>
                {isSelected && (
                  <div className="w-8 h-8 rounded-full bg-[#004f45] text-white flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Audio Assistance Hint */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center gap-2 text-xs font-semibold text-gray-500">
          <Volume2 className="w-4 h-4 text-[#004f45]" />
          <span>Voice recognition and speech guidance will adapt automatically to your selected language.</span>
        </div>

      </div>
    </div>
  );
}
