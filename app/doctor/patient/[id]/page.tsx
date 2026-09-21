'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { 
  User, 
  ChevronLeft, 
  Calendar, 
  Stethoscope, 
  Activity, 
  Sparkles, 
  Mic, 
  FileText, 
  Check, 
  Save, 
  AlertCircle, 
  Clock, 
  Flame, 
  Plus, 
  Trash2,
  Pill,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { DoshaChart } from '@/components/ayush/DoshaChart';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  const [visits, setVisits] = useState<any[]>([]);
  const [selectedVisitIndex, setSelectedVisitIndex] = useState(0);
  const [doctorUser, setDoctorUser] = useState<any>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Doctor Clinical Notes & Diagnosis State
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [diagnosisInput, setDiagnosisInput] = useState('');
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [followUpAdvice, setFollowUpAdvice] = useState('');

  // Treatment Plan & Prescription State
  const [prescriptionText, setPrescriptionText] = useState('');
  const [dietPlan, setDietPlan] = useState('');
  const [lifestyleAdvice, setLifestyleAdvice] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  useEffect(() => {
    async function loadPatientDetails() {
      try {
        setLoading(true);
        setFeedbackMsg(null);

        // 1. Get authenticated doctor
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setDoctorUser(user);

        // 2. Fetch Patient Record
        const { data: patientData, error: pError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', patientId)
          .single();

        if (pError) throw pError;
        setPatient(patientData);

        // 3. Fetch Patient Visits
        const { data: visitsData, error: vError } = await supabase
          .from('patient_visits')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false });

        if (vError) {
          console.warn('Error loading visits:', vError);
        }

        const visitList = visitsData && visitsData.length > 0 ? visitsData : [
          {
            id: 'default-visit',
            patient_id: patientId,
            created_at: patientData.created_at,
            symptoms: patientData.medical_history?.symptoms || {},
            notes: patientData.medical_history?.notes || '',
            ayush_assessment: patientData.medical_history?.ayush || {},
            diagnosis: [],
            doctor_notes: '',
            treatment_plan: {},
          }
        ];

        setVisits(visitList);

        // Load active visit values into doctor editor forms
        const activeV = visitList[0];
        if (activeV) {
          setClinicalNotes(activeV.doctor_notes || '');
          setDiagnosisInput(
            Array.isArray(activeV.diagnosis)
              ? activeV.diagnosis.join(', ')
              : activeV.diagnosis || ''
          );
          setPrescriptionText(activeV.treatment_plan?.prescription || '');
          setDietPlan(activeV.treatment_plan?.diet || '');
          setLifestyleAdvice(activeV.treatment_plan?.lifestyle || '');
          setFollowUpDate(activeV.treatment_plan?.followUpDate || '');
          setAdditionalInstructions(activeV.treatment_plan?.additionalInstructions || '');
          setTreatmentNotes(activeV.treatment_plan?.treatmentNotes || '');
          setFollowUpAdvice(activeV.treatment_plan?.followUpAdvice || '');
        }

      } catch (err: any) {
        console.error('Error loading patient details:', err);
        setFeedbackMsg({ type: 'error', text: err.message || 'Failed to load patient record' });
      } finally {
        setLoading(false);
      }
    }

    if (patientId) {
      loadPatientDetails();
    }
  }, [patientId]);

  const currentVisit = visits[selectedVisitIndex] || visits[0];

  // When switching visits, update editor fields
  const handleSelectVisit = (idx: number) => {
    setSelectedVisitIndex(idx);
    const v = visits[idx];
    if (v) {
      setClinicalNotes(v.doctor_notes || '');
      setDiagnosisInput(
        Array.isArray(v.diagnosis) ? v.diagnosis.join(', ') : v.diagnosis || ''
      );
      setPrescriptionText(v.treatment_plan?.prescription || '');
      setDietPlan(v.treatment_plan?.diet || '');
      setLifestyleAdvice(v.treatment_plan?.lifestyle || '');
      setFollowUpDate(v.treatment_plan?.followUpDate || '');
      setAdditionalInstructions(v.treatment_plan?.additionalInstructions || '');
      setTreatmentNotes(v.treatment_plan?.treatmentNotes || '');
      setFollowUpAdvice(v.treatment_plan?.followUpAdvice || '');
    }
  };

  // Save Doctor Notes & Treatment Plan to Supabase
  async function handleSaveDoctorPlan(e: React.FormEvent) {
    e.preventDefault();
    if (!currentVisit || !currentVisit.id) return;

    try {
      setSaving(true);
      setFeedbackMsg(null);

      const diagnosisArray = diagnosisInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const treatmentPlanObj = {
        prescription: prescriptionText,
        diet: dietPlan,
        lifestyle: lifestyleAdvice,
        followUpDate: followUpDate,
        additionalInstructions: additionalInstructions,
        treatmentNotes: treatmentNotes,
        followUpAdvice: followUpAdvice,
        updatedAt: new Date().toISOString(),
      };

      if (currentVisit.id !== 'default-visit') {
        const { error: updateError } = await supabase
          .from('patient_visits')
          .update({
            doctor_notes: clinicalNotes,
            diagnosis: diagnosisArray,
            treatment_plan: treatmentPlanObj,
            doctor_id: doctorUser?.id || null,
          })
          .eq('id', currentVisit.id);

        if (updateError) {
          console.warn('Update fallback attempting...', updateError);
          await supabase
            .from('patient_visits')
            .update({
              notes: clinicalNotes,
              diagnosis: diagnosisArray,
            })
            .eq('id', currentVisit.id);
        }
      } else {
        // Insert new visit record if none existed
        const { data: newVisit, error: insertError } = await supabase
          .from('patient_visits')
          .insert({
            patient_id: patientId,
            symptoms: patient.medical_history?.symptoms || {},
            notes: patient.medical_history?.notes || null,
            ayush_assessment: patient.medical_history?.ayush || {},
            doctor_notes: clinicalNotes,
            diagnosis: diagnosisArray,
            treatment_plan: treatmentPlanObj,
            doctor_id: doctorUser?.id || null,
          })
          .select('*')
          .single();

        if (newVisit) {
          currentVisit.id = newVisit.id;
        }
      }

      // Also update patient's medical_history for quick sync
      await supabase
        .from('patients')
        .update({
          medical_history: {
            ...(patient.medical_history || {}),
            doctor_notes: clinicalNotes,
            diagnosis: diagnosisArray,
            treatment_plan: treatmentPlanObj,
            doctor_id: doctorUser?.id || null,
          },
        })
        .eq('id', patientId);

      // Update local state
      const updatedVisits = [...visits];
      updatedVisits[selectedVisitIndex] = {
        ...currentVisit,
        doctor_notes: clinicalNotes,
        diagnosis: diagnosisArray,
        treatment_plan: treatmentPlanObj,
        doctor_id: doctorUser?.id || null,
      };
      setVisits(updatedVisits);

      setFeedbackMsg({ type: 'success', text: 'Doctor Clinical Notes & Treatment Plan saved successfully to Supabase!' });
    } catch (err: any) {
      console.error('Error saving doctor assessment:', err);
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to save treatment plan.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-24">
        <LoadingSpinner label="Loading Clinical Patient Record..." />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-16 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900">Patient Not Found</h2>
        <p className="text-sm text-gray-500">The requested patient ID does not exist or has been removed.</p>
        <Link
          href="/doctor/patients"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#004f45] text-white font-bold text-sm"
        >
          ← Back to Patients List
        </Link>
      </div>
    );
  }

  // Extract medical history & symptoms
  const medHistory = patient.medical_history || {};
  const visitSymptoms = currentVisit?.symptoms || medHistory.symptoms || {};
  const chiefComplaint = visitSymptoms.chiefComplaint || medHistory.chiefComplaint || currentVisit?.notes || 'None specified';
  const symptomOnset = visitSymptoms.onset || 'Not specified';
  const severityRating = typeof visitSymptoms.severity === 'number' ? visitSymptoms.severity : 5;
  const associatedSymptomsList = Array.isArray(visitSymptoms.associatedSymptoms)
    ? visitSymptoms.associatedSymptoms
    : [];

  const completeVoiceNotes = currentVisit?.notes || medHistory.notes || '';

  // Extract AYUSH assessment
  const ayushData = currentVisit?.ayush_assessment || medHistory.ayush || {};
  const dominantDosha = ayushData.dominantDosha || 'vata';
  const doshaPercentages = ayushData.doshaPercentages || { vata: 33, pitta: 33, kapha: 34 };
  const doshaScores = ayushData.doshaScores || { vata: 10, pitta: 10, kapha: 10 };
  const agni = ayushData.agni || 'sama';
  const koshtha = ayushData.koshtha || 'madhya';
  const recommendations = ayushData.recommendations || { diet: [], lifestyle: [], herbs: [] };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Link href="/doctor-dashboard" className="hover:text-[#004f45] transition">Dashboard</Link>
            <span>/</span>
            <Link href="/doctor/patients" className="hover:text-[#004f45] transition">Patients</Link>
            <span>/</span>
            <span className="text-gray-900 font-bold">{patient.patient_name || 'Patient'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-3">
            <User className="w-8 h-8 text-[#004f45]" />
            {patient.patient_name || 'Unnamed Patient'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/doctor/patients"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Patients</span>
          </Link>

          <Link
            href={`/doctor/patient/${patientId}/report`}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#004f45] hover:bg-[#00695c] text-white text-xs font-bold shadow-md transition"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Final Report →</span>
          </Link>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <p className="text-sm font-semibold">{feedbackMsg.text}</p>
        </div>
      )}

      {/* STEP 3: PATIENT INFORMATION CARD */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
          <User className="w-5 h-5 text-[#004f45]" />
          Patient Demographic Details
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-[11px] font-bold text-gray-500 uppercase">Full Name</span>
            <p className="text-sm font-black text-gray-900 mt-0.5">{patient.patient_name || 'N/A'}</p>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-[11px] font-bold text-gray-500 uppercase">ABHA ID</span>
            <p className="text-xs font-mono font-bold text-gray-900 mt-0.5">{patient.abha_id || 'Unlinked'}</p>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-[11px] font-bold text-gray-500 uppercase">Age / Gender</span>
            <p className="text-sm font-bold text-gray-900 mt-0.5">
              {patient.age ? `${patient.age} yrs` : 'N/A'} • {patient.gender || 'N/A'}
            </p>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-[11px] font-bold text-gray-500 uppercase">Language</span>
            <p className="text-sm font-bold text-gray-900 mt-0.5 uppercase">{patient.language || 'hi'}</p>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-[11px] font-bold text-gray-500 uppercase">Mobile / Contact</span>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{patient.phone || (patient as any).mobile || 'N/A'}</p>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-[11px] font-bold text-gray-500 uppercase">Registered Date</span>
            <p className="text-xs font-medium text-gray-700 mt-0.5">
              {new Date(patient.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* STEP 4: PATIENT VISIT ENCOUNTERS SELECTOR */}
      {visits.length > 1 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#004f45]" />
            Previous Visit History ({visits.length} encounters)
          </h3>
          <div className="flex flex-wrap gap-2">
            {visits.map((v, idx) => (
              <button
                key={v.id || idx}
                onClick={() => handleSelectVisit(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                  selectedVisitIndex === idx
                    ? 'bg-[#004f45] text-white border-[#004f45] shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Visit {visits.length - idx}: {new Date(v.created_at).toLocaleDateString()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 5 & STEP 6: PATIENT HISTORY, ACTUAL VOICE TRANSCRIPTS & SYMPTOMS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Voice/Text History */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Mic className="w-5 h-5 text-[#004f45]" />
              Captured Voice & Clinical History
            </h2>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Voice-First Capture
            </span>
          </div>

          <div className="space-y-4">
            
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                Chief Complaint / Primary Health Problem
              </span>
              <p className="text-base font-extrabold text-gray-900">
                {chiefComplaint}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-[11px] font-bold text-gray-500 uppercase">Onset & Duration</span>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{symptomOnset}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-[11px] font-bold text-gray-500 uppercase">Pain Severity</span>
                <p className="text-sm font-bold text-gray-900 mt-0.5">
                  <span className={`px-2 py-0.5 rounded-md text-xs text-white font-bold mr-1.5 ${
                    severityRating >= 7 ? 'bg-red-600' : severityRating >= 4 ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}>
                    {severityRating} / 10
                  </span>
                  {severityRating >= 7 ? 'Severe' : severityRating >= 4 ? 'Moderate' : 'Mild'}
                </p>
              </div>
            </div>

            {/* Complete Voice Notes */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-slate-500" />
                Actual Spoken Voice Transcript / Open Patient Notes
              </span>
              <p className="text-sm font-medium text-slate-900 italic bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                {completeVoiceNotes ? `"${completeVoiceNotes}"` : `"${chiefComplaint}"`}
              </p>
            </div>

            {/* Past Medical History & Current Meds */}
            {medHistory.pastMedicalHistory && medHistory.pastMedicalHistory.length > 0 && (
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                  Chronic Past Medical History
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {medHistory.pastMedicalHistory.map((cond: string, i: number) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-md bg-white border border-gray-300 text-xs font-semibold text-gray-800">
                      • {cond}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {medHistory.medications && medHistory.medications.length > 0 && (
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">
                  Current Medications (Reported)
                </span>
                <div className="space-y-1">
                  {medHistory.medications.map((med: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-white p-2 rounded border border-gray-200">
                      <span className="font-bold text-gray-900">{med.name} ({med.dosage})</span>
                      <span className="text-gray-500 font-medium">{med.frequency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Detected Symptoms */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-600" />
              Detected Symptoms & Triage Breakdown
            </h2>
            <span className="text-xs font-semibold text-gray-500">Clinical Triage</span>
          </div>

          <div className="space-y-4">
            
            {/* Symptoms Tags */}
            <div>
              <span className="text-xs font-bold text-gray-600 uppercase block mb-2">
                Identified Symptoms List:
              </span>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-extrabold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Primary: {chiefComplaint}
                </span>

                {associatedSymptomsList.map((sym: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-blue-600" />
                    {sym}
                  </span>
                ))}
              </div>
            </div>

            {/* Severity Meter Visual */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-600 uppercase">Reported Pain / Severity Score</span>
                <span className="text-gray-900">{severityRating} / 10</span>
              </div>
              <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all rounded-full ${
                    severityRating >= 7 ? 'bg-red-600' : severityRating >= 4 ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${severityRating * 10}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-500">
                {severityRating >= 7 ? 'High discomfort reported by patient during kiosk history taking.' : 'Patient managed moderate symptoms.'}
              </p>
            </div>

            {/* Red Flag Alert Note */}
            {severityRating >= 7 && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-2.5 text-xs">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Triage Priority Notice:</span>
                  <span>High pain score ({severityRating}/10) recorded. Evaluate vital parameters.</span>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* STEP 7: AYUSH ASSESSMENT CARD */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              AYUSH Prakriti & Dosha Constitution Assessment
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Pre-calculated tri-dosha balance, digestive fire (Agni), and bowel type (Koshtha).</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase">
              Dominant: {dominantDosha} Prakriti
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Dosha Chart View */}
          <div className="lg:col-span-1">
            <DoshaChart scores={doshaScores} percentages={doshaPercentages} />
          </div>

          {/* Dosha Breakdown & Parameters */}
          <div className="lg:col-span-2 space-y-4">
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-xs font-bold text-emerald-800 uppercase">Dominant Dosha</span>
                <p className="text-2xl font-black text-emerald-900 mt-1 uppercase">{dominantDosha}</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  V:{doshaPercentages.vata}% | P:{doshaPercentages.pitta}% | K:{doshaPercentages.kapha}%
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> Agni (Digestive Fire)
                </span>
                <p className="text-2xl font-black text-amber-900 mt-1 uppercase">{agni}</p>
                <p className="text-[11px] text-amber-700 mt-0.5">Metabolic Rate</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <span className="text-xs font-bold text-blue-800 uppercase">Koshtha (Bowel Type)</span>
                <p className="text-2xl font-black text-blue-900 mt-1 uppercase">{koshtha}</p>
                <p className="text-[11px] text-blue-700 mt-0.5">Bowel Tendency</p>
              </div>
            </div>

            {/* AYUSH Recommendations Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <span className="text-xs font-bold text-gray-700 uppercase block">Dietary Guidance (Ahara)</span>
                <ul className="text-xs text-gray-600 space-y-1">
                  {recommendations.diet && recommendations.diet.length > 0 ? (
                    recommendations.diet.slice(0, 3).map((d: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))
                  ) : (
                    <li className="italic text-gray-400">Dietary guidance will be populated automatically.</li>
                  )}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <span className="text-xs font-bold text-gray-700 uppercase block">Lifestyle Regimen (Vihara)</span>
                <ul className="text-xs text-gray-600 space-y-1">
                  {recommendations.lifestyle && recommendations.lifestyle.length > 0 ? (
                    recommendations.lifestyle.slice(0, 3).map((l: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{l}</span>
                      </li>
                    ))
                  ) : (
                    <li className="italic text-gray-400">Lifestyle regimen will be populated automatically.</li>
                  )}
                </ul>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* STEP 8 & STEP 9: DOCTOR CLINICAL NOTES & TREATMENT PLAN FORM */}
      <form onSubmit={handleSaveDoctorPlan} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[#004f45]" />
              Doctor Clinical Notes & Prescription Plan
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Enter clinical impressions, confirmed diagnoses, prescriptions, and lifestyle advice. Saved directly to patient encounter.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#004f45] hover:bg-[#00695c] text-white text-xs font-bold shadow-md transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving to Database...' : 'Save Notes & Plan'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left: Clinical Observations & Diagnosis */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Clinical Diagnosis / Findings (comma separated)
              </label>
              <input
                type="text"
                value={diagnosisInput}
                onChange={(e) => setDiagnosisInput(e.target.value)}
                placeholder="e.g. Viral Pyrexia, Vata Prakopa, Tension Headache"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00695c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Doctor Clinical Examination Notes
              </label>
              <textarea
                rows={4}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Enter physical examination, tongue diagnosis, pulse reading (Nadi Pariksha) or clinical impressions..."
                className="w-full p-4 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00695c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Treatment & Follow-up Advice
              </label>
              <input
                type="text"
                value={followUpAdvice}
                onChange={(e) => setFollowUpAdvice(e.target.value)}
                placeholder="e.g. Review after 5 days with CBC report if fever persists."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00695c]"
              />
            </div>
          </div>

          {/* Right: Treatment Plan & Prescription */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Prescription & Medicines (Rx)
              </label>
              <textarea
                rows={4}
                value={prescriptionText}
                onChange={(e) => setPrescriptionText(e.target.value)}
                placeholder="e.g. 1. Tab Paracetamol 650mg TDS x 3 days&#10;2. Sudarshan Vati 2 tabs BD with warm water&#10;3. Sitopaladi Churna 3g with honey BD"
                className="w-full p-4 border border-gray-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#00695c]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Dietary Advice (Pathya)
                </label>
                <input
                  type="text"
                  value={dietPlan}
                  onChange={(e) => setDietPlan(e.target.value)}
                  placeholder="e.g. Light khichdi, warm water"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00695c]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Lifestyle / Vihara
                </label>
                <input
                  type="text"
                  value={lifestyleAdvice}
                  onChange={(e) => setLifestyleAdvice(e.target.value)}
                  placeholder="e.g. Avoid cold showers, adequate rest"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00695c]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Follow-up Review Date
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00695c]"
              />
            </div>

          </div>

        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Consulting Doctor: <span className="font-semibold text-gray-700">{doctorUser?.email || 'Authenticated Doctor'}</span>
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#004f45] hover:bg-[#00695c] text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Treatment Plan'}</span>
            </button>

            <Link
              href={`/doctor/patient/${patientId}/report`}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
            >
              <FileText className="w-4 h-4" />
              <span>View / Download Final Report →</span>
            </Link>
          </div>
        </div>

      </form>

    </div>
  );
}
