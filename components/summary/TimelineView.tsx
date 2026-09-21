'use client';
import React from 'react';
import { DocumentItem } from '@/lib/stores/documentStore';
import { Calendar, FileText } from 'lucide-react';

export function TimelineView({ documents }: { documents: DocumentItem[] }) {
  return (
    <div className="bg-white border-3 border-gray-200 rounded-3xl p-6 shadow-md space-y-4">
      <div className="flex items-center gap-3">
        <Calendar className="w-8 h-8 text-primary-600" />
        <h3 className="text-2xl font-black text-gray-900">🗓️ Scanned Document History Timeline</h3>
      </div>

      <div className="relative border-l-4 border-primary-400 ml-4 pl-6 space-y-6">
        {documents.map((doc) => (
          <div key={doc.id} className="relative bg-gray-50 p-5 rounded-2xl border-2 border-gray-200 shadow-sm">
            <div className="absolute -left-10 top-5 w-7 h-7 rounded-full bg-primary-600 border-4 border-white" />
            <div className="flex items-center justify-between">
              <span className="text-xl font-extrabold text-primary-900 capitalize">{doc.type.replace('_', ' ')}</span>
              <span className="text-sm font-bold text-gray-500">{doc.extractedData.date || 'Recent Scan'}</span>
            </div>
            <p className="text-lg font-bold text-gray-700 mt-1">Doctor: {doc.extractedData.doctorName || 'Prescription'}</p>
            <p className="text-base font-semibold text-gray-600 italic">"{doc.extractedData.rawText}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}
