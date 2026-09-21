'use client';
import React from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceRecorderProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  transcript: string;
}

export function VoiceRecorder({ isListening, onStart, onStop, transcript }: VoiceRecorderProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border-3 border-gray-200 shadow-md">
      <button
        onClick={isListening ? onStop : onStart}
        className={`w-28 h-28 rounded-full flex items-center justify-center text-white transition-all shadow-xl ${
          isListening ? 'bg-red-600 animate-pulseMic' : 'bg-primary-600 hover:bg-primary-700 active:scale-95'
        }`}
      >
        {isListening ? <MicOff className="w-12 h-12" /> : <Mic className="w-12 h-12" />}
      </button>

      <p className="mt-4 text-xl font-bold text-gray-800">
        {isListening ? 'Listening...' : 'Tap to Record Voice'}
      </p>

      {transcript && <p className="mt-2 text-2xl font-bold text-primary-900 italic">"{transcript}"</p>}
    </div>
  );
}
