'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { useHistoryStore } from '@/lib/stores/historyStore';
import { useAyushStore } from '@/lib/stores/ayushStore';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { generateDoctorReportPDF, generateSummaryPDF } from '@/lib/utils/pdfGenerator';
import { getRecommendedSpecialist } from '@/lib/utils/specialistRecommendation';
import {
  User,
  ShieldCheck,
  Stethoscope,
  Pill,
  Calendar,
  FileText,
  Download,
  Printer,
  RefreshCw,
  Clock,
  Sparkles,
  Activity,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Home,
  Utensils,
  Sun,
  Flame,
} from 'lucide-react';

export default function PatientDashboardPage() {
  const router = useRouter();
  const session = useSessionStore();
  const historyStore = useHistoryStore();
  const ayushStore = useAyushStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [patientRecord, setPatientRecord] = useState<any>(null);
  const [latestVisit, setLatestVisit] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const abhaId = session.abhaId || session.patient?.abhaId || (session as any).patient?.abha_id;
  const sessionPatientName =
    session.patientName ||
    session.patient?.name ||
    (session as any).patient?.patient_name ||
    'Rahul Sharma';

  const tokenNumber = session.tokenNumber || 'A - 245';

  async function loadPatientData() {
    try {
      setErrorMsg(null);
      let foundPatient: any = null;

      // 1. Try finding patient by ABHA ID if available
      if (abhaId) {
        const { data: pData, error: pErr } = await supabase
          .from('patients')
          .select('*')
          .eq('abha_id', abhaId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (pErr) console.warn('ABHA patient lookup error:', pErr);
        if (pData) foundPatient = pData;
      }

      // 2. Fallback: Lookup by patient name if not found by ABHA
      if (!foundPatient && sessionPatientName) {
        const { data: pNameData, error: pNameErr } = await supabase
          .from('patients')
          .select('*')
          .eq('patient_name', sessionPatientName)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (pNameErr) console.warn('Name patient lookup error:', pNameErr);
        if (pNameData) foundPatient = pNameData;
      }

      // 3. Fallback: Get most recent patient record in kiosk
      if (!foundPatient) {
        const { data: recentPatients } = await supabase
          .from('patients')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        if (recentPatients && recentPatients.length > 0) {
          foundPatient = recentPatients[0];
        }
      }

      setPatientRecord(foundPatient);

      // 4. Fetch latest visit for this patient
      if (foundPatient?.id) {
        const { data: visits, error: vErr } = await supabase
          .from('patient_visits')
          .select('*')
          .eq('patient_id', foundPatient.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (vErr) console.warn('Visits fetch error:', vErr);

        if (visits && visits.length > 0) {
          setLatestVisit(visits[0]);
        } else if (foundPatient.medical_history) {
          setLatestVisit({
            created_at: foundPatient.created_at,
            symptoms: foundPatient.medical_history?.symptoms || {},
            notes: foundPatient.medical_history?.notes || '',
            ayush_assessment: foundPatient.medical_history?.ayush || {},
            diagnosis: foundPatient.medical_history?.diagnosis || [],
            doctor_notes: foundPatient.medical_history?.doctor_notes || '',
            treatment_plan: foundPatient.medical_history?.treatment_plan || {},
          });
        }
      }
    } catch (err: any) {
      console.error('Error loading patient dashboard:', err);
      setErrorMsg(err.message || 'Failed to load patient records from database.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadPatientData();
  }, [abhaId, sessionPatientName]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadPatientData();
  };

  // Derive Patient & Doctor Fields
  const patientDisplayName =
    patientRecord?.patient_name || sessionPatientName || 'Rahul Sharma';
  const displayAbhaId =
    patientRecord?.abha_id || abhaId || 'Unlinked';
  const displayAge =
    patientRecord?.age || session.age || 58;
  const displayGender =
    patientRecord?.gender || session.gender || 'male';

  const medHistory = patientRecord?.medical_history || {};
  const symptoms = latestVisit?.symptoms || medHistory.symptoms || historyStore.symptoms || {};
  const chiefComplaint =
    symptoms.chiefComplaint ||
    medHistory.chiefComplaint ||
    historyStore.chiefComplaint ||
    latestVisit?.notes ||
    'General Health Consultation';
  const symptomOnset = symptoms.onset || historyStore.symptoms?.onset || 'Not specified';
  const severityRating =
    typeof symptoms.severity === 'number'
      ? symptoms.severity
      : typeof historyStore.symptoms?.severity === 'number'
      ? historyStore.symptoms.severity
      : 5;
  const associatedSymptoms = Array.isArray(symptoms.associatedSymptoms)
    ? symptoms.associatedSymptoms
    : Array.isArray(historyStore.symptoms?.associatedSymptoms)
    ? historyStore.symptoms.associatedSymptoms
    : [];

  const voiceNotes =
    latestVisit?.notes || medHistory.notes || historyStore.notes || '';

  // AYUSH Data
  const ayush = latestVisit?.ayush_assessment || medHistory.ayush || ayushStore || {};
  const dominantDosha = ayush.dominantDosha || ayushStore.dominantDosha || 'vata';
  const doshaPercentages = ayush.doshaPercentages || ayushStore.doshaPercentages || { vata: 33, pitta: 33, kapha: 34 };
  const agni = ayush.agni || ayushStore.agni || 'sama';
  const koshtha = ayush.koshtha || ayushStore.koshtha || 'madhya';

  // Specialist Recommendation
  const recommendedSpecialist = getRecommendedSpecialist({
    chiefComplaint,
    associatedSymptoms,
    notes: voiceNotes,
    age: displayAge,
    gender: displayGender,
  });

  // Doctor Review Data
  const treatmentPlan = latestVisit?.treatment_plan || medHistory.treatment_plan || {};
  const prescription = treatmentPlan.prescription || '';
  const clinicalNotes = latestVisit?.doctor_notes || medHistory.doctor_notes || '';
  const diagnosisList = Array.isArray(latestVisit?.diagnosis)
    ? latestVisit.diagnosis
    : latestVisit?.diagnosis
    ? [latestVisit.diagnosis]
    : Array.isArray(medHistory.diagnosis)
    ? medHistory.diagnosis
    : [];

  const dietPlan = treatmentPlan.diet || '';
  const lifestyleAdvice = treatmentPlan.lifestyle || '';
  const followUpDate = treatmentPlan.followUpDate || '';
  const followUpAdvice = treatmentPlan.followUpAdvice || '';

  const hasDoctorReport = Boolean(
    prescription.trim() ||
    clinicalNotes.trim() ||
    (diagnosisList && diagnosisList.length > 0)
  );

  const visitDate = latestVisit?.created_at
    ? new Date(latestVisit.created_at).toLocaleDateString()
    : new Date().toLocaleDateString();

  // Download Doctor Final Report PDF
  const handleDownloadDoctorReport = () => {
    generateDoctorReportPDF({
      patientName: patientDisplayName,
      abhaId: displayAbhaId,
      age: displayAge,
      gender: displayGender,
      visitDate,
      doctorEmail: latestVisit?.doctor_id || 'Central OPD Doctor',
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

  // Download Patient Pre-Consultation Summary PDF
  const handleDownloadPreConsultationSummary = () => {
    generateSummaryPDF({
      tokenNumber,
      patientName: patientDisplayName,
      abhaId: displayAbhaId,
      age: displayAge,
      gender: displayGender,
      language: session.language || 'hi',
      sessionId: session.sessionId || 'SS-Active',
      history: {
        chiefComplaint,
        symptoms: {
          chiefComplaint,
          onset: symptomOnset,
          severity: severityRating,
          associatedSymptoms,
          medicationsTried: '',
          reliefAchieved: null,
        },
        pastMedicalHistory: medHistory.pastMedicalHistory || historyStore.pastMedicalHistory || [],
        medications: medHistory.medications || historyStore.medications || [],
        allergies: medHistory.allergies || historyStore.allergies || [],
        familyHistory: medHistory.familyHistory || historyStore.familyHistory || {},
        socialHistory: medHistory.socialHistory || historyStore.socialHistory || { smoking: false, alcohol: false, exercise: '' },
        notes: voiceNotes,
      },
      ayush: {
        dominantDosha,
        prakritiResponses: ayush.prakritiResponses || {},
        doshaScores: ayush.doshaScores || { vata: 10, pitta: 10, kapha: 10 },
        doshaPercentages,
        agni,
        koshtha,
        recommendations: ayush.recommendations || { diet: [], lifestyle: [], herbs: [] },
      },
      recommendedSpecialist,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7faf8] flex items-center justify-center p-6">
        <LoadingSpinner label="Loading Patient Health Portal..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7faf8] flex flex-col">
      {/* Patient Portal Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-[#004f45] flex items-center justify-center text-white shadow-sm group-hover:bg-[#00695c] transition">
                <User className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h1 className="text-lg font-black text-gray-900 tracking-tight leading-none">
                  Patient Health Portal
                </h1>
                <p className="text-[11px] font-bold text-gray-500 mt-0.5">
                  मरीज स्वास्थ्य पोर्टल • Swaasth Saathi
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-700 transition"
              title="Refresh Prescription Status"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#004f45] ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Status</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#004f45] hover:bg-[#00695c] text-white text-xs font-bold shadow-sm transition"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kiosk Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Top Patient Profile Card */}
        <div className="bg-gradient-to-r from-[#004f45] to-[#00695c] rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-bold text-emerald-100">
                Token Number: {tokenNumber}
              </span>
              {hasDoctorReport ? (
                <span className="px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-300 text-xs font-black text-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Prescription Ready
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300 text-xs font-bold text-amber-200 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Consultation Pending
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {patientDisplayName}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-100 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                ABHA: <span className="font-mono text-white">{displayAbhaId}</span>
              </span>
              <span>•</span>
              <span>{displayAge} yrs • {displayGender.toUpperCase()}</span>
              <span>•</span>
              <span>OPD Room 4 Central Clinic</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadPreConsultationSummary}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition"
            >
              <FileText className="w-4 h-4" />
              <span>Pre-Intake Summary</span>
            </button>

            {hasDoctorReport && (
              <button
                onClick={handleDownloadDoctorReport}
                className="inline-flex items-center gap-2 bg-white text-[#004f45] hover:bg-emerald-50 px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition"
              >
                <Download className="w-4 h-4" />
                <span>Download Doctor Prescription (PDF)</span>
              </button>
            )}
          </div>
        </div>

        {/* ────────────────────────────────────────── */}
        {/* DOCTOR'S FINAL REPORT / PRESCRIPTION SECTION */}
        {/* ────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border-2 border-emerald-500/30 shadow-md p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#e8f5f2] border border-[#a7d7cd] flex items-center justify-center text-[#004f45]">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-black text-[#004f45] uppercase tracking-wider">
                  Physician Consultation & Treatment Plan
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                  Doctor's Final Report & Prescription / डॉक्टर का अंतिम पर्चा
                </h3>
              </div>
            </div>

            {hasDoctorReport && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-300 text-xs font-bold text-gray-700 transition"
                >
                  <Printer className="w-3.5 h-3.5 text-gray-500" />
                  <span>Print</span>
                </button>

                <button
                  onClick={handleDownloadDoctorReport}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#004f45] hover:bg-[#00695c] text-white text-xs font-extrabold shadow-sm transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Official PDF</span>
                </button>
              </div>
            )}
          </div>

          {hasDoctorReport ? (
            <div className="space-y-6">
              {/* Doctor Metadata Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#004f45] text-white flex items-center justify-center font-bold text-xs">
                    Dr
                  </div>
                  <div>
                    <span className="font-bold text-gray-600 block">Consulting Physician:</span>
                    <span className="font-extrabold text-[#004f45] text-sm">
                      Dr. {latestVisit?.doctor_id || 'Physician In-Charge'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-gray-600 font-semibold">
                  <span>Encounter Date: <strong className="text-gray-900">{visitDate}</strong></span>
                  <span>•</span>
                  <span className="text-emerald-800 font-bold">Status: Reviewed & Finalized ✓</span>
                </div>
              </div>

              {/* Confirmed Diagnosis */}
              {diagnosisList && diagnosisList.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wide block">
                    Confirmed Clinical Diagnosis (रोग निदान):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {diagnosisList.map((d: string, i: number) => (
                      <span
                        key={i}
                        className="px-3.5 py-1.5 rounded-xl bg-[#e8f5f2] border border-[#a7d7cd] text-[#004f45] font-black text-xs"
                      >
                        ✓ {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Doctor Examination Notes */}
              {clinicalNotes && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide block">
                    Doctor Clinical Remarks / चिकित्सीय टिप्पणी:
                  </span>
                  <p className="text-sm font-semibold text-slate-900 whitespace-pre-wrap leading-relaxed">
                    {clinicalNotes}
                  </p>
                </div>
              )}

              {/* Final Prescription & Medicines (Rx) */}
              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex items-center gap-2 border-b border-amber-200/80 pb-2">
                  <Pill className="w-5 h-5 text-amber-700" />
                  <span className="text-sm font-black text-amber-950 uppercase tracking-wide">
                    Prescribed Medicines & Dosage (औषधियां व सेवन विधि - Rx):
                  </span>
                </div>

                {prescription ? (
                  <pre className="font-mono text-sm font-bold text-gray-900 whitespace-pre-wrap bg-white p-4 rounded-xl border border-amber-200 leading-relaxed">
                    {prescription}
                  </pre>
                ) : (
                  <p className="text-xs text-gray-600 italic bg-white p-3 rounded-lg border border-amber-200">
                    Symptomatic therapy as advised during physical consultation.
                  </p>
                )}
              </div>

              {/* Dietary (Pathya) & Lifestyle (Vihara) Cards */}
              {(dietPlan || lifestyleAdvice) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {dietPlan && (
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
                      <span className="text-xs font-bold text-emerald-900 uppercase flex items-center gap-1.5">
                        <Utensils className="w-4 h-4 text-emerald-700" />
                        Dietary Guidance / पथ्य (खानपान सलाह)
                      </span>
                      <p className="text-xs font-semibold text-gray-800 leading-relaxed">
                        {dietPlan}
                      </p>
                    </div>
                  )}

                  {lifestyleAdvice && (
                    <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-1.5">
                      <span className="text-xs font-bold text-blue-900 uppercase flex items-center gap-1.5">
                        <Sun className="w-4 h-4 text-blue-700" />
                        Lifestyle Regimen / विहार (दिनचर्या सलाह)
                      </span>
                      <p className="text-xs font-semibold text-gray-800 leading-relaxed">
                        {lifestyleAdvice}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Follow-up Review Notice */}
              {(followUpDate || followUpAdvice) && (
                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 flex items-start gap-3 text-xs font-semibold text-purple-900">
                  <Calendar className="w-5 h-5 text-purple-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-sm">Next Follow-up & Review (पुनः परामर्श):</span>
                    <p className="mt-0.5">
                      {followUpDate ? `Review scheduled on ${followUpDate}. ` : ''}
                      {followUpAdvice || 'Please return with reports if symptoms persist.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-bold text-gray-900">
                  No doctor report available yet
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Your OPD pre-intake has been submitted and is in the queue for Dr. review in OPD Room 4. Once your physician finalizes your prescription, it will appear here automatically.
                </p>
              </div>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#004f45] hover:bg-[#00695c] text-white text-xs font-bold shadow-sm transition"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Checking...' : 'Check for Updates / रीफ्रेश करें'}</span>
              </button>
            </div>
          )}
        </div>

        {/* ────────────────────────────────────────── */}
        {/* PRE-CONSULTATION SUMMARY (SUBMITTED HISTORY) */}
        {/* ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Reported Symptoms & Voice Notes */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#004f45]" />
                Submitted Symptoms & Voice Notes
              </h3>
              <span className="text-xs font-bold text-gray-400">Recorded at Kiosk</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                <span className="font-bold text-gray-500 uppercase text-[10px] block">Primary Complaint:</span>
                <p className="text-sm font-extrabold text-gray-900 mt-0.5">"{chiefComplaint}"</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="font-bold text-gray-500 uppercase text-[10px] block">Onset:</span>
                  <span className="font-bold text-gray-900">{symptomOnset}</span>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="font-bold text-gray-500 uppercase text-[10px] block">Severity:</span>
                  <span className="font-bold text-gray-900">{severityRating} / 10</span>
                </div>
              </div>

              {associatedSymptoms.length > 0 && (
                <div className="space-y-1">
                  <span className="font-bold text-gray-500 uppercase text-[10px] block">Associated Symptoms:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {associatedSymptoms.map((sym: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-bold text-xs">
                        ✓ {sym}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {voiceNotes && voiceNotes !== chiefComplaint && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-600 uppercase text-[10px] block">Voice Transcript:</span>
                  <p className="font-medium text-slate-900 italic">"{voiceNotes}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: AYUSH Prakriti & Recommended Specialist */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                AYUSH Profile & Referral Advisory
              </h3>
              <span className="text-xs font-bold text-emerald-800 uppercase">
                {dominantDosha} Prakriti
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="font-bold text-emerald-800 text-[10px] uppercase block">Vata</span>
                  <span className="font-black text-emerald-950 text-sm">{doshaPercentages.vata}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="font-bold text-amber-800 text-[10px] uppercase block">Pitta</span>
                  <span className="font-black text-amber-950 text-sm">{doshaPercentages.pitta}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                  <span className="font-bold text-blue-800 text-[10px] uppercase block">Kapha</span>
                  <span className="font-black text-blue-950 text-sm">{doshaPercentages.kapha}%</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <span className="font-bold text-emerald-900 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> Agni: {agni.toUpperCase()}
                </span>
                <span className="font-bold text-emerald-900">
                  Koshtha: {koshtha.toUpperCase()}
                </span>
              </div>

              {/* Specialist Referral Card */}
              {recommendedSpecialist && (
                <div className="p-3.5 rounded-xl bg-[#f4fbf9] border border-[#a7d7cd] space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{recommendedSpecialist.icon}</span>
                    <span className="font-black text-[#004f45] text-sm">{recommendedSpecialist.specialist}</span>
                    <span className="text-[10px] text-gray-500 font-bold">({recommendedSpecialist.department})</span>
                  </div>
                  <p className="text-[11px] text-gray-700 font-medium">
                    {recommendedSpecialist.reason}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Actions Banner */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 border-t border-gray-200">
          <p>
            Logged in via ABHA: <strong className="text-gray-900 font-mono">{displayAbhaId}</strong> • National AYUSH Digital Mission
          </p>

          <div className="flex items-center gap-3">
            <Link
              href="/abha-login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold transition"
            >
              <span>Switch ABHA ID</span>
            </Link>

            <button
              onClick={handleDownloadPreConsultationSummary}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#004f45] hover:bg-[#00695c] text-white font-bold transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Intake PDF</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
