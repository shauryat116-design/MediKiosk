'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle, Flashlight, FileText, FlaskConical, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraCaptureProps {
  onCapture: (base64Image: string, docType: 'prescription' | 'lab_report' | 'discharge_summary') => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [docType, setDocType] = useState<'prescription' | 'lab_report' | 'discharge_summary'>('prescription');
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActive(true);
      }
    } catch (err) {
      console.warn('Camera access error or restricted:', err);
      // Fallback simulated camera snapshot for environments without camera
      setStreamActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
    }
  };

  const triggerCapture = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          takeSnapshot();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current && streamActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedPreview(dataUrl);
      }
    } else {
      // Mock fallback sample document photo
      const mockDataUrl = 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80';
      setCapturedPreview(mockDataUrl);
    }
  };

  const handleConfirm = () => {
    if (capturedPreview) {
      stopCamera();
      onCapture(capturedPreview, docType);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-between p-6 animate-fadeIn">
      {/* Top Header Controls */}
      <div className="w-full max-w-4xl flex items-center justify-between text-white">
        <h2 className="text-2xl font-black">📷 Document Scanner / दस्तावेज़ स्कैनर</h2>
        <Button variant="ghost" size="md" onClick={onCancel} className="text-white hover:bg-white/20">
          ✕ Cancel
        </Button>
      </div>

      {/* Document Type Selector */}
      <div className="flex gap-3 bg-white/10 p-2 rounded-2xl backdrop-blur max-w-2xl w-full justify-center">
        <button
          onClick={() => setDocType('prescription')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-lg transition-all ${
            docType === 'prescription' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-300 hover:bg-white/10'
          }`}
        >
          <FileText className="w-6 h-6" /> Prescription
        </button>
        <button
          onClick={() => setDocType('lab_report')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-lg transition-all ${
            docType === 'lab_report' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-300 hover:bg-white/10'
          }`}
        >
          <FlaskConical className="w-6 h-6" /> Lab Report
        </button>
        <button
          onClick={() => setDocType('discharge_summary')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-lg transition-all ${
            docType === 'discharge_summary' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-300 hover:bg-white/10'
          }`}
        >
          <ClipboardList className="w-6 h-6" /> Discharge
        </button>
      </div>

      {/* Live Viewfinder or Captured Preview */}
      <div className="relative w-full max-w-2xl h-[480px] bg-slate-900 rounded-3xl border-4 border-emerald-500 overflow-hidden flex items-center justify-center">
        {!capturedPreview ? (
          <>
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />

            {/* A4 Green Edge Alignment Bounding Overlay */}
            <div className="absolute inset-8 border-4 border-dashed border-emerald-400 rounded-2xl pointer-events-none flex flex-col items-center justify-between p-6">
              <span className="bg-emerald-600 text-white px-4 py-1 rounded-full text-base font-bold">
                Align document inside green border
              </span>
              {countdown && (
                <span className="text-8xl font-black text-yellow-400 animate-ping">{countdown}</span>
              )}
              <span className="text-white font-bold text-sm bg-black/60 px-3 py-1 rounded-full">
                Hold steady for OCR
              </span>
            </div>
          </>
        ) : (
          <img src={capturedPreview} alt="Captured preview" className="w-full h-full object-contain" />
        )}
      </div>

      {/* Capture Action Bar */}
      <div className="w-full max-w-2xl flex items-center justify-center gap-6">
        {!capturedPreview ? (
          <button
            onClick={triggerCapture}
            className="w-24 h-24 rounded-full bg-primary-600 hover:bg-primary-500 border-4 border-white text-white flex items-center justify-center shadow-2xl active:scale-95"
            title="Take Photo"
          >
            <Camera className="w-12 h-12" />
          </button>
        ) : (
          <div className="flex items-center gap-4 w-full">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setCapturedPreview(null)}
              className="flex-1 bg-white text-gray-900"
            >
              <RefreshCw className="w-6 h-6 mr-2" /> Retake Photo
            </Button>
            <Button variant="primary" size="lg" onClick={handleConfirm} className="flex-1">
              <CheckCircle className="w-6 h-6 mr-2" /> Confirm & Process OCR
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
