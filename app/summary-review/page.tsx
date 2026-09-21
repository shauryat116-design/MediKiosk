'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProgressStepper } from '@/components/shared/ProgressStepper';
import { HistorySummaryCard } from '@/components/summary/HistorySummaryCard';

export default function SummaryReviewPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 animate-fadeIn">
      <ProgressStepper currentStep={7} />
      <HistorySummaryCard onSubmit={() => router.push('/completion')} />
    </div>
  );
}
