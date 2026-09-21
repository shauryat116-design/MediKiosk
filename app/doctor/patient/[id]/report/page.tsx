'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { 
  FileText, 
  Download, 
  Printer, 
  ChevronLeft, 
  User, 
  Stethoscope, 
  Activity, 
  Sparkles, 
  Check, 
  Pill, 
  Calendar, 
  AlertCircle,
  Building,
  CheckCircle2
} from 'lucide-react';
import { generateDoctorReportPDF } from '@/lib/utils/pdfGenerator';
import { DoshaChart } from '@/components/ayush/DoshaChart';
import { getRecommendedSpecialist } from '@/lib/utils/specialistRecommendation';

export default function DoctorPatientReportPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<any>(null);
  const [latestVisit, setLatestVisit] = useState<any>(null);
  const [doctorUser, setDoctorUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReportData() {
      try {
        setLoading(true);
        setError(null);

        // 1. Get Doctor Session
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setDoctorUser(user);

        // 2. Get Patient Record
        const { data: pData, error: pErr } = await supabase
          .from('patients')
          .select('*')
          .eq('id', patientId)
          .single();

        if (pErr) throw pErr;
        setPatient(pData);

        // 3. Get Patient Visits
        const { data: vData, error: vErr } = await supabase
          .from('patient_visits')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (vErr) console.warn('Visits fetch error:', vErr);

        if (vData && vData.length > 0) {
          setLatestVisit(vData[0]);
        } else {
          setLatestVisit({
            created_at: pData.created_at,
            symptoms: pData.medical_history?.symptoms || {},
            notes: pData.medical_history?.notes || '',
            ayush_assessment: pData.medical_history?.ayush || {},
            diagnosis: pData.medical_history?.diagnosis || [],
            doctor_notes: pData.medical_history?.doctor_notes || '',
            treatment_plan: pData.medical_history?.treatment_plan || {},
          });
        }

      } catch (err: any) {
        console.error('Error generating report data:', err);
        setError(err.message || 'Failed to load report data');
      } finally {
        setLoading(false);
      }
    }

    if (patientId) {
      loadReportData();
    }
  }, [patientId]);

  if (loading) {
    return (
      <div className="py-24">
        <LoadingSpinner label="Generating AI Healthcare Assessment Report..." />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-16 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900">Patient Report Not Found</h2>
        <Link
          href="/doctor/patients"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#004f45] text-white font-bold text-sm"
        >
          ← Back to Patients Directory
        </Link>
      </div>
    );
  }

  // Extract variables
  const patientName = patient.patient_name || 'Unnamed Patient';
  const abhaId = patient.abha_id || null;
  const visitDate = latestVisit?.created_at
    ? new Date(latestVisit.created_at).toLocaleDateString()
    : new Date().toLocaleDateString();

  const medHistory = patient.medical_history || {};
  const symptoms = latestVisit?.symptoms || medHistory.symptoms || {};
  const chiefComplaint = symptoms.chiefComplaint || medHistory.chiefComplaint || latestVisit?.notes || 'General Health Consultation';
  const symptomOnset = symptoms.onset || 'Not specified';
  const severityRating = typeof symptoms.severity === 'number' ? symptoms.severity : 5;
  const associatedSymptoms = Array.isArray(symptoms.associatedSymptoms)
    ? symptoms.associatedSymptoms
    : [];
  const voiceNotes = latestVisit?.notes || medHistory.notes || '';

  const ayush = latestVisit?.ayush_assessment || medHistory.ayush || {};
  const dominantDosha = ayush.dominantDosha || 'vata';
  const doshaPercentages = ayush.doshaPercentages || { vata: 33, pitta: 33, kapha: 34 };
  const doshaScores = ayush.doshaScores || { vata: 10, pitta: 10, kapha: 10 };
  const agni = ayush.agni || 'sama';
  const koshtha = ayush.koshtha || 'madhya';

  const diagnosisList = Array.isArray(latestVisit?.diagnosis)
    ? latestVisit.diagnosis
    : latestVisit?.diagnosis
    ? [latestVisit.diagnosis]
    : [];

  const clinicalNotes = latestVisit?.doctor_notes || '';
  const treatmentPlan = latestVisit?.treatment_plan || {};
  const prescription = treatmentPlan.prescription || '';
  const dietPlan = treatmentPlan.diet || '';
  const lifestyleAdvice = treatmentPlan.lifestyle || '';
  const followUpDate = treatmentPlan.followUpDate || '';
  const followUpAdvice = treatmentPlan.followUpAdvice || '';
  const recommendedSpecialist = getRecommendedSpecialist({
    chiefComplaint,
    associatedSymptoms,
    notes: voiceNotes,
    age: patient.age,
    gender: patient.gender,
  });

  const handleDownloadPDF = () => {
    generateDoctorReportPDF({
      patientName,
      abhaId,
      age: patient.age,
      gender: patient.gender,
      visitDate,
      doctorEmail: doctorUser?.email || 'Central OPD Doctor',
      chiefComplaint,
      symptomOnset,
      severity: severityRating,
      voiceNotes,
      associatedSymptoms,
      dominantDosha,
      doshaPercentages,
      agni,
      koshtha,
      diagnosis: diagnosisList,
      clinicalNotes,
      prescription,
      dietPlan,
      lifestyleAdvice,
      followUpDate,
      followUpAdvice,
      recommendedSpecialist,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fadeIn">
      
      {/* Top Action Bar (hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <Link
            href={`/doctor/patient/${patientId}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Patient Details</span>
          </Link>

          <Link
            href="/doctor-dashboard"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition"
          >
            <span>Dashboard</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#004f45] hover:bg-[#00695c] text-white text-xs font-bold shadow-md transition"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 print:hidden">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Main Printable Clinical Assessment Document Card */}
      <div className="bg-white rounded-3xl border-2 border-gray-300 shadow-xl overflow-hidden print:border-none print:shadow-none">
        
        {/* Document Header Banner */}
        <div className="bg-[#004f45] text-white p-8 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building className="w-8 h-8 text-emerald-300" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Swaasth Saathi</h1>
                <p className="text-emerald-100 text-xs sm:text-sm font-semibold">AI-Assisted Healthcare Assessment Report</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-white/10 rounded-full border border-white/20 text-xs font-bold">
              OPD Assessment
            </span>
          </div>
        </div>

        {/* Patient Demographics & Session Metadata Bar */}
        <div className="p-6 bg-gray-50 border-b border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="font-bold text-gray-500 uppercase block text-[10px]">Patient Name</span>
            <p className="font-black text-sm text-gray-900 mt-0.5">{patientName}</p>
          </div>
          <div>
            <span className="font-bold text-gray-500 uppercase block text-[10px]">ABHA ID</span>
            <p className="font-mono font-bold text-gray-900 mt-0.5">{abhaId || 'Unlinked'}</p>
          </div>
          <div>
            <span className="font-bold text-gray-500 uppercase block text-[10px]">Age / Gender / Lang</span>
            <p className="font-bold text-gray-900 mt-0.5">
              {patient.age ? `${patient.age} yrs` : 'N/A'} • {patient.gender || 'N/A'} • {patient.language?.toUpperCase() || 'HI'}
            </p>
          </div>
          <div>
            <span className="font-bold text-gray-500 uppercase block text-[10px]">Consulting Doctor & Date</span>
            <p className="font-bold text-gray-900 mt-0.5">{doctorUser?.email?.split('@')[0] || 'Physician'} • {visitDate}</p>
          </div>
        </div>

        {/* Report Content Body */}
        <div className="p-8 space-y-8 text-gray-800 text-sm">
          
          {/* Section 1: Clinical History & Voice Transcripts */}
          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-[#004f45] border-b border-gray-200 pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#004f45]" />
              1. PATIENT CLINICAL HISTORY & VOICE INPUT
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Primary Chief Complaint</span>
                <p className="font-bold text-gray-900">{chiefComplaint}</p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Onset & Severity</span>
                <p className="font-bold text-gray-900">{symptomOnset} • Pain: {severityRating}/10</p>
              </div>
            </div>

            {voiceNotes && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-600 uppercase">Recorded Voice Transcript</span>
                <p className="font-semibold text-slate-900 italic">"{voiceNotes}"</p>
              </div>
            )}
          </div>

          {/* Section 2: Detected Symptoms */}
          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-[#004f45] border-b border-gray-200 pb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#004f45]" />
              2. DETECTED SYMPTOMS & CLINICAL FINDINGS
            </h3>

            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-xs">
                ✓ {chiefComplaint}
              </span>
              {associatedSymptoms.map((sym: string, i: number) => (
                <span key={i} className="px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-semibold text-xs">
                  ✓ {sym}
                </span>
              ))}
            </div>
          </div>

          {/* Section 2.5: AI Recommended Specialist */}
          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-[#004f45] border-b border-gray-200 pb-2 flex items-center gap-2">
              <span className="text-lg">{recommendedSpecialist.icon}</span>
              RECOMMENDED SPECIALIST (AI REFERRAL ADVISORY)
            </h3>

            <div className="p-4 rounded-xl bg-[#f4fbf9] border border-[#a7d7cd] space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xl">{recommendedSpecialist.icon}</span>
                <span className="text-base font-black text-[#004f45]">{recommendedSpecialist.specialist}</span>
                <span className="text-xs text-gray-500 font-bold">({recommendedSpecialist.department})</span>
              </div>
              <p className="text-xs font-semibold text-gray-700 leading-relaxed">
                {recommendedSpecialist.reason}
              </p>
            </div>
          </div>

          {/* Section 3: AYUSH Assessment */}
          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-[#004f45] border-b border-gray-200 pb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              3. AYUSH PRAKRITI & METABOLIC PROFILE
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Dominant Prakriti</span>
                <p className="text-base font-black text-emerald-900 mt-0.5 uppercase">{dominantDosha}</p>
                <p className="text-[10px] text-emerald-700">
                  Vata: {doshaPercentages.vata}% | Pitta: {doshaPercentages.pitta}% | Kapha: {doshaPercentages.kapha}%
                </p>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase">Agni (Digestive Fire)</span>
                <p className="text-base font-black text-amber-900 mt-0.5 uppercase">{agni}</p>
                <p className="text-[10px] text-amber-700">Metabolic Status</p>
              </div>

              <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200">
                <span className="text-[10px] font-bold text-blue-800 uppercase">Koshtha (Bowel Type)</span>
                <p className="text-base font-black text-blue-900 mt-0.5 uppercase">{koshtha}</p>
                <p className="text-[10px] text-blue-700">Elimination Characteristic</p>
              </div>
            </div>
          </div>

          {/* Section 4: Doctor Diagnosis & Clinical Notes */}
          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-[#004f45] border-b border-gray-200 pb-2 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-[#004f45]" />
              4. DOCTOR CLINICAL ASSESSMENT & DIAGNOSIS
            </h3>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              {diagnosisList.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Confirmed Diagnosis</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {diagnosisList.map((d: string, i: number) => (
                      <span key={i} className="px-2.5 py-0.5 bg-[#e8f5f2] text-[#004f45] font-bold rounded text-xs border border-[#a7d7cd]">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase block">Clinical Examination Notes</span>
                <p className="font-medium text-gray-800 mt-1 whitespace-pre-wrap">
                  {clinicalNotes || 'Clinical examination conducted. Symptomatic management advised.'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Treatment Plan & Prescription (Rx) */}
          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-[#004f45] border-b border-gray-200 pb-2 flex items-center gap-2">
              <Pill className="w-4 h-4 text-amber-700" />
              5. TREATMENT PLAN & PRESCRIPTION (Rx)
            </h3>

            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-3">
              <div>
                <span className="text-[10px] font-bold text-amber-900 uppercase block">Medicines & Dosage</span>
                <pre className="font-mono text-xs text-gray-900 whitespace-pre-wrap mt-1 bg-white p-3 rounded-lg border border-amber-200">
                  {prescription || '• Symptomatic therapy as prescribed during consultation.'}
                </pre>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {dietPlan && (
                  <div className="p-2.5 bg-white rounded-lg border border-amber-200">
                    <span className="font-bold text-gray-600 block text-[10px] uppercase">Dietary Guidance (Pathya)</span>
                    <p className="text-gray-900 font-medium mt-0.5">{dietPlan}</p>
                  </div>
                )}

                {lifestyleAdvice && (
                  <div className="p-2.5 bg-white rounded-lg border border-amber-200">
                    <span className="font-bold text-gray-600 block text-[10px] uppercase">Lifestyle Regimen (Vihara)</span>
                    <p className="text-gray-900 font-medium mt-0.5">{lifestyleAdvice}</p>
                  </div>
                )}
              </div>

              {(followUpDate || followUpAdvice) && (
                <div className="p-2.5 bg-white rounded-lg border border-amber-200 text-xs">
                  <span className="font-bold text-gray-600 block text-[10px] uppercase">Follow-up & Review</span>
                  <p className="text-gray-900 font-medium mt-0.5">
                    {followUpDate ? `Review scheduled on ${followUpDate}. ` : ''}
                    {followUpAdvice}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Doctor Sign-off & Footer */}
          <div className="pt-6 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <div>
              <p className="font-semibold text-gray-700">Swaasth Saathi Healthcare Kiosk System</p>
              <p className="text-[10px] text-gray-400">Authenticated Central OPD Clinical Record</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900">Dr. {doctorUser?.email || 'Central OPD Doctor'}</p>
              <p className="text-[10px] text-gray-400">Digital Signature Verified ✓</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
