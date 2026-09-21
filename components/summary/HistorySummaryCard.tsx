'use client';

import React from 'react';
import { useHistoryStore } from '@/lib/stores/historyStore';
import { useAyushStore } from '@/lib/stores/ayushStore';
import { useDocumentStore } from '@/lib/stores/documentStore';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { EditableField } from './EditableField';
import { MedicationList } from './MedicationList';
import { TimelineView } from './TimelineView';
import { AlertOctagon, Printer, Send, User, Activity, Stethoscope, Sparkles, CheckCircle, Flame } from 'lucide-react';
import { generateSummaryPDF } from '@/lib/utils/pdfGenerator';
import { pushToHospitalEMR } from '@/lib/api/abdm';
import { getRecommendedSpecialist } from '@/lib/utils/specialistRecommendation';

export function HistorySummaryCard({ onSubmit }: { onSubmit: () => void }) {
  const history = useHistoryStore();
  const ayush = useAyushStore();
  const { documents } = useDocumentStore();
  const session = useSessionStore();

  const {
    sessionId,
    abhaId,
    tokenNumber = 'A - 245',
    language = 'hi',
    age = 58,
    gender = 'male',
  } = session;

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

  // Compute AI Recommended Specialist
  const recommendedSpecialist = getRecommendedSpecialist({
    chiefComplaint: recognizedComplaint,
    associatedSymptoms: history.symptoms.associatedSymptoms,
    notes: history.notes,
    age: age,
    gender: gender,
  });

  const handlePrintPDF = () => {
    generateSummaryPDF({
      tokenNumber,
      patientName,
      abhaId,
      age,
      gender,
      language,
      sessionId,
      history,
      ayush,
      documents,
      recommendedSpecialist,
    });
  };

  const handlePushEMR = async () => {
    const res = await pushToHospitalEMR({
      sessionId,
      abhaId,
      patientName,
      history,
      ayush,
    });
    alert(`✓ EMR Push Success!\nRecord ID: ${res.emrRecordId}\nFHIR R4 Document bundle pushed to Hospital EMR.`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Red Flag Alert if Severe */}
      {(history.symptoms.severity >= 7 || history.pastMedicalHistory.length > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 shadow-sm flex items-start gap-4">
          <AlertOctagon className="w-8 h-8 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-base font-black text-red-900 uppercase">🚨 Triage / Clinical Alert</h3>
            <ul className="list-disc list-inside text-xs font-bold text-red-800 space-y-0.5">
              {history.symptoms.severity >= 7 && (
                <li>High Severity Discomfort ({history.symptoms.severity}/10) recorded</li>
              )}
              {history.pastMedicalHistory.length > 0 && (
                <li>Known History: {history.pastMedicalHistory.join(', ')}</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* SECTION 1: PATIENT INFORMATION CARD */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#e8f5f2] border border-[#a7d7cd] flex items-center justify-center text-[#004f45]">
              <User className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-black text-[#004f45] uppercase tracking-wider">Patient Demographics</span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">Patient Information / मरीज का विवरण</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="px-4 py-1.5 rounded-xl bg-[#e8f5f2] text-[#004f45] border border-[#a7d7cd] text-sm font-black">
              Token: {tokenNumber}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Patient Name</span>
            <p className="text-xl font-black text-gray-900 mt-1">{patientName}</p>
          </div>

          <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">ABHA Number</span>
            <p className="text-base font-mono font-bold text-gray-900 mt-1">{abhaId || 'Unlinked'}</p>
          </div>

          <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Language & Session</span>
            <p className="text-base font-bold text-gray-900 mt-1 uppercase">
              {language === 'hi' ? 'हिंदी (Hindi)' : 'English'}
            </p>
            <p className="text-xs text-gray-400 font-medium">Session: {sessionId || 'SS-Active'}</p>
          </div>
        </div>
      </div>

      {/* SECTION 2: CAPTURED SYMPTOMS & VOICE INPUT */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <h3 className="text-lg font-black text-[#004f45] border-b border-gray-100 pb-3 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#004f45]" />
          <span>Reported Symptoms / स्वास्थ्य लक्षण</span>
        </h3>

        {/* Primary Spoken Sentence Display */}
        <div className="p-5 rounded-2xl bg-[#f4fbf9] border border-[#a7d7cd] space-y-1.5">
          <span className="text-xs font-black text-[#004f45] uppercase tracking-wide block">
            Primary Spoken Complaint / मुख्य समस्या:
          </span>
          <p className="text-xl sm:text-2xl font-black text-gray-900 leading-relaxed italic">
            "{recognizedComplaint}"
          </p>
        </div>

        {/* Associated Symptoms Tags */}
        {history.symptoms.associatedSymptoms && history.symptoms.associatedSymptoms.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-500 uppercase block">
              Associated Symptoms (संबद्ध लक्षण):
            </span>
            <div className="flex flex-wrap gap-2">
              {history.symptoms.associatedSymptoms.map((sym, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-bold text-xs"
                >
                  ✓ {sym}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Open Notes */}
        {history.notes && history.notes !== recognizedComplaint && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
            <span className="text-xs font-bold text-slate-600 uppercase block">
              Additional Details (विस्तृत विवरण):
            </span>
            <p className="text-base font-bold text-slate-900 italic">"{history.notes}"</p>
          </div>
        )}
      </div>

      {/* SECTION 2.5: AI RECOMMENDED SPECIALIST */}
      <div className="bg-white border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 bg-gradient-to-br from-white to-[#f4fbf9]">
        <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{recommendedSpecialist.icon}</span>
            <div>
              <span className="text-[11px] font-black text-[#004f45] uppercase tracking-wider">
                Clinical Referral Recommendation
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                Recommended Specialist / अनुशंसित विशेषज्ञ
              </h3>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#e8f5f2] text-[#004f45] border border-[#a7d7cd]">
            AI Referral
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-sm space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{recommendedSpecialist.icon}</span>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-[#004f45]">
                {recommendedSpecialist.specialist}
              </p>
              <p className="text-xs font-bold text-gray-500">
                {recommendedSpecialist.department}
              </p>
            </div>
          </div>

          <p className="text-sm font-semibold text-gray-700 pt-2 border-t border-gray-100 leading-relaxed">
            {recommendedSpecialist.reason}
          </p>
          <p className="text-xs text-gray-500 font-medium">
            {recommendedSpecialist.reasonHi}
          </p>
        </div>

        <p className="text-[11px] text-gray-400 italic">
          * Note: This is an AI-assisted referral recommendation based on reported symptoms, not a confirmed medical diagnosis.
        </p>
      </div>

      {/* SECTION 3: PATIENT HISTORY */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <h3 className="text-lg font-black text-[#004f45] border-b border-gray-100 pb-3 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-[#004f45]" />
          <span>Patient Medical History / पूर्व स्वास्थ्य इतिहास</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditableField
            label="Symptom Onset & Duration (शुरुआत)"
            value={history.symptoms.onset}
            onSave={(val) => history.updateSymptoms({ onset: val })}
          />
          <EditableField
            label="Pain Severity (तकलीफ का स्तर)"
            value={`${history.symptoms.severity} / 10`}
            onSave={(val) => history.updateSymptoms({ severity: Number(val) || 5 })}
          />
        </div>

        <div className="pt-2 border-t border-gray-100 space-y-4">
          <EditableField
            label="Chronic Conditions (पुरानी बीमारियां)"
            value={history.pastMedicalHistory.join(', ')}
            onSave={(val) => history.addPastMedicalCondition(val)}
          />

          <MedicationList
            medications={history.medications}
            onAdd={(med) => history.addMedication(med)}
            onRemove={(id) => history.removeMedication(id)}
          />
        </div>
      </div>

      {/* SECTION 4: AYUSH ASSESSMENT */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <h3 className="text-lg font-black text-emerald-800 border-b border-gray-100 pb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <span>AYUSH Prakriti & Digestive Profile</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200">
            <span className="text-xs font-bold text-emerald-800 uppercase">DOMINANT PRAKRITI</span>
            <p className="text-2xl font-black text-emerald-900 uppercase mt-1">{ayush.dominantDosha}</p>
            <p className="text-xs font-bold text-emerald-700 mt-0.5">
              V:{ayush.doshaPercentages.vata}% | P:{ayush.doshaPercentages.pitta}% | K:{ayush.doshaPercentages.kapha}%
            </p>
          </div>

          <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200">
            <span className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> Agni (Digestive Fire)
            </span>
            <p className="text-2xl font-black text-amber-900 uppercase mt-1">{ayush.agni}</p>
            <p className="text-xs text-amber-700 mt-0.5">Metabolic Activity</p>
          </div>

          <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200">
            <span className="text-xs font-bold text-blue-800 uppercase">Koshtha (Bowel Type)</span>
            <p className="text-2xl font-black text-blue-900 uppercase mt-1">{ayush.koshtha}</p>
            <p className="text-xs text-blue-700 mt-0.5">Digestive Elimination</p>
          </div>
        </div>
      </div>

      {/* Uploaded Documents */}
      {documents.length > 0 && <TimelineView documents={documents} />}

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={handlePrintPDF}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-white border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition min-h-[48px]"
          >
            <Printer className="w-4 h-4" />
            <span>Download PDF / प्रिंट</span>
          </button>

          <button
            onClick={handlePushEMR}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 border border-gray-300 transition min-h-[48px]"
          >
            <Send className="w-4 h-4" />
            <span>Push to EMR</span>
          </button>
        </div>

        <button
          onClick={onSubmit}
          className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-[#004f45] hover:bg-[#00695c] text-white font-extrabold text-base shadow-md transition active:scale-98 flex items-center justify-center gap-2.5 min-h-[52px]"
        >
          <CheckCircle className="w-5 h-5 text-emerald-300" />
          <span>Confirm & Finalize Submission →</span>
        </button>
      </div>

    </div>
  );
}
