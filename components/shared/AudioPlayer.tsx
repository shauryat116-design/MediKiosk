'use client';
import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { speakText } from '@/lib/utils/audioHelper';
import { useSessionStore } from '@/lib/stores/sessionStore';

interface AudioPlayerProps {
  textToSpeak: string;
  autoPlay?: boolean;
}

export function AudioPlayer({ textToSpeak, autoPlay = false }: AudioPlayerProps) {
  const { language } = useSessionStore();
  const [isPlaying, setIsPlaying] = useState(false);

  React.useEffect(() => {
    if (autoPlay && textToSpeak) {
      handlePlay();
    }
  }, [textToSpeak, autoPlay]);

  const handlePlay = () => {
    if (!textToSpeak) return;
    setIsPlaying(true);
    speakText(textToSpeak, language);
    setTimeout(() => setIsPlaying(false), 3000);
  };

  return (
    <button
      onClick={handlePlay}
      className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl border-3 text-xl font-extrabold transition-all shadow-md active:scale-95 ${
        isPlaying
          ? 'bg-primary-600 border-primary-700 text-white animate-pulse'
          : 'bg-primary-50 border-primary-400 text-primary-900 hover:bg-primary-100'
      }`}
    >
      {isPlaying ? <VolumeX className="w-7 h-7" /> : <Volume2 className="w-7 h-7 text-primary-700" />}
      <span>{isPlaying ? 'Speaking...' : '🔊 Listen / सुनें'}</span>
    </button>
  );
}
