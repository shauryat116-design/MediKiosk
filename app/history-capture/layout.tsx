'use client';

import React from 'react';
import { ProgressStepper } from '@/components/shared/ProgressStepper';
import { SessionTimer } from '@/components/shared/SessionTimer';

export default function HistoryCaptureLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full flex-1">
          <ProgressStepper currentStep={4} />
        </div>
        <SessionTimer />
      </div>
      {children}
    </div>
  );
}
