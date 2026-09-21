'use client';

import { supabase } from '@/lib/supabase';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHistoryStore } from '@/lib/stores/historyStore';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { DualInputQuestion } from '@/components/input/DualInputQuestion';

interface QuestionNode {
  id: number;
  key: string;
  questionHi: string;
  questionEn: string;
  inputType: 'choice' | 'open' | 'scale' | 'body' | 'date';
  choices?: { label: string; value: string; icon?: string }[];
}

const ADAPTIVE_QUESTIONS: QuestionNode[] = [
  {
    id: 1,
    key: 'chief_complaint',
    questionEn: 'What is your main health problem today?',
    questionHi: 'आज आपकी मुख्य स्वास्थ्य समस्या क्या है?',
    inputType: 'choice',
    choices: [
      { label: 'Fever (बुखार)', value: 'Fever', icon: '🤒' },
      { label: 'Cough / Cold (खांसी/जुकाम)', value: 'Cough', icon: '😷' },
      { label: 'Pain (दर्द)', value: 'Pain', icon: '🤕' },
      { label: 'Stomach / Nausea (पेट दर्द/उल्टी)', value: 'Stomach', icon: '🤢' },
    ],
  },
  {
    id: 2,
    key: 'symptom_onset',
    questionEn: 'When did this problem start?',
    questionHi: 'यह समस्या कब शुरू हुई थी?',
    inputType: 'choice',
    choices: [
      { label: 'Today (आज)', value: 'Today' },
      { label: 'Yesterday (कल)', value: 'Yesterday' },
      { label: '2-3 Days ago (2-3 दिन पहले)', value: '2-3 days ago' },
      { label: 'Last Week (> 1 सप्ताह)', value: 'Last week' },
    ],
  },
  {
    id: 3,
    key: 'pain_location',
    questionEn: 'Where is the pain or discomfort located on your body?',
    questionHi: 'शरीर में दर्द या तकलीफ किस स्थान पर है?',
    inputType: 'body',
  },
  {
    id: 4,
    key: 'severity_rating',
    questionEn: 'How severe is your discomfort on a scale of 1 to 10?',
    questionHi: 'आपकी तकलीफ कितनी तेज है (1 से 10 के पैमाने पर)?',
    inputType: 'scale',
  },
  {
    id: 5,
    key: 'associated_symptoms',
    questionEn: 'Do you have any associated symptoms?',
    questionHi: 'क्या आपको इनके साथ अन्य कोई लक्षण भी हैं?',
    inputType: 'choice',
    choices: [
      { label: 'Headache (सिर दर्द)', value: 'Headache', icon: '🤯' },
      { label: 'Body Ache (बदन दर्द)', value: 'Body Ache', icon: '🏋️' },
      { label: 'Chills / Shivering (कंपकंपी)', value: 'Chills', icon: '🥶' },
      { label: 'Vomiting (उल्टी)', value: 'Vomiting', icon: '🤮' },
    ],
  },
  {
    id: 6,
    key: 'open_description',
    questionEn: 'Describe any other details about your health in your own words.',
    questionHi: 'कृपया अपने शब्दों में अपनी बीमारी का विवरण बोलकर बताएं।',
    inputType: 'open',
  },
];

export default function HistoryCapturePage() {
  const router = useRouter();
  const [qIndex, setQIndex] = useState(0);
  const { language } = useSessionStore();
  const { setChiefComplaint, updateSymptoms, setNotes } = useHistoryStore();

  const currentQuestion = ADAPTIVE_QUESTIONS[qIndex];

  const handleAnswer = async (answer: any) => {
    const answerStr = String(answer);

    if (currentQuestion.key === 'chief_complaint') {
      setChiefComplaint(answerStr);
    } else if (currentQuestion.key === 'symptom_onset') {
      updateSymptoms({ onset: answerStr });
    } else if (currentQuestion.key === 'pain_location') {
      updateSymptoms({ location: answerStr });
    } else if (currentQuestion.key === 'severity_rating') {
      updateSymptoms({ severity: Number(answer) || 5 });
    } else if (currentQuestion.key === 'associated_symptoms') {
      updateSymptoms({
        associatedSymptoms: [answerStr],
      });
    } else if (currentQuestion.key === 'open_description') {
      setNotes(answerStr);
    }

    if (qIndex < ADAPTIVE_QUESTIONS.length - 1) {
      setQIndex((prev) => prev + 1);
      return;
    }

    // Get latest history from Zustand
    const history = useHistoryStore.getState() as any;

    // Get current patient/session information
    const session = useSessionStore.getState() as any;

    const abhaId =
      session.abhaId ||
      session.patient?.abhaId ||
      session.patient?.abha_id ||
      null;

    const patientName =
      session.patientName ||
      session.patient?.name ||
      session.patient?.patient_name ||
      'Rahul Sharma';

    const age =
      session.patient?.age ||
      session.age ||
      58;

    const gender =
      session.patient?.gender ||
      session.gender ||
      'male';

    try {
      // 1. Find existing patient
      let patientId: string | null = null;

      if (abhaId) {
        const { data: existingPatient } = await supabase
          .from('patients')
          .select('id, patient_name')
          .eq('abha_id', abhaId)
          .maybeSingle();

        if (existingPatient) {
          patientId = existingPatient.id;
          if (existingPatient.patient_name && !session.patientName) {
            useSessionStore.getState().setAbhaId(abhaId, existingPatient.patient_name, age, gender);
          }
        }
      }

      // 2. Create patient if not already present
      if (!patientId) {
        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert({
            patient_name: patientName,
            abha_id: abhaId,
            age: age ? Number(age) : null,
            gender: gender,
            language: session.language || language,
            medical_history: history,
          })
          .select('id')
          .single();

        if (patientError) {
          console.error('Patient save error:', patientError);
        } else {
          patientId = newPatient.id;
        }
      } else {
        // Update existing patient medical_history
        await supabase
          .from('patients')
          .update({
            patient_name: patientName,
            medical_history: history,
          })
          .eq('id', patientId);
      }

      // 3. Save the current visit
      if (patientId) {
        const { error: visitError } = await supabase
          .from('patient_visits')
          .insert({
            patient_id: patientId,
            symptoms: history.symptoms || {},
            notes: history.notes || history.chiefComplaint || null,
            ayush_assessment: {},
            diagnosis: [],
          });

        if (visitError) {
          console.error('Visit save error:', visitError);
        }
      }

      console.log('Patient data saved to Supabase');
    } catch (error) {
      console.error('Supabase save failed:', error);
    }

    router.push('/ayush-assessment');
  };

  const handleSkip = () => {
    if (qIndex < ADAPTIVE_QUESTIONS.length - 1) {
      setQIndex((prev) => prev + 1);
    } else {
      router.push('/ayush-assessment');
    }
  };

  return (
    <div className="py-4">
      <DualInputQuestion
        questionKey={currentQuestion.key}
        questionText={language === 'hi' ? currentQuestion.questionHi : currentQuestion.questionEn}
        inputType={currentQuestion.inputType}
        choices={currentQuestion.choices}
        language={language}
        onAnswer={handleAnswer}
        onSkip={handleSkip}
      />
    </div>
  );
}
