import React from 'react';

export function LoadingSpinner({ label = 'Processing... / लोड हो रहा है...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-8 border-primary-200"></div>
        <div className="absolute inset-0 rounded-full border-8 border-primary-600 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-2xl font-bold text-gray-800 text-center animate-pulse">{label}</p>
    </div>
  );
}
