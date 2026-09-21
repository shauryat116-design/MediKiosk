'use client';
import React from 'react';
import { AyushProfile } from '@/types/ayush';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles } from 'lucide-react';

export function DoshaResultCard({ profile }: { profile: AyushProfile }) {
  const { dominantDosha, doshaPercentages, recommendations, agni, koshtha } = profile;

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-4 border-emerald-500 rounded-3xl p-8 shadow-xl space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="w-10 h-10 text-emerald-600 animate-spin" />
        <div>
          <h3 className="text-3xl font-extrabold text-gray-900">🌿 Your AYUSH Prakriti Result</h3>
          <p className="text-xl font-bold text-emerald-800">आपकी प्रकृति परिणाम</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border-2 border-emerald-300 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-lg font-bold text-gray-500">DOMINANT DOSHA CONSTITUTION</p>
            <h4 className="text-4xl font-black text-emerald-900 uppercase">{dominantDosha} Prakriti</h4>
          </div>
          <Badge variant="success" className="text-xl px-5 py-2">
            V:{doshaPercentages.vata}% | P:{doshaPercentages.pitta}% | K:{doshaPercentages.kapha}%
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 text-lg font-extrabold text-gray-800 border-t border-gray-200">
          <div>🔥 Agni: <span className="text-emerald-700">{agni.toUpperCase()}</span></div>
          <div>💩 Koshtha: <span className="text-emerald-700">{koshtha.toUpperCase()}</span></div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        <h4 className="text-2xl font-black text-gray-900">📋 Personalized Health & Lifestyle Recommendations:</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border-2 border-emerald-200 shadow-sm space-y-2">
            <h5 className="text-xl font-bold text-emerald-800">🥗 Dietary Guidance (आहार)</h5>
            <ul className="space-y-1 text-base font-semibold text-gray-700">
              {recommendations.diet.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-5 rounded-2xl border-2 border-emerald-200 shadow-sm space-y-2">
            <h5 className="text-xl font-bold text-emerald-800">🧘 Lifestyle Regimen (विहार)</h5>
            <ul className="space-y-1 text-base font-semibold text-gray-700">
              {recommendations.lifestyle.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
