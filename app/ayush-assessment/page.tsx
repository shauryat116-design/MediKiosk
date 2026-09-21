'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PrakritiQuestionnaire } from '@/components/ayush/PrakritiQuestionnaire';
import { ProgressStepper } from '@/components/shared/ProgressStepper';

export default function AyushAssessmentPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 animate-fadeIn">
      <ProgressStepper currentStep={5} />
      <PrakritiQuestionnaire onComplete={() => router.push('/document-upload')} />
    </div>
  );
}
