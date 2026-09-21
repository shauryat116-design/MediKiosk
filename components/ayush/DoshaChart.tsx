'use client';
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { DoshaScores } from '@/types/ayush';

interface DoshaChartProps {
  scores: DoshaScores;
  percentages: { vata: number; pitta: number; kapha: number };
}

export function DoshaChart({ scores, percentages }: DoshaChartProps) {
  const chartData = [
    { subject: `Vata (${percentages.vata}%)`, A: percentages.vata, fullMark: 100 },
    { subject: `Pitta (${percentages.pitta}%)`, A: percentages.pitta, fullMark: 100 },
    { subject: `Kapha (${percentages.kapha}%)`, A: percentages.kapha, fullMark: 100 },
  ];

  return (
    <div className="w-full bg-white rounded-3xl p-6 border-3 border-gray-200 shadow-md flex flex-col items-center">
      <h3 className="text-2xl font-extrabold text-gray-900 mb-2">🧘 Dosha Balance Triangle / त्रिदोष चित्र</h3>
      <p className="text-base font-bold text-gray-500 mb-4">Vata (Air/Space) • Pitta (Fire/Water) • Kapha (Earth/Water)</p>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid stroke="#e2e8f0" strokeWidth={2} />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#1e293b', fontSize: 16, fontWeight: 800 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar name="Dosha %" dataKey="A" stroke="#10B981" fill="#10B981" fillOpacity={0.6} strokeWidth={4} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Real-time Percentage Bar Indicators */}
      <div className="w-full space-y-3 mt-4">
        <div>
          <div className="flex justify-between font-extrabold text-lg mb-1">
            <span className="text-vata">Vata (वात - Air)</span>
            <span className="text-vata">{percentages.vata}%</span>
          </div>
          <div className="h-4 w-full bg-vata-light rounded-full overflow-hidden">
            <div className="h-full bg-vata transition-all duration-500" style={{ width: `${percentages.vata}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between font-extrabold text-lg mb-1">
            <span className="text-pitta">Pitta (पित्त - Fire)</span>
            <span className="text-pitta">{percentages.pitta}%</span>
          </div>
          <div className="h-4 w-full bg-pitta-light rounded-full overflow-hidden">
            <div className="h-full bg-pitta transition-all duration-500" style={{ width: `${percentages.pitta}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between font-extrabold text-lg mb-1">
            <span className="text-kapha">Kapha (कफ - Earth)</span>
            <span className="text-kapha">{percentages.kapha}%</span>
          </div>
          <div className="h-4 w-full bg-kapha-light rounded-full overflow-hidden">
            <div className="h-full bg-kapha transition-all duration-500" style={{ width: `${percentages.kapha}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
