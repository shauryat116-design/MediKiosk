'use client';
import React from 'react';

interface ScaleSliderProps {
  value: number;
  onChange: (val: number) => void;
}

export function ScaleSlider({ value, onChange }: ScaleSliderProps) {
  const getEmoji = (val: number) => {
    if (val <= 2) return '😊 Mild';
    if (val <= 5) return '😐 Moderate';
    if (val <= 8) return '😣 Severe';
    return '😫 Extreme Pain';
  };

  const getBgColor = (val: number) => {
    if (val <= 3) return 'bg-emerald-500';
    if (val <= 6) return 'bg-amber-500';
    return 'bg-red-600';
  };

  return (
    <div className="bg-white border-3 border-gray-200 rounded-3xl p-8 shadow-md text-center space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-xl font-extrabold text-gray-500">Rate Severity (1 - 10):</span>
        <span className={`px-6 py-2 rounded-full font-black text-2xl text-white ${getBgColor(value)}`}>
          {value} / 10 • {getEmoji(value)}
        </span>
      </div>

      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-8 bg-gray-200 rounded-2xl appearance-none cursor-pointer accent-primary-600 focus:ring-4 focus:ring-primary-300"
      />

      <div className="grid grid-cols-10 gap-1 text-center font-bold text-lg text-gray-700">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <button
            key={num}
            onClick={() => onChange(num)}
            className={`py-3 rounded-xl border-2 transition-all ${
              value === num
                ? 'bg-primary-600 text-white border-primary-700 font-black scale-110 shadow-lg'
                : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
            }`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}
