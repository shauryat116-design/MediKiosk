'use client';
import React from 'react';

export function ImageCropper({ imageUrl, onCropComplete }: { imageUrl: string; onCropComplete: (cropped: string) => void }) {
  return (
    <div className="bg-white p-6 rounded-3xl border-3 border-gray-200 shadow-md text-center space-y-4">
      <h3 className="text-2xl font-bold text-gray-800">✂️ Crop & Rotate Document / आकार बदलें</h3>
      <div className="max-w-md mx-auto rounded-2xl overflow-hidden border-2 border-gray-300">
        <img src={imageUrl} alt="Crop view" className="w-full h-auto object-contain" />
      </div>
      <button
        onClick={() => onCropComplete(imageUrl)}
        className="px-6 py-3 rounded-2xl bg-primary-600 text-white font-bold text-xl shadow-md"
      >
        Done Cropping / संपन्न
      </button>
    </div>
  );
}
