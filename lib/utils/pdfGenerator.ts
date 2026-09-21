import jsPDF from 'jspdf';
import { MedicalHistory } from '@/types/history';
import { AyushProfile } from '@/types/ayush';
import { DocumentItem } from '@/lib/stores/documentStore';
import { SpecialistRecommendation } from './specialistRecommendation';
import { NOTO_SANS_DEVANAGARI_BASE64 } from './notoSansDevanagariBase64';

/** Helper to clean unprintable control characters while preserving Hindi Devanagari, English, digits, and punctuation */
function cleanTextForPDF(text: string | null | undefined): string {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F\uFFFD]/g, '')
    .trim();
}

/** Helper to initialize a jsPDF instance configured with Unicode Hindi Devanagari and Helvetica support */
function createUnicodePDFDoc(): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  try {
    doc.addFileToVFS('NotoSansDevanagari.ttf', NOTO_SANS_DEVANAGARI_BASE64);
    doc.addFont('NotoSansDevanagari.ttf', 'NotoSansDevanagari', 'normal');
  } catch (e) {
    console.warn('Font registration fallback:', e);
  }
  return doc;
}

/** Helper to set the appropriate font based on whether text contains Hindi/Devanagari characters */
function setSmartFont(doc: jsPDF, text: string | null | undefined, style: 'normal' | 'bold' | 'italic' = 'normal') {
  const str = String(text || '');
  if (/[\u0900-\u097F]/.test(str)) {
    doc.setFont('NotoSansDevanagari', 'normal');
  } else {
    doc.setFont('helvetica', style);
  }
}

export interface SummaryPDFData {
  tokenNumber?: string;
  patientName?: string;
  abhaId?: string | null;
  age?: number | null;
  gender?: string | null;
  language?: string | null;
  sessionId?: string | null;
  history: MedicalHistory;
  ayush: AyushProfile;
  documents?: DocumentItem[];
  recommendedSpecialist?: SpecialistRecommendation;
}

