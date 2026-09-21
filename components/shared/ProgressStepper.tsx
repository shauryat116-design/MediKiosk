'use client';

import React from 'react';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { Check } from 'lucide-react';

interface StepItem {
  id: number;
  labelHi: string;
  labelEn: string;
}

const STEPS: StepItem[] = [
  { id: 1, labelHi: 'आभा लॉगिन', labelEn: 'ABHA Login' },
  { id: 2, labelHi: 'भाषा चयन', labelEn: 'Language' },
  { id: 3, labelHi: 'गोपनीयता सहमति', labelEn: 'Consent' },
  { id: 4, labelHi: 'स्वास्थ्य इतिहास', labelEn: 'Medical History' },
  { id: 5, labelHi: 'आयुष प्रकृति', labelEn: 'AYUSH Assessment' },
  { id: 6, labelHi: 'दस्तावेज़', labelEn: 'Documents' },
  { id: 7, labelHi: 'समीक्षा व पुष्टि', labelEn: 'Summary Review' },
];

export function ProgressStepper({ currentStep = 4 }: { currentStep?: number }) {
  const { language } = useSessionStore();
  const clampedStep = Math.min(Math.max(currentStep, 1), STEPS.length);
  const percentage = Math.round((clampedStep / STEPS.length) * 100);
  const activeStepObj = STEPS[clampedStep - 1] || STEPS[0];

  return (
    <div className="w-full bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="max-w-5xl mx-auto space-y-3">
        
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-[#e8f5f2] text-[#004f45] border border-[#a7d7cd] font-black px-3.5 py-1 rounded-xl text-xs sm:text-sm tracking-wide uppercase">
              Step {clampedStep} of {STEPS.length}
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-900 leading-tight">
                {language === 'hi' ? activeStepObj.labelHi : activeStepObj.labelEn}
              </h2>
              <p className="text-xs text-gray-400 font-medium">
                {language === 'hi' ? activeStepObj.labelEn : activeStepObj.labelHi}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-sm font-black text-[#004f45]">{percentage}% Completed</span>
          </div>
        </div>

        {/* Sleek Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#004f45] to-[#00695c] h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Step Nodes Track (hidden on mobile, visible on tablet/desktop) */}
        <div className="hidden md:flex items-center justify-between pt-1">
          {STEPS.map((step) => {
            const isCompleted = step.id < clampedStep;
            const isCurrent = step.id === clampedStep;

            return (
              <div key={step.id} className="flex flex-col items-center gap-1 text-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? 'bg-[#004f45] text-white shadow-sm'
                      : isCurrent
                      ? 'bg-[#e8f5f2] text-[#004f45] border-2 border-[#004f45] ring-4 ring-[#e8f5f2]'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.id}
                </div>
                <span
                  className={`text-[11px] font-semibold max-w-[85px] leading-tight ${
                    isCurrent ? 'text-[#004f45] font-black' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  {language === 'hi' ? step.labelHi : step.labelEn}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
