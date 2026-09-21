'use client';
import React from 'react';

interface DatePickerProps {
  value: string;
  onChange: (val: string) => void;
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  return (
    <div className="bg-white border-3 border-gray-200 rounded-3xl p-6 shadow-md text-center space-y-4">
      <label className="block text-2xl font-bold text-gray-800">
        📅 Select Date / तिथि चुनें:
      </label>
      <input
        type="date"
        value={value}
        max={new Date().toISOString().split('T')[0]}
        onChange={(e) => onChange(e.target.value)}
        className="text-3xl p-6 border-4 border-primary-500 rounded-2xl w-full max-w-md mx-auto text-center font-black focus:ring-4 focus:ring-primary-200"
      />
    </div>
  );
}
