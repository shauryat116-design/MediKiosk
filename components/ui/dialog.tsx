'use client';
import * as React from 'react';
import { cn } from './button';
import { X } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Dialog({ isOpen, onClose, title, children }: DialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 border-4 border-primary-500 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-gray-200">
          <h2 className="text-3xl font-extrabold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 min-w-[50px] min-h-[50px] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