export function generateSummaryPDF(data: SummaryPDFData) {
  const doc = createUnicodePDFDoc();
  const {
    tokenNumber = 'A - 245',
    patientName = 'Rahul Sharma',
    abhaId,
    age = 58,
    gender = 'male',
    language = 'hi',
    sessionId = 'SS-Active',
    history,
    ayush,
    documents = [],
    recommendedSpecialist,
  } = data;

  let y = 14;

  // Pagination helper
  function checkPageBreak(neededHeight: number) {
    if (y + neededHeight > 275) {
      doc.addPage();
      y = 20;
    }
  }

  // ──────────────────────────────────────────
  // HEADER BANNER
  // ──────────────────────────────────────────
  doc.setFillColor(0, 79, 69); // Dark teal
  doc.rect(0, 0, 210, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  setSmartFont(doc, 'SWAASTH SAATHI - PATIENT CLINICAL HISTORY SUMMARY', 'bold');
  doc.text('SWAASTH SAATHI - PATIENT CLINICAL HISTORY SUMMARY', 14, 12);

  doc.setFontSize(9);
  setSmartFont(doc, 'National AYUSH Smart OPD Kiosk Pre-Consultation Summary', 'normal');
  doc.text('National AYUSH Smart OPD Kiosk Pre-Consultation Summary', 14, 19);

  // Token Badge
  doc.setFillColor(16, 185, 129); // Emerald
  doc.roundedRect(150, 5, 46, 15, 2, 2, 'F');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  setSmartFont(doc, tokenNumber, 'bold');
  doc.text(`TOKEN: ${cleanTextForPDF(tokenNumber)}`, 154, 15);

  // ──────────────────────────────────────────
  // PATIENT INFORMATION METADATA
  // ──────────────────────────────────────────
  y = 34;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9.5);

  setSmartFont(doc, 'Date: ' + new Date().toLocaleString(), 'normal');
  doc.text(`Date: ${new Date().toLocaleString()}`, 14, y);

  const displayLanguage = language === 'hi' ? 'Hindi (हिंदी)' : 'English';
  doc.text(`Language: ${displayLanguage}    |    Session: ${cleanTextForPDF(sessionId)}`, 115, y);
  y += 5.5;

  const displayName = cleanTextForPDF(patientName || 'Rahul Sharma');
  setSmartFont(doc, 'Patient Name: ' + displayName, 'bold');
  doc.text(`Patient Name: ${displayName}`, 14, y);

  const displayAbha = cleanTextForPDF(abhaId || 'Unlinked');
  setSmartFont(doc, 'ABHA ID: ' + displayAbha, 'normal');
  doc.text(`ABHA ID: ${displayAbha}`, 115, y);
  y += 5.5;

  const displayAgeGender = `${age ? `${age} yrs` : '58 yrs'} • ${gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : gender || 'Male'}`;
  setSmartFont(doc, 'Demographics: ' + displayAgeGender, 'normal');
  doc.text(`Demographics: ${displayAgeGender}`, 14, y);
  y += 8;

  // ──────────────────────────────────────────
  // TRIAGE ALERT (If High Severity or Chronic History)
  // ──────────────────────────────────────────
  const severityScore = typeof history.symptoms?.severity === 'number' ? history.symptoms.severity : 0;
  const pastConditionsList = Array.isArray(history.pastMedicalHistory) ? history.pastMedicalHistory : [];
  if (severityScore >= 7 || pastConditionsList.length > 0) {
    checkPageBreak(12);
    doc.setFillColor(254, 242, 242);
    doc.rect(14, y - 4, 182, 9, 'F');
    doc.setTextColor(185, 28, 28);
    doc.setFontSize(9);
    setSmartFont(doc, 'Triage Alert', 'bold');
    const alertText = `🚨 CLINICAL ALERT: ${severityScore >= 7 ? `High Pain Severity (${severityScore}/10). ` : ''}${pastConditionsList.length > 0 ? `Known History: ${pastConditionsList.join(', ')}` : ''}`;
    doc.text(cleanTextForPDF(alertText), 17, y + 2);
    y += 12;
  }

  // ──────────────────────────────────────────
  // SECTION 1: CHIEF COMPLAINT & SYMPTOMS
  // ──────────────────────────────────────────
  checkPageBreak(25);
  doc.setFontSize(12);
  doc.setTextColor(0, 79, 69);
  setSmartFont(doc, '1. CHIEF COMPLAINT & REPORTED SYMPTOMS', 'bold');
  doc.text('1. CHIEF COMPLAINT & REPORTED SYMPTOMS', 14, y);
  y += 6;

  doc.setFontSize(9.5);
  doc.setTextColor(50, 50, 50);

  const primaryComplaint = cleanTextForPDF(
    history.chiefComplaint || history.symptoms?.chiefComplaint || history.notes || 'None reported'
  );
  setSmartFont(doc, 'Primary Complaint: ' + primaryComplaint, 'normal');
  const complaintLines = doc.splitTextToSize(`Primary Complaint: "${primaryComplaint}"`, 175);
  doc.text(complaintLines, 18, y);
  y += complaintLines.length * 5;

  const onsetStr = cleanTextForPDF(history.symptoms?.onset || 'Not specified');
  setSmartFont(doc, `Onset: ${onsetStr} | Reported Severity: ${severityScore}/10`, 'normal');
  doc.text(`Onset: ${onsetStr} | Reported Severity: ${severityScore}/10`, 18, y);
  y += 5;

  const associatedList = Array.isArray(history.symptoms?.associatedSymptoms) ? history.symptoms.associatedSymptoms : [];
  if (associatedList.length > 0) {
    const assocStr = cleanTextForPDF(associatedList.join(', '));
    setSmartFont(doc, `Associated Symptoms: ${assocStr}`, 'normal');
    doc.text(`Associated Symptoms: ${assocStr}`, 18, y);
    y += 5;
  }

  // Voice transcript
  const voiceNotesStr = cleanTextForPDF(history.notes || history.chiefComplaint);
  if (voiceNotesStr && voiceNotesStr !== primaryComplaint) {
    setSmartFont(doc, 'Patient Voice Notes: "' + voiceNotesStr + '"', 'normal');
    const voiceLines = doc.splitTextToSize(`Patient Voice Notes: "${voiceNotesStr}"`, 175);
    doc.text(voiceLines, 18, y);
    y += voiceLines.length * 5;
  }
  y += 3;

  // ──────────────────────────────────────────
  // SECTION 2: AI RECOMMENDED SPECIALIST
  // ──────────────────────────────────────────
  if (recommendedSpecialist) {
    checkPageBreak(20);
    doc.setFontSize(12);
    doc.setTextColor(0, 79, 69);
    setSmartFont(doc, '2. RECOMMENDED SPECIALIST (AI REFERRAL ADVISORY)', 'bold');
    doc.text('2. RECOMMENDED SPECIALIST (AI REFERRAL ADVISORY)', 14, y);
    y += 6;

    doc.setFontSize(9.5);
    doc.setTextColor(50, 50, 50);

    const specialistTitle = `${cleanTextForPDF(recommendedSpecialist.specialist)} (${cleanTextForPDF(recommendedSpecialist.department)})`;
    setSmartFont(doc, 'Recommended Specialist: ' + specialistTitle, 'bold');
    doc.text(`Recommended Specialist: ${specialistTitle}`, 18, y);
    y += 5;

    const reasonEn = cleanTextForPDF(recommendedSpecialist.reason);
    setSmartFont(doc, 'Advisory: ' + reasonEn, 'normal');
    const reasonLines = doc.splitTextToSize(`Advisory: ${reasonEn}`, 175);
    doc.text(reasonLines, 18, y);
    y += reasonLines.length * 5 + 3;
  }

  // ──────────────────────────────────────────
  // SECTION 3: MEDICAL HISTORY & CURRENT MEDICATIONS
  // ──────────────────────────────────────────
  checkPageBreak(25);
  doc.setFontSize(12);
  doc.setTextColor(0, 79, 69);
  setSmartFont(doc, '3. MEDICAL HISTORY & CURRENT MEDICATIONS', 'bold');
  doc.text('3. MEDICAL HISTORY & CURRENT MEDICATIONS', 14, y);
  y += 6;

  doc.setFontSize(9.5);
  doc.setTextColor(50, 50, 50);

  const pastHistoryText = pastConditionsList.length > 0
    ? cleanTextForPDF(pastConditionsList.join(', '))
    : 'No chronic illnesses reported';
  setSmartFont(doc, 'Past History: ' + pastHistoryText, 'normal');
  doc.text(`Past History: ${pastHistoryText}`, 18, y);
  y += 5;

  const allergyList = Array.isArray(history.allergies) ? history.allergies : [];
  if (allergyList.length > 0) {
    const allergyText = cleanTextForPDF(allergyList.join(', '));
    setSmartFont(doc, 'Allergies: ' + allergyText, 'normal');
    doc.text(`Allergies: ${allergyText}`, 18, y);
    y += 5;
  }

  setSmartFont(doc, 'Medications List:', 'normal');
  doc.text('Medications List:', 18, y);
  y += 5;

  const medsList = Array.isArray(history.medications) ? history.medications : [];
  if (medsList.length > 0) {
    medsList.forEach((med) => {
      checkPageBreak(5);
      const medText = ` • ${cleanTextForPDF(med.name)} (${cleanTextForPDF(med.dosage)}) - ${cleanTextForPDF(med.frequency)}`;
      setSmartFont(doc, medText, 'normal');
      doc.text(medText, 22, y);
      y += 4.8;
    });
  } else {
    setSmartFont(doc, ' • No current medications listed', 'normal');
    doc.text(' • No current medications listed', 22, y);
    y += 4.8;
  }
  y += 3;

  // ──────────────────────────────────────────
  // SECTION 4: AYUSH PRAKRITI & DIGESTIVE PROFILE
  // ──────────────────────────────────────────
  checkPageBreak(25);
  doc.setFontSize(12);
  doc.setTextColor(0, 79, 69);
  setSmartFont(doc, '4. AYUSH PRAKRITI & DIGESTIVE PROFILE', 'bold');
  doc.text('4. AYUSH PRAKRITI & DIGESTIVE PROFILE', 14, y);
  y += 6;

  doc.setFontSize(9.5);
  doc.setTextColor(50, 50, 50);

  const dominantDosha = (ayush?.dominantDosha || 'vata').toUpperCase();
  const vata = ayush?.doshaPercentages?.vata ?? 33;
  const pitta = ayush?.doshaPercentages?.pitta ?? 33;
  const kapha = ayush?.doshaPercentages?.kapha ?? 34;
  const prakritiText = `Dominant Prakriti: ${dominantDosha} (Vata: ${vata}%, Pitta: ${pitta}%, Kapha: ${kapha}%)`;
  setSmartFont(doc, prakritiText, 'normal');
  doc.text(prakritiText, 18, y);
  y += 5;

  const agni = (ayush?.agni || 'sama').toUpperCase();
  const koshtha = (ayush?.koshtha || 'madhya').toUpperCase();
  const agniText = `Agni (Digestive Fire): ${agni} | Koshtha (Bowel): ${koshtha}`;
  setSmartFont(doc, agniText, 'normal');
  doc.text(agniText, 18, y);
  y += 6;

  // ──────────────────────────────────────────
  // SECTION 5: UPLOADED DOCUMENTS & OCR (If present)
  // ──────────────────────────────────────────
  if (documents && documents.length > 0) {
    checkPageBreak(18);
    doc.setFontSize(12);
    doc.setTextColor(0, 79, 69);
    setSmartFont(doc, '5. ATTACHED MEDICAL RECORDS & PRESCRIPTION OCR', 'bold');
    doc.text('5. ATTACHED MEDICAL RECORDS & PRESCRIPTION OCR', 14, y);
    y += 6;

    documents.forEach((d, idx) => {
      checkPageBreak(12);
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      const docLabel = ` • Record ${idx + 1}: ${d.type === 'prescription' ? 'Prescription' : 'Lab Report'} (Status: ${d.ocrStatus.toUpperCase()})`;
      setSmartFont(doc, docLabel, 'normal');
      doc.text(docLabel, 18, y);
      y += 4.5;

      if (d.extractedData?.medications && d.extractedData.medications.length > 0) {
        d.extractedData.medications.forEach((m) => {
          const medOCR = `    - Rx: ${cleanTextForPDF(m.name)} ${cleanTextForPDF(m.dosage)} (${cleanTextForPDF(m.frequency)})`;
          setSmartFont(doc, medOCR, 'normal');
          doc.text(medOCR, 18, y);
          y += 4.2;
        });
      }
    });
    y += 3;
  }

  // ──────────────────────────────────────────
  // FOOTER NOTE
  // ──────────────────────────────────────────
  doc.setFontSize(8.5);
  doc.setTextColor(120, 120, 120);
  setSmartFont(doc, 'Generated by Swaasth Saathi OPD Kiosk. Confidential Medical Record for Consulting Doctor.', 'normal');
  doc.text('Generated by Swaasth Saathi OPD Kiosk. Confidential Medical Record for Consulting Doctor.', 14, 282);

  doc.save(`Swaasth_Saathi_History_${tokenNumber.replace(/\s+/g, '_')}.pdf`);
}

