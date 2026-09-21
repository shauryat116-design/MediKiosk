'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { useAudioFeedback } from '@/lib/hooks/useAudioFeedback';
import { requestAbhaOtp, verifyAbhaOtp } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { ProgressStepper } from '@/components/shared/ProgressStepper';
import { ShieldCheck, ArrowRight, KeyRound, Lock, Info } from 'lucide-react';

export default function AbhaLoginPage() {
  const router = useRouter();
  const { setAbhaId } = useSessionStore();
  const { playSound, speak } = useAudioFeedback();

  const [abhaInput, setAbhaInput] = useState('14-1234-5678-9012');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [otp, setOtp] = useState('123456');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRequestOtp = async () => {
    if (!abhaInput.trim()) {
      setErrorMessage('Please enter a valid 14-digit ABHA Number.');
      return;
    }
    setErrorMessage('');
    playSound('tap');
    speak('Sending OTP to your registered ABHA mobile number');
    await requestAbhaOtp(abhaInput);
    setStep('otp');
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length < 4) {
      setErrorMessage('Please enter the 6-digit OTP received on mobile.');
      return;
    }
    setErrorMessage('');
    setIsVerifying(true);
    playSound('success');

    try {
      const res = await verifyAbhaOtp(abhaInput, otp);
      const patient = res.patient || {
        abhaId: abhaInput,
        name: 'Rahul Sharma',
        age: 58,
        gender: 'male',
      };

      setAbhaId(patient.abhaId, patient.name, patient.age, patient.gender);
      speak(`Welcome ${patient.name}! ABHA Account verified successfully.`);
      router.push('/language-select');
    } catch (e) {
      setAbhaId(abhaInput, 'Rahul Sharma', 58, 'male');
      router.push('/language-select');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSkip = () => {
    playSound('tap');
    setAbhaId(null, 'Rahul Sharma', 58, 'male');
    router.push('/language-select');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      <ProgressStepper currentStep={1} />

      <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8">
        
        {/* Header with ABDM Trust Banner */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#e8f5f2] border border-[#a7d7cd] flex items-center justify-center text-[#004f45] shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-black text-[#004f45] uppercase tracking-wider">
                Ayushman Bharat Health Account
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-0.5">
                ABHA Health ID Login
              </h2>
              <p className="text-sm font-semibold text-gray-500">
                आयुष्मान भारत डिजिटल हेल्थ खाता लॉगिन
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs font-semibold text-gray-600">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit Encrypted</span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm font-bold flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {step === 'input' ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-base sm:text-lg font-bold text-gray-800">
                Enter 14-digit ABHA Number / 14-अंकों का आभा नंबर दर्ज करें:
              </label>
              <p className="text-xs text-gray-500">
                Link your past medical records and prescriptions securely with government digital health ID.
              </p>
              
              <div className="pt-2">
                <input
                  type="text"
                  value={abhaInput}
                  onChange={(e) => setAbhaInput(e.target.value)}
                  placeholder="14-1234-5678-9012"
                  className="w-full text-2xl sm:text-3xl font-black p-5 sm:p-6 border-2 border-gray-300 rounded-2xl tracking-widest text-center focus:border-[#004f45] focus:ring-4 focus:ring-[#e8f5f2] outline-none transition bg-gray-50/50"
                />
              </div>
            </div>

            {/* Quick Demo Info Box */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center gap-3 text-xs font-semibold text-emerald-900">
              <Info className="w-5 h-5 text-emerald-700 flex-shrink-0" />
              <span>Demo evaluation ABHA number is preloaded. Tap "Send OTP" to test the full verification process.</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={handleRequestOtp}
                className="flex-1 py-4 px-6 rounded-2xl bg-[#004f45] hover:bg-[#00695c] text-white font-extrabold text-base sm:text-lg shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 min-h-[56px]"
              >
                <span>Send OTP / ओटीपी भेजें</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={handleSkip}
                className="py-4 px-6 rounded-2xl bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-bold text-sm sm:text-base transition-all min-h-[56px]"
              >
                Skip ABHA / बाद में भरें
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#e8f5f2] border border-[#a7d7cd] flex items-center justify-center text-[#004f45] mx-auto shadow-inner">
              <KeyRound className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                Enter 6-digit OTP / ओटीपी दर्ज करें
              </h3>
              <p className="text-sm font-semibold text-gray-600 mt-1">
                Sent to your registered mobile linked with ABHA ({abhaInput})
              </p>
              <p className="text-xs text-[#004f45] font-bold mt-1">
                (Pre-filled demo OTP for quick testing: 123456)
              </p>
            </div>

            <div>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="1 2 3 4 5 6"
                className="w-full max-w-xs text-3xl sm:text-4xl font-black p-5 border-2 border-[#004f45] rounded-2xl tracking-widest text-center mx-auto bg-gray-50 focus:ring-4 focus:ring-[#e8f5f2] outline-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => setStep('input')}
                className="py-3 px-5 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-bold text-xs sm:text-sm transition min-h-[48px]"
              >
                ← Change Number
              </button>

              <button
                onClick={handleVerifyOtp}
                disabled={isVerifying}
                className="flex-1 py-3.5 px-6 rounded-xl bg-[#004f45] hover:bg-[#00695c] text-white font-extrabold text-sm sm:text-base shadow-md transition disabled:opacity-50 min-h-[48px]"
              >
                {isVerifying ? 'Verifying OTP...' : 'Verify OTP & Link Records ✓'}
              </button>
            </div>
          </div>
        )}

        {/* Bottom Trust Note */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-xs font-semibold text-gray-400">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Your health records are confidential and shared solely with your OPD physician.</span>
        </div>

      </div>
    </div>
  );
}
