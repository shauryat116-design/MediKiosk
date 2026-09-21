'use client';
import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface Option {
  label: string;
  value: string;
  icon?: string;
}

interface TouchButtonGridProps {
  options: Option[];
  selectedValue: string | string[];
  onSelect: (val: string) => void;
  multiSelect?: boolean;
}

export function TouchButtonGrid({ options, selectedValue, onSelect, multiSelect = false }: TouchButtonGridProps) {
  const isSelected = (val: string) => {
    if (Array.isArray(selectedValue)) {
      return selectedValue.includes(val);
    }
    return selectedValue === val;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {options.map((opt) => {
        const active = isSelected(opt.value);
        return (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`p-6 rounded-2xl border-4 text-left transition-all flex items-center justify-between min-h-[84px] shadow-md active:scale-95 ${
              active
                ? 'bg-primary-50 border-primary-600 ring-4 ring-primary-200'
                : 'bg-white border-gray-300 hover:border-primary-400'
            }`}
          >
            <div className="flex items-center gap-3">
              {opt.icon && <span className="text-3xl">{opt.icon}</span>}
              <span className="text-2xl font-black text-gray-900">{opt.label}</span>
            </div>
            {active && <CheckCircle2 className="w-8 h-8 text-primary-600 flex-shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}
