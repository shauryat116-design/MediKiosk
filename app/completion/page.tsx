'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { useAudioFeedback } from '@/lib/hooks/useAudioFeedback';
import { CheckCircle2, Download, Home, Clock, QrCode, ShieldCheck, ArrowRight, FileText } from 'lucide-react';
import { useHistoryStore } from '@/lib/stores/historyStore';
import { useAyushStore } from '@/lib/stores/ayushStore';
import { useDocumentStore } from '@/lib/stores/documentStore';
import { generateSummaryPDF } from '@/lib/utils/pdfGenerator';
import { getRecommendedSpecialist } from '@/lib/utils/specialistRecommendation';

export default function CompletionPage() {
  const session = useSessionStore();
  const history = useHistoryStore();
  const ayush = useAyushStore();
  const { documents } = useDocumentStore();
  const { speak } = useAudioFeedback();

  const tokenNumber = session.tokenNumber || 'A - 245';
  const patientName =
    (session as any).patientName ||
    (session as any).patient?.name ||
    (session as any).patient?.patient_name ||
    'Rahul Sharma';

  const recognizedComplaint =
    history.chiefComplaint ||
    history.symptoms?.chiefComplaint ||
    history.notes ||
    'None reported';

  const recommendedSpecialist = getRecommendedSpecialist({
    chiefComplaint: recognizedComplaint,
    associatedSymptoms: history.symptoms?.associatedSymptoms,
    notes: history.notes,
    age: session.age,
    gender: session.gender,
  });

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // Ignore confetti errors if canvas fails
    }

    speak(`History submitted successfully! Your token number is ${tokenNumber}. Please proceed to OPD Room 4.`);
  }, [tokenNumber, speak]);

  const handleDownloadPDF = () => {
    generateSummaryPDF({
      tokenNumber,
      patientName,
      abhaId: session.abhaId,
      age: session.age,
      gender: session.gender,
      language: session.language,
      sessionId: session.sessionId,
      history,
      ayush,
      documents,
      recommendedSpecialist,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6 text-center animate-fadeIn">
      
      {/* Main Success Container */}
      <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8">
        
        <div className="w-20 h-20 rounded-full bg-[#e8f5f2] border-2 border-[#a7d7cd] flex items-center justify-center text-[#004f45] mx-auto shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black text-[#004f45] uppercase tracking-wider bg-[#e8f5f2] px-3.5 py-1 rounded-full border border-[#a7d7cd]">
            Pre-Consultation Recorded
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900">
            Assessment Completed Successfully!
          </h1>
          <p className="text-lg sm:text-xl font-bold text-[#004f45]">
            आपकी स्वास्थ्य जानकारी दर्ज हो गई है
          </p>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            Your medical history, voice answers, and AYUSH Prakriti profile are now ready on your doctor's screen.
          </p>
        </div>

        {/* OPD Token Card */}
        <div className="bg-[#f4fbf9] border-2 border-[#004f45] rounded-3xl p-6 sm:p-8 max-w-sm mx-auto space-y-2 shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block">
            YOUR OPD TOKEN NUMBER
          </span>
          <p className="text-5xl sm:text-6xl font-black text-[#004f45] tracking-wider">
            {tokenNumber}
          </p>
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-600 pt-2 border-t border-emerald-200">
            <Clock className="w-4 h-4 text-[#004f45]" />
            <span>Estimated Wait: 10-15 mins • OPD Room 4</span>
          </div>
        </div>

        {/* Reassuring Feedback / Queue Tracking Box */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 max-w-md mx-auto flex items-center justify-center gap-3 text-xs font-semibold text-gray-600">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Doctor will instantly review your pre-captured notes without duplicate questioning.</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3.5 max-w-lg mx-auto pt-2">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 min-h-[50px]"
          >
            <Download className="w-4 h-4 text-[#004f45]" />
            <span>Download Intake PDF</span>
          </button>

          <Link href="/patient-dashboard" className="flex-1">
            <button className="w-full py-3.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 min-h-[50px]">
              <FileText className="w-4 h-4" />
              <span>Patient Dashboard</span>
            </button>
          </Link>

          <Link href="/" onClick={session.resetSession} className="flex-1">
            <button className="w-full py-3.5 px-4 rounded-2xl bg-[#004f45] hover:bg-[#00695c] text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 min-h-[50px]">
              <Home className="w-4 h-4" />
              <span>Finish Kiosk</span>
            </button>
          </Link>
        </div>

      </div>

    </div>
  );
}
