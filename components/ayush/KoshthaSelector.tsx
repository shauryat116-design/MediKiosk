'use client';
import React from 'react';
import { KoshthaType } from '@/types/ayush';
import { Activity, CheckCircle2 } from 'lucide-react';

interface KoshthaSelectorProps {
  selectedKoshtha: KoshthaType;
  onSelectKoshtha: (koshtha: KoshthaType) => void;
}

const KOSHTHA_OPTIONS: { id: KoshthaType; labelHi: string; labelEn: string; desc: string }[] = [
  { id: 'mridu', labelHi: 'मृदु कोष्ठ (कोमल)', labelEn: 'Mridu Koshtha (Soft)', desc: 'Soft bowel, easily triggered by milk' },
  { id: 'madhya', labelHi: 'मध्यम कोष्ठ (सामान्य)', labelEn: 'Madhya Koshtha (Medium)', desc: 'Normal regular bowel movement' },
  { id: 'krura', labelHi: 'क्रूर कोष्ठ (कठोर)', labelEn: 'Krura Koshtha (Hard)', desc: 'Constipation, hard stool, dry bowels' },
];

export function KoshthaSelector({ selectedKoshtha, onSelectKoshtha }: KoshthaSelectorProps) {
  return (
    <div className="bg-white border-3 border-gray-200 rounded-3xl p-6 shadow-md space-y-4">
      <div className="flex items-center gap-3">
        <Activity className="w-8 h-8 text-primary-600" />
        <h3 className="text-2xl font-black text-gray-900">💩 Koshtha Assessment / कोष्ठ (मल प्रवृत्ति)</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {KOSHTHA_OPTIONS.map((opt) => {
          const active = selectedKoshtha === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onSelectKoshtha(opt.id)}
              className={`p-5 rounded-2xl border-3 text-left transition-all flex items-start justify-between min-h-[90px] shadow-sm ${
                active
                  ? 'bg-primary-50 border-primary-500 ring-4 ring-primary-200 scale-102'
                  : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
              }`}
            >
              <div>
                <p className="text-xl font-black text-gray-900">{opt.labelEn}</p>
                <p className="text-lg font-bold text-gray-700">{opt.labelHi}</p>
                <p className="text-sm font-semibold text-gray-500 mt-1">{opt.desc}</p>
              </div>
              {active && <CheckCircle2 className="w-7 h-7 text-primary-600 flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
