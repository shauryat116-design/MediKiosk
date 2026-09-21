'use client';
import React from 'react';

interface BodyDiagramProps {
  selectedPart: string;
  onSelectPart: (part: string) => void;
}

const BODY_PARTS = [
  { id: 'head', nameHi: 'सिर / गर्दन', nameEn: 'Head / Neck', x: 50, y: 15 },
  { id: 'chest', nameHi: 'छाती / फेफड़े', nameEn: 'Chest / Heart', x: 50, y: 32 },
  { id: 'stomach', nameHi: 'पेट / पाचन', nameEn: 'Abdomen / Stomach', x: 50, y: 48 },
  { id: 'shoulder_right', nameHi: 'दायां कंधा', nameEn: 'Right Shoulder', x: 28, y: 28 },
  { id: 'shoulder_left', nameHi: 'बायां कंधा', nameEn: 'Left Shoulder', x: 72, y: 28 },
  { id: 'knee_joints', nameHi: 'घुटने / जोड़', nameEn: 'Knees / Joints', x: 50, y: 78 },
];

export function BodyDiagram({ selectedPart, onSelectPart }: BodyDiagramProps) {
  return (
    <div className="bg-white border-3 border-gray-200 rounded-3xl p-6 shadow-md text-center space-y-4">
      <h3 className="text-2xl font-bold text-gray-800">
        🧍 Tap Pain Location on Body / दर्द का स्थान चुनें:
      </h3>

      <div className="relative w-full max-w-sm mx-auto h-[400px] bg-slate-100 rounded-3xl border-2 border-slate-300 overflow-hidden flex items-center justify-center">
        {/* SVG Human Silhouette Graphic */}
        <svg viewBox="0 0 100 100" className="w-full h-full text-slate-300 fill-current">
          <circle cx="50" cy="15" r="8" />
          <rect x="42" y="24" width="16" height="35" rx="4" />
          <rect x="25" y="25" width="14" height="25" rx="3" />
          <rect x="61" y="25" width="14" height="25" rx="3" />
          <rect x="38" y="60" width="10" height="32" rx="3" />
          <rect x="52" y="60" width="10" height="32" rx="3" />
        </svg>

        {/* Interactive Hotspots */}
        {BODY_PARTS.map((part) => {
          const isSelected = selectedPart === part.id;
          return (
            <button
              key={part.id}
              onClick={() => onSelectPart(part.id)}
              style={{ left: `${part.x}%`, top: `${part.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-full font-black text-sm transition-all border-2 shadow-lg ${
                isSelected
                  ? 'bg-red-600 text-white border-white scale-125 ring-4 ring-red-300 animate-pulse'
                  : 'bg-primary-600 text-white border-white hover:scale-110'
              }`}
            >
              {part.nameEn}
            </button>
          );
        })}
      </div>

      {selectedPart && (
        <p className="text-2xl font-extrabold text-primary-800 bg-primary-50 p-4 rounded-2xl border-2 border-primary-300">
          Selected Location: <span className="underline">{selectedPart.toUpperCase()}</span>
        </p>
      )}
    </div>
  );
}
