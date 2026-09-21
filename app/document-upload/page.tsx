'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDocumentStore } from '@/lib/stores/documentStore';
import { useHistoryStore } from '@/lib/stores/historyStore';
import { CameraCapture } from '@/components/document/CameraCapture';
import { DocumentPreview } from '@/components/document/DocumentPreview';
import { OCRProgress } from '@/components/document/OCRProgress';
import { ProgressStepper } from '@/components/shared/ProgressStepper';
import { Camera, Upload, FileText, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { uploadDocumentScan } from '@/lib/api/documents';

export default function DocumentUploadPage() {
  const router = useRouter();
  const { documents, addDocument, removeDocument, updateExtractedData, setDocumentError } = useDocumentStore();
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCapture = async (base64Img: string, docType: 'prescription' | 'lab_report' | 'discharge_summary') => {
    setShowCamera(false);
    setIsProcessing(true);
    setErrorMsg(null);

    const docId = addDocument({
      type: docType,
      previewUrl: base64Img,
      uploadProgress: 10,
      ocrStatus: 'processing',
      extractedData: {},
      confidence: 0,
    });

    try {
      const response = await uploadDocumentScan(base64Img, docType);
      updateExtractedData(docId, response.extractedData, response.confidence);

      // Auto sync extracted medicines with historyStore so they appear in SOAP summary
      if (response.extractedData.medications && response.extractedData.medications.length > 0) {
        response.extractedData.medications.forEach((med) => {
          useHistoryStore.getState().addMedication({
            name: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            source: 'ocr',
          });
        });
      }
    } catch (err: any) {
      console.error('OCR Error:', err);
      const msg = err.response?.data?.error || err.message || 'Failed to analyze prescription document';
      setDocumentError(docId, msg);
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Str = event.target?.result as string;
        handleCapture(base64Str, 'prescription');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      <ProgressStepper currentStep={6} />

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {isProcessing && <OCRProgress isProcessing={isProcessing} errorMessage={errorMsg} />}
      {showCamera && <CameraCapture onCapture={handleCapture} onCancel={() => setShowCamera(false)} />}

      <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8">
        
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#e8f5f2] border border-[#a7d7cd] flex items-center justify-center text-[#004f45] shadow-inner">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-black text-[#004f45] uppercase tracking-wider">
                Document Vision OCR
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-0.5">
                Upload Prescriptions / पुराने पर्चे
              </h2>
              <p className="text-sm font-semibold text-gray-500">
                Scan previous doctor prescriptions to extract past medications automatically.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI OCR Assisted</span>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-900 font-bold text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Big Touch Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <button
            onClick={() => setShowCamera(true)}
            className="p-8 rounded-3xl bg-[#004f45] hover:bg-[#00695c] text-white font-extrabold text-lg sm:text-xl flex flex-col items-center justify-center gap-3 shadow-md active:scale-98 transition-all min-h-[160px]"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
              <Camera className="w-8 h-8 text-emerald-300" />
            </div>
            <span>📷 Scan with Kiosk Camera</span>
            <span className="text-xs font-semibold text-emerald-100">कैमरा से फोटो खींचें</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-8 rounded-3xl bg-gray-50 hover:bg-gray-100 border-2 border-gray-300 text-gray-800 font-extrabold text-lg sm:text-xl flex flex-col items-center justify-center gap-3 shadow-sm active:scale-98 transition-all min-h-[160px]"
          >
            <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center">
              <Upload className="w-8 h-8 text-gray-600" />
            </div>
            <span>📁 Upload Image File</span>
            <span className="text-xs font-semibold text-gray-500">फाइल अपलोड करें</span>
          </button>
        </div>

        {/* Uploaded Documents List */}
        {documents.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="text-base font-bold text-gray-800">Scanned Documents ({documents.length}):</h3>
            <div className="space-y-2.5">
              {documents.map((doc) => (
                <DocumentPreview key={doc.id} doc={doc} onRemove={removeDocument} onView={() => {}} />
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => router.push('/summary-review')}
            className="w-full sm:w-auto py-3 px-6 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition"
          >
            Skip Upload / छोड़ें
          </button>

          <button
            onClick={() => router.push('/summary-review')}
            className="w-full sm:w-auto sm:ml-auto py-4 px-8 rounded-2xl bg-[#004f45] hover:bg-[#00695c] text-white font-extrabold text-base shadow-md transition active:scale-98 flex items-center justify-center gap-2 min-h-[52px]"
          >
            <span>Proceed to Summary / समीक्षा करें</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}
