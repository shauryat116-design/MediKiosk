'use client';

import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2, Sparkles } from 'lucide-react';

export function OCRProgress({ isProcessing, errorMessage }: { isProcessing: boolean; errorMessage?: string | null }) {
  const [progress, setProgress] = useState(25);
  const [stage, setStage] = useState('Uploading prescription image...');

  useEffect(() => {
    if (!isProcessing) return;

    const timer1 = setTimeout(() => {
      setProgress(50);
      setStage('Reading medical document...');
    }, 1000);

    const timer2 = setTimeout(() => {
      setProgress(80);
      setStage('Analyzing doctor text, medicines & dosages...');
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isProcessing]);

  return (
    <div className="bg-white rounded-3xl p-8 border-4 border-primary-500 shadow-2xl space-y-6 text-center max-w-xl mx-auto animate-fadeIn">
      {errorMessage ? (
        <div className="space-y-4">
          <span className="text-5xl">⚠️</span>
          <h3 className="text-3xl font-extrabold text-red-600">Document Extraction Error</h3>
          <p className="text-xl font-bold text-gray-700">{errorMessage}</p>
        </div>
      ) : (
        <>
          <div className="relative w-20 h-20 mx-auto">
            <Loader2 className="w-20 h-20 text-primary-600 animate-spin" />
            <Sparkles className="w-8 h-8 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900">Analyzing Medical Document...</h3>
          <Progress value={progress} className="h-6" indicatorColor="bg-primary-600" />
          <p className="text-2xl font-bold text-primary-800">{stage}</p>
          <p className="text-lg text-gray-500">Extracting Doctor Name, Medicines, Dosage & Instructions.</p>
        </>
      )}
    </div>
  );
}
