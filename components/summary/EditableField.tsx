'use client';
import React, { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (newVal: string) => void;
}

export function EditableField({ label, value, onSave }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempVal, setTempVal] = useState(value);

  const handleSave = () => {
    onSave(tempVal);
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-5 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-gray-500 uppercase">{label}</span>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 text-primary-700 font-extrabold text-lg hover:underline"
          >
            <Edit2 className="w-5 h-5" /> Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={handleSave} className="p-2 bg-emerald-600 text-white rounded-xl font-bold">
              <Check className="w-5 h-5" />
            </button>
            <button onClick={() => setIsEditing(false)} className="p-2 bg-gray-300 text-gray-800 rounded-xl font-bold">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {!isEditing ? (
        <p className="text-2xl font-black text-gray-900">{value || 'None specified'}</p>
      ) : (
        <input
          type="text"
          value={tempVal}
          onChange={(e) => setTempVal(e.target.value)}
          className="w-full text-2xl p-4 border-3 border-primary-500 rounded-xl font-bold bg-white"
        />
      )}
    </div>
  );
}
