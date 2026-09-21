'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { useAudioFeedback } from '@/lib/hooks/useAudioFeedback';
import { ProgressStepper } from '@/components/shared/ProgressStepper';
import { ShieldCheck, CheckSquare, Square, Volume2, Lock, ArrowRight } from 'lucide-react';

export default function ConsentPage() {
  const router = useRouter();
  const { giveConsent } = useSessionStore();
  const { playSound, speak } = useAudioFeedback();

  const [c1, setC1] = useState(true);
  const [c2, setC2] = useState(true);
  const [c3, setC3] = useState(true);

  const allChecked = c1 && c2 && c3;

  const handleAgree = () => {
    playSound('success');
    giveConsent();
    speak('Consent recorded. Let us begin taking your medical history.');
    router.push('/history-capture');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      <ProgressStepper currentStep={3} />

      <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#e8f5f2] border border-[#a7d7cd] flex items-center justify-center text-[#004f45] shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-black text-[#004f45] uppercase tracking-wider">
                Patient Privacy & Security
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-0.5">
                Privacy & Data Consent
              </h2>
              <p className="text-sm font-semibold text-gray-500">
                गोपनीयता एवं डेटा उपयोग सहमति
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              speak(
                'We respect your privacy. We will record your voice, scan documents, and share history only with your hospital consulting doctor.'
              )
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-700 transition"
          >
            <Volume2 className="w-4 h-4 text-[#004f45]" />
            <span>Read Audio Consent</span>
          </button>
        </div>

        {/* Consent Clauses List */}
        <div className="space-y-4">
          
          <button
            type="button"
            onClick={() => setC1(!c1)}
            className={`w-full p-5 rounded-2xl border-2 text-left flex items-start gap-4 transition-all shadow-sm active:scale-99 ${
              c1 ? 'bg-[#f4fbf9] border-[#004f45]' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
            }`}
          >
            {c1 ? (
              <CheckSquare className="w-6 h-6 text-[#004f45] flex-shrink-0 mt-0.5" />
            ) : (
              <Square className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <p className="text-base font-bold text-gray-900">
                1. Voice Recording & Speech Analysis Consent
              </p>
              <p className="text-xs font-semibold text-gray-500 leading-relaxed">
                I agree to use voice recognition to speak my symptoms and health concerns.
              </p>
              <p className="text-xs text-gray-400 font-medium">
                मैं वॉइस रिकॉर्डिंग और लक्षण इतिहास कैप्चर करने की सहमति देता/देती हूँ।
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setC2(!c2)}
            className={`w-full p-5 rounded-2xl border-2 text-left flex items-start gap-4 transition-all shadow-sm active:scale-99 ${
              c2 ? 'bg-[#f4fbf9] border-[#004f45]' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
            }`}
          >
            {c2 ? (
              <CheckSquare className="w-6 h-6 text-[#004f45] flex-shrink-0 mt-0.5" />
            ) : (
              <Square className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <p className="text-base font-bold text-gray-900">
                2. Medical Document & Prescription Scanning
              </p>
              <p className="text-xs font-semibold text-gray-500 leading-relaxed">
                I authorize the system to extract past medications and lab values from my uploaded records.
              </p>
              <p className="text-xs text-gray-400 font-medium">
                मैं अपने पुराने पर्चे व रिपोर्ट फोटो खींचकर पढ़ने की अनुमति देता हूँ।
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setC3(!c3)}
            className={`w-full p-5 rounded-2xl border-2 text-left flex items-start gap-4 transition-all shadow-sm active:scale-99 ${
              c3 ? 'bg-[#f4fbf9] border-[#004f45]' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
            }`}
          >
            {c3 ? (
              <CheckSquare className="w-6 h-6 text-[#004f45] flex-shrink-0 mt-0.5" />
            ) : (
              <Square className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <p className="text-base font-bold text-gray-900">
                3. Direct Consultation Data Transfer to OPD Doctor
              </p>
              <p className="text-xs font-semibold text-gray-500 leading-relaxed">
                My health summary will be securely transferred to the hospital doctor for clinical consultation.
              </p>
              <p className="text-xs text-gray-400 font-medium">
                यह जानकारी केवल परामर्श दे रहे डॉक्टर के साथ साझा की जाएगी।
              </p>
            </div>
          </button>

        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleAgree}
            disabled={!allChecked}
            className="w-full py-4 px-8 rounded-2xl bg-[#004f45] hover:bg-[#00695c] text-white font-extrabold text-base sm:text-lg shadow-md transition-all active:scale-98 flex items-center justify-center gap-2.5 disabled:opacity-40 min-h-[56px]"
          >
            <span>I Agree & Continue / सहमति है, आगे बढ़ें</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Footer Note */}
        <div className="pt-2 flex items-center justify-center gap-2 text-xs font-semibold text-gray-400">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Compliant with Indian Digital Personal Data Protection (DPDP) Act.</span>
        </div>

      </div>
    </div>
  );
}
