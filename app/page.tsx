'use client';

import { useRouter } from 'next/navigation';
import { Stethoscope, User, ShieldCheck, Activity, ArrowRight, HeartPulse } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f4fbf9] via-white to-[#edf7f5] flex flex-col justify-between p-6 sm:p-10">
      
      {/* Top Hospital Branding Bar */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#004f45] flex items-center justify-center text-white shadow-md">
            <HeartPulse className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none">
              Swaasth Saathi
            </h2>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">
              AYUSH Hospital Smart OPD Kiosk System
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-gray-200 shadow-sm text-xs font-bold text-gray-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>ABDM & Ayushman Bharat Compliant</span>
        </div>
      </header>

      {/* Main Welcome & Role Selection Area */}
      <div className="w-full max-w-4xl mx-auto my-auto py-8 text-center space-y-10">
        
        {/* Title Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#e8f5f2] border border-[#a7d7cd] text-[#004f45] text-xs font-extrabold tracking-wide uppercase">
            <Activity className="w-3.5 h-3.5" />
            <span>AI-Assisted Patient Pre-Consultation</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
            Welcome to Swaasth Saathi
          </h1>
          <p className="text-xl sm:text-2xl font-bold text-emerald-800">
            स्वास्थ्य साथी • आपका डिजिटल स्वास्थ्य सहायक
          </p>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto font-medium">
            Please tap below to start your OPD health intake or access the consulting physician portal.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-left">
          
          {/* Patient Card (Primary Kiosk Workflow) */}
          <button
            onClick={() => router.push('/abha-login')}
            className="group relative bg-white rounded-3xl border-2 border-emerald-300 p-8 shadow-lg hover:shadow-2xl hover:border-[#004f45] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[300px]"
          >
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#e8f5f2] text-[#004f45] flex items-center justify-center shadow-inner group-hover:bg-[#004f45] group-hover:text-white transition-colors duration-300">
                <User className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">Patient Journey</span>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 group-hover:text-[#004f45] transition-colors">
                  Patient / मरीज
                </h2>
                <p className="text-sm text-gray-600 font-medium mt-2 leading-relaxed">
                  Start your OPD intake using your ABHA ID, speak your symptoms in your native language, and complete your AYUSH Prakriti evaluation.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex items-center justify-between text-sm font-bold text-[#004f45]">
              <span>Start Assessment (शुरू करें)</span>
              <div className="w-10 h-10 rounded-xl bg-[#e8f5f2] group-hover:bg-[#004f45] group-hover:text-white flex items-center justify-center transition-colors">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </button>

          {/* Doctor Card */}
          <button
            onClick={() => router.push('/doctor-login')}
            className="group relative bg-white rounded-3xl border-2 border-blue-200 p-8 shadow-lg hover:shadow-2xl hover:border-blue-600 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[300px]"
          >
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <Stethoscope className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700">Physician Access</span>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 group-hover:text-blue-700 transition-colors">
                  Doctor / चिकित्सक
                </h2>
                <p className="text-sm text-gray-600 font-medium mt-2 leading-relaxed">
                  Log in to inspect pre-captured patient histories, voice transcripts, AYUSH Dosha assessments, and formulate clinical prescriptions.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex items-center justify-between text-sm font-bold text-blue-700">
              <span>Doctor Portal Login</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </button>

        </div>

        {/* Quick Portal Navigation */}
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-500 pt-1">
          <span>Already completed intake?</span>
          <button
            onClick={() => router.push('/patient-dashboard')}
            className="text-[#004f45] hover:text-[#00695c] hover:underline flex items-center gap-1 font-black"
          >
            <span>View Doctor Prescription / मरीज पोर्टल</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Footer Credentials */}
      <footer className="max-w-4xl w-full mx-auto pt-6 border-t border-gray-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2">
        <p>© 2026 Swaasth Saathi • National AYUSH Digital Mission</p>
        <p className="font-semibold text-gray-500">Secure • Multilingual Voice • Privacy Protected</p>
      </footer>

    </main>
  );
}
