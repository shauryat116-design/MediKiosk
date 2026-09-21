'use client';
import React from 'react';
import { AgniType } from '@/types/ayush';
import { Flame, CheckCircle2 } from 'lucide-react';

interface AgniSelectorProps {
  selectedAgni: AgniType;
  onSelectAgni: (agni: AgniType) => void;
}

const AGNI_OPTIONS: { id: AgniType; labelHi: string; labelEn: string; desc: string }[] = [
  { id: 'sama', labelHi: 'सम अग्नि (सामान्य)', labelEn: 'Sama Agni (Normal)', desc: 'Balanced digestion, timely hunger' },
  { id: 'manda', labelHi: 'मंद अग्नि (धीमा/कफ)', labelEn: 'Manda Agni (Slow)', desc: 'Weak digestion, feeling heavy after meals' },
  { id: 'tikshna', labelHi: 'तीक्ष्ण अग्नि (तेज/पित्त)', labelEn: 'Tikshna Agni (Intense)', desc: 'Sharp hunger, acid reflux, quick digestion' },
  { id: 'vishama', labelHi: 'विषम अग्नि (अनियमित/वात)', labelEn: 'Vishama Agni (Irregular)', desc: 'Variable appetite, bloating, gas' },
];

export function AgniSelector({ selectedAgni, onSelectAgni }: AgniSelectorProps) {
  return (
    <div className="bg-white border-3 border-gray-200 rounded-3xl p-6 shadow-md space-y-4">
      <div className="flex items-center gap-3">
        <Flame className="w-8 h-8 text-amber-600" />
        <h3 className="text-2xl font-black text-gray-900">🔥 Agni Assessment / अग्नि (पाचन शक्ति)</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AGNI_OPTIONS.map((opt) => {
          const active = selectedAgni === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onSelectAgni(opt.id)}
              className={`p-5 rounded-2xl border-3 text-left transition-all flex items-start justify-between min-h-[90px] shadow-sm ${
                active
                  ? 'bg-amber-50 border-amber-500 ring-4 ring-amber-200 scale-102'
                  : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
              }`}
            >
              <div>
                <p className="text-xl font-black text-gray-900">{opt.labelEn}</p>
                <p className="text-lg font-bold text-gray-700">{opt.labelHi}</p>
                <p className="text-sm font-semibold text-gray-500 mt-1">{opt.desc}</p>
              </div>
              {active && <CheckCircle2 className="w-7 h-7 text-amber-600 flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