export interface DoctorReportPDFData {
  patientName: string;
  abhaId?: string | null;
  age?: number | null;
  gender?: string | null;
  visitDate: string;
  doctorEmail?: string | null;
  chiefComplaint: string;
  symptomOnset?: string;
  severity?: number;
  voiceNotes?: string;
  associatedSymptoms?: string[];
  dominantDosha?: string;
  doshaPercentages?: { vata: number; pitta: number; kapha: number };
  agni?: string;
  koshtha?: string;
  diagnosis?: string[];
  clinicalNotes?: string;
  prescription?: string;
  dietPlan?: string;
  lifestyleAdvice?: string;
  followUpDate?: string;
  followUpAdvice?: string;
  recommendedSpecialist?: SpecialistRecommendation;
}

export function generateDoctorReportPDF(data: DoctorReportPDFData) {
  const doc = createUnicodePDFDoc();
  const {
    patientName,
    abhaId,
    age,
    gender,
    visitDate,
    doctorEmail,
    chiefComplaint,
    symptomOnset,
    severity,
    voiceNotes,
    associatedSymptoms = [],
    dominantDosha = 'vata',
    doshaPercentages = { vata: 33, pitta: 33, kapha: 34 },
    agni = 'sama',
    koshtha = 'madhya',
    diagnosis = [],
    clinicalNotes,
    prescription,
    dietPlan,
    lifestyleAdvice,
    followUpDate,
    followUpAdvice,
    recommendedSpecialist,
  } = data;

  let y = 14;

  function checkPageBreak(neededHeight: number) {
    if (y + neededHeight > 275) {
      doc.addPage();
      y = 20;
    }
  }

  // Header Banner
  doc.setFillColor(0, 79, 69); // Dark teal
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  setSmartFont(doc, 'SWAASTH SAATHI - AI HEALTHCARE ASSESSMENT REPORT', 'bold');
  doc.text('SWAASTH SAATHI - AI HEALTHCARE ASSESSMENT REPORT', 14, 12);
  doc.setFontSize(9);
  setSmartFont(doc, 'Integrated OPD Clinical History, AYUSH Prakriti & Treatment Plan', 'normal');
  doc.text('Integrated OPD Clinical History, AYUSH Prakriti & Treatment Plan', 14, 19);

  // Patient Demographic Card
  y = 35;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9.5);

  const cleanName = cleanTextForPDF(patientName);
  setSmartFont(doc, 'Patient Name: ' + cleanName, 'bold');
  doc.text(`Patient Name: ${cleanName}`, 14, y);

  setSmartFont(doc, 'Date: ' + visitDate, 'normal');
  doc.text(`Date of Encounter: ${visitDate}`, 120, y);
  y += 5.5;

  const cleanAbha = cleanTextForPDF(abhaId || 'Unlinked');
  setSmartFont(doc, 'ABHA ID: ' + cleanAbha, 'normal');
  doc.text(`ABHA ID: ${cleanAbha}`, 14, y);

  const cleanDoctor = cleanTextForPDF(doctorEmail || 'OPD Physician');
  setSmartFont(doc, 'Doctor: ' + cleanDoctor, 'normal');
  doc.text(`Consulting Doctor: ${cleanDoctor}`, 120, y);
  y += 5.5;

  const demoText = `${age ? `${age} yrs` : 'N/A'} / ${gender || 'N/A'}`;
  setSmartFont(doc, 'Demographics: ' + demoText, 'normal');
  doc.text(`Age/Gender: ${demoText}`, 14, y);
  doc.text('Assessment Status: Completed ✓', 120, y);
  y += 9;

  // 1. Clinical History & Voice Capture
  checkPageBreak(25);
  doc.setFillColor(232, 245, 242);
  doc.rect(14, y - 4, 182, 7, 'F');
  doc.setFontSize(11);
  doc.setTextColor(0, 79, 69);
  setSmartFont(doc, '1. PATIENT CLINICAL HISTORY & SYMPTOMS', 'bold');
  doc.text('1. PATIENT CLINICAL HISTORY & SYMPTOMS', 16, y + 1);
  y += 8;

  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);

  const cleanComplaint = cleanTextForPDF(chiefComplaint);
  setSmartFont(doc, 'Chief Complaint: ' + cleanComplaint, 'normal');
  const complaintLines = doc.splitTextToSize(`Chief Complaint: ${cleanComplaint}`, 175);
  doc.text(complaintLines, 18, y);
  y += complaintLines.length * 4.8;

  const onsetText = `Onset: ${cleanTextForPDF(symptomOnset || 'N/A')} | Reported Severity: ${severity || 5}/10`;
  setSmartFont(doc, onsetText, 'normal');
  doc.text(onsetText, 18, y);
  y += 4.8;

  if (associatedSymptoms.length > 0) {
    const assocText = `Associated Symptoms: ${cleanTextForPDF(associatedSymptoms.join(', '))}`;
    setSmartFont(doc, assocText, 'normal');
    doc.text(assocText, 18, y);
    y += 4.8;
  }

  if (voiceNotes) {
    const cleanVoice = cleanTextForPDF(voiceNotes);
    setSmartFont(doc, 'Voice Transcript: "' + cleanVoice + '"', 'normal');
    const voiceLines = doc.splitTextToSize(`Voice Transcript: "${cleanVoice}"`, 175);
    doc.text(voiceLines, 18, y);
    y += voiceLines.length * 4.8;
  }

  if (recommendedSpecialist) {
    const recText = `Recommended Specialist: ${cleanTextForPDF(recommendedSpecialist.specialist)} (${cleanTextForPDF(recommendedSpecialist.department)})`;
    setSmartFont(doc, recText, 'normal');
    doc.text(recText, 18, y);
    y += 4.8;
  }
  y += 3;

  // 2. AYUSH Assessment
  checkPageBreak(20);
  doc.setFillColor(238, 246, 237);
  doc.rect(14, y - 4, 182, 7, 'F');
  doc.setFontSize(11);
  doc.setTextColor(40, 107, 51);
  setSmartFont(doc, '2. AYUSH PRAKRITI & DOSHA CONSTITUTION', 'bold');
  doc.text('2. AYUSH PRAKRITI & DOSHA CONSTITUTION', 16, y + 1);
  y += 8;

  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);

  const prakritiText = `Dominant Prakriti: ${(dominantDosha || 'vata').toUpperCase()} (Vata: ${doshaPercentages.vata}%, Pitta: ${doshaPercentages.pitta}%, Kapha: ${doshaPercentages.kapha}%)`;
  setSmartFont(doc, prakritiText, 'normal');
  doc.text(prakritiText, 18, y);
  y += 4.8;

  const agniText = `Agni (Digestive Fire): ${(agni || 'sama').toUpperCase()} | Koshtha (Bowel Habit): ${(koshtha || 'madhya').toUpperCase()}`;
  setSmartFont(doc, agniText, 'normal');
  doc.text(agniText, 18, y);
  y += 7;

  // 3. Doctor Assessment & Diagnosis
  checkPageBreak(20);
  doc.setFillColor(243, 244, 246);
  doc.rect(14, y - 4, 182, 7, 'F');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  setSmartFont(doc, '3. DOCTOR CLINICAL ASSESSMENT & DIAGNOSIS', 'bold');
  doc.text('3. DOCTOR CLINICAL ASSESSMENT & DIAGNOSIS', 16, y + 1);
  y += 8;

  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);

  if (diagnosis.length > 0) {
    const diagText = `Diagnosis: ${cleanTextForPDF(diagnosis.join(', '))}`;
    setSmartFont(doc, diagText, 'normal');
    doc.text(diagText, 18, y);
    y += 4.8;
  }

  const cleanClinicalNotes = cleanTextForPDF(clinicalNotes) || 'Routine clinical assessment conducted. Symptomatic management advised.';
  setSmartFont(doc, 'Clinical Notes: ' + cleanClinicalNotes, 'normal');
  const noteLines = doc.splitTextToSize(`Clinical Notes: ${cleanClinicalNotes}`, 175);
  doc.text(noteLines, 18, y);
  y += noteLines.length * 4.8 + 3;

  // 4. Treatment Plan & Prescription (Rx)
  checkPageBreak(25);
  doc.setFillColor(254, 243, 199);
  doc.rect(14, y - 4, 182, 7, 'F');
  doc.setFontSize(11);
  doc.setTextColor(146, 64, 14);
  setSmartFont(doc, '4. TREATMENT PLAN & PRESCRIPTION (Rx)', 'bold');
  doc.text('4. TREATMENT PLAN & PRESCRIPTION (Rx)', 16, y + 1);
  y += 8;

  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);

  if (prescription) {
    const lines = prescription.split('\n');
    lines.forEach((l) => {
      checkPageBreak(5);
      const cleanLine = ` • ${cleanTextForPDF(l)}`;
      setSmartFont(doc, cleanLine, 'normal');
      doc.text(cleanLine, 18, y);
      y += 4.5;
    });
  } else {
    setSmartFont(doc, ' • Symptomatic therapy as prescribed during consultation.', 'normal');
    doc.text(' • Symptomatic therapy as prescribed during consultation.', 18, y);
    y += 4.8;
  }

  if (dietPlan) {
    const cleanDiet = `Diet / Pathya: ${cleanTextForPDF(dietPlan)}`;
    setSmartFont(doc, cleanDiet, 'normal');
    doc.text(cleanDiet, 18, y);
    y += 4.8;
  }
  if (lifestyleAdvice) {
    const cleanLife = `Lifestyle / Vihara: ${cleanTextForPDF(lifestyleAdvice)}`;
    setSmartFont(doc, cleanLife, 'normal');
    doc.text(cleanLife, 18, y);
    y += 4.8;
  }
  if (followUpDate || followUpAdvice) {
    const cleanFollow = `Follow-up: ${followUpDate ? `Review on ${followUpDate}. ` : ''}${cleanTextForPDF(followUpAdvice || '')}`;
    setSmartFont(doc, cleanFollow, 'normal');
    doc.text(cleanFollow, 18, y);
    y += 4.8;
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  setSmartFont(doc, 'This is an authenticated AI-Assisted Clinical Record generated by Swaasth Saathi OPD System.', 'normal');
  doc.text('This is an authenticated AI-Assisted Clinical Record generated by Swaasth Saathi OPD System.', 14, 285);
  doc.text(`Doctor Sign-off: ${cleanTextForPDF(doctorEmail || 'Central OPD Doctor')}`, 140, 285);

  doc.save(`Swaasth_Saathi_Doctor_Report_${patientName.replace(/\s+/g, '_')}.pdf`);
}
