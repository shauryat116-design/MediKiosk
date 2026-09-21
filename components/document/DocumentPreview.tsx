'use client';
import React from 'react';
import { DocumentItem } from '@/lib/stores/documentStore';
import { FileText, CheckCircle2, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DocumentPreviewProps {
  doc: DocumentItem;
  onRemove: (id: string) => void;
  onView: (doc: DocumentItem) => void;
}

export function DocumentPreview({ doc, onRemove, onView }: DocumentPreviewProps) {
  return (
    <div className="bg-white border-3 border-gray-200 rounded-3xl p-5 shadow-md flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-gray-300 flex-shrink-0 bg-slate-100">
          <img src={doc.previewUrl} alt="Scan preview" className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-2xl font-black text-gray-900 capitalize">{doc.type.replace('_', ' ')}</h4>
            <Badge variant="success" className="text-sm px-3 py-0.5">
              Confidence {doc.confidence}%
            </Badge>
          </div>
          <p className="text-base font-bold text-gray-600 mt-1">
            Doctor/Lab: {doc.extractedData.doctorName || 'Extracted Prescription'}
          </p>
          <p className="text-sm font-semibold text-emerald-700">
            ✓ Meds Detected: {doc.extractedData.medications?.length || 0}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="md" onClick={() => onView(doc)}>
          <Eye className="w-6 h-6 mr-1" /> View
        </Button>
        <button
          onClick={() => onRemove(doc.id)}
          className="p-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors"
          title="Delete Document"
        >
          <Trash2 className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
}
