'use client';

import { supabase } from '@/lib/supabase';
import { useSessionStore } from '@/lib/stores/sessionStore';
import React, { useState } from 'react';
import { useAyushStore } from '@/lib/stores/ayushStore';
import { useAudioFeedback } from '@/lib/hooks/useAudioFeedback';
import { DoshaType } from '@/types/ayush';
import { Progress } from '@/components/ui/progress';
import { DoshaChart } from './DoshaChart';
import { AgniSelector } from './AgniSelector';
import { KoshthaSelector } from './KoshthaSelector';
import { DoshaResultCard } from './DoshaResultCard';
import { Sparkles, ArrowRight, ChevronLeft, Check, Info } from 'lucide-react';

interface QuestionDef {
  id: number;
  key: string;
  titleHi: string;
  titleEn: string;
  options: { label: string; dosha: DoshaType; icon: string; desc: string }[];
}

const PRAKRITI_QUESTIONS: QuestionDef[] = [
  {
    id: 1,
    key: 'frame',
    titleHi: '1. आपके शरीर का ढांचा कैसा है?',
    titleEn: '1. What is your body frame?',
    options: [
      { label: 'Thin / Slender (दुबला/पतला)', dosha: 'vata', icon: '👤', desc: 'Prominent joints, hard to gain weight' },
      { label: 'Medium / Athletic (मध्यम)', dosha: 'pitta', icon: '🏃', desc: 'Good muscle tone, moderate frame' },
      { label: 'Heavy / Sturdy (भारी/चौड़ा)', dosha: 'kapha', icon: '🏋️', desc: 'Large bone structure, gains weight easily' },
    ],
  },
  {
    id: 2,
    key: 'skin',
    titleHi: '2. आपकी त्वचा का प्रकार कैसा है?',
    titleEn: '2. What is your skin type?',
    options: [
      { label: 'Dry & Rough (रूखी/सूखी)', dosha: 'vata', icon: '🌵', desc: 'Tends to crack, cool to touch' },
      { label: 'Warm & Sensitive (गर्म/संवेदनशील)', dosha: 'pitta', icon: '🔥', desc: 'Prone to redness, moles, acne' },
      { label: 'Oily & Soft (तैलीय/मुलायम)', dosha: 'kapha', icon: '💧', desc: 'Thick, smooth, pale and cool' },
    ],
  },
  {
    id: 3,
    key: 'hair',
    titleHi: '3. आपके बालों की बनावट कैसी है?',
    titleEn: '3. What is your hair texture?',
    options: [
      { label: 'Dry & Frizzy (रूखे/घंघराले)', dosha: 'vata', icon: '👩‍🦱', desc: 'Thin split ends' },
      { label: 'Fine & Early Grey (पतले/सफेद)', dosha: 'pitta', icon: '👨‍🦳', desc: 'Soft hair, thinning or baldness' },
      { label: 'Thick & Lustrous (घने/चमकदार)', dosha: 'kapha', icon: '💇', desc: 'Dark, wavy and strong' },
    ],
  },
  {
    id: 4,
    key: 'appetite',
    titleHi: '4. आपकी भूख कैसी रहती है?',
    titleEn: '4. How is your appetite?',
    options: [
      { label: 'Irregular (अनियमित)', dosha: 'vata', icon: '🎲', desc: 'Sometimes high, sometimes none' },
      { label: 'Strong & Intense (तेज भूख)', dosha: 'pitta', icon: '⚡', desc: 'Cannot skip meals without irritability' },
      { label: 'Steady & Low (धीमी भूख)', dosha: 'kapha', icon: '🐢', desc: 'Can skip meals easily without discomfort' },
    ],
  },
  {
    id: 5,
    key: 'digestion',
    titleHi: '5. भोजन के बाद पाचन कैसा अनुभव होता है?',
    titleEn: '5. How is your digestion after meals?',
    options: [
      { label: 'Gas & Bloating (गैस/अफारा)', dosha: 'vata', icon: '💨', desc: 'Frequent constipation or bloating' },
      { label: 'Acidity & Burning (एसिडिटी/जलन)', dosha: 'pitta', icon: '🌶️', desc: 'Heartburn or loose bowel' },
      { label: 'Heavy & Slow (भारीपन/सुस्ती)', dosha: 'kapha', icon: '🛋️', desc: 'Feeling sleepy and heavy' },
    ],
  },
  {
    id: 6,
    key: 'sleep',
    titleHi: '6. आपकी नींद का पैटर्न कैसा है?',
    titleEn: '6. What is your sleep pattern?',
    options: [
      { label: 'Light & Disturbed (हल्की नींद)', dosha: 'vata', icon: '🌙', desc: 'Wakes up easily at night' },
      { label: 'Moderate & Sound (मध्यम नींद)', dosha: 'pitta', icon: '😴', desc: 'Wakes up refreshed in 6-7 hours' },
      { label: 'Deep & Heavy (गहरी नींद)', dosha: 'kapha', icon: '🛌', desc: 'Hard to wake up in morning (>8 hours)' },
    ],
  },
  {
    id: 7,
    key: 'temp',
    titleHi: '7. तापमान के प्रति आपकी संवेदनशीलता?',
    titleEn: '7. What is your temperature preference?',
    options: [
      { label: 'Dislike Cold (ठंड नापसंद)', dosha: 'vata', icon: '❄️', desc: 'Cold hands and feet' },
      { label: 'Dislike Heat (गर्मी नापसंद)', dosha: 'pitta', icon: '☀️', desc: 'Prefers cool breeze and shade' },
      { label: 'Dislike Damp/Cold (नमी नापसंद)', dosha: 'kapha', icon: '🌧️', desc: 'Prefers warm dry weather' },
    ],
  },
  {
    id: 8,
    key: 'stress',
    titleHi: '8. तनाव में आपकी क्या प्रतिक्रिया होती है?',
    titleEn: '8. How do you respond to stress?',
    options: [
      { label: 'Anxious & Worried (चिंता/घबराहट)', dosha: 'vata', icon: '😰', desc: 'Overthinking and restlessness' },
      { label: 'Angry & Irritable (क्रोध/चिड़चिड़ापन)', dosha: 'pitta', icon: '😡', desc: 'Short temper and perfectionism' },
      { label: 'Withdrawn & Calm (शांत/उदासीन)', dosha: 'kapha', icon: '😐', desc: 'Slow to react or depression' },
    ],
  },
  {
    id: 9,
    key: 'speech',
    titleHi: '9. आपकी वाणी और बोलने की शैली?',
    titleEn: '9. What is your speech style?',
    options: [
      { label: 'Fast & Talkative (तेज बोलना)', dosha: 'vata', icon: '🗣️', desc: 'Jumps between topics quickly' },
      { label: 'Sharp & Precise (स्पष्ट/तार्किक)', dosha: 'pitta', icon: '🎯', desc: 'Convincing and articulate' },
      { label: 'Slow & Soft (धीमा/मधुर)', dosha: 'kapha', icon: '🎶', desc: 'Calm and steady tone' },
    ],
  },
  {
    id: 10,
    key: 'energy',
    titleHi: '10. आपकी ऊर्जा का स्तर कैसा रहता है?',
    titleEn: '10. How is your daily energy level?',
    options: [
      { label: 'Bursts & Variable (उतार-चढ़ाव)', dosha: 'vata', icon: '📈', desc: 'Quick energy followed by exhaustion' },
      { label: 'Focused & Moderate (केंद्रित)', dosha: 'pitta', icon: '🔋', desc: 'High stamina for targeted work' },
      { label: 'Steady & Enduring (स्थिर)', dosha: 'kapha', icon: '🏔️', desc: 'Slow start but long endurance' },
    ],
  },
  {
    id: 11,
    key: 'memory',
    titleHi: '11. आपकी याददाश्त कैसी है?',
    titleEn: '11. How is your memory retention?',
    options: [
      { label: 'Quick learn, quick forget (जल्दी भूलना)', dosha: 'vata', icon: '💡', desc: 'Grasps fast but forgets quickly' },
      { label: 'Sharp & Accurate (तेज याददाश्त)', dosha: 'pitta', icon: '🧠', desc: 'Clear retention of details' },
      { label: 'Slow learn, long retain (स्थायी)', dosha: 'kapha', icon: '📚', desc: 'Takes time to learn but never forgets' },
    ],
  },
  {
    id: 12,
    key: 'joints',
    titleHi: '12. आपके जोड़ों और हड्डियों का लक्षण?',
    titleEn: '12. What is your joint character?',
    options: [
      { label: 'Prominent & Cracking (कट-कट आवाज)', dosha: 'vata', icon: '🦴', desc: 'Dry joints, pops easily' },
      { label: 'Flexible & Moderate (लचीले)', dosha: 'pitta', icon: '🤸', desc: 'Loose ligaments' },
      { label: 'Large & Well-padded (मजबूत)', dosha: 'kapha', icon: '🛡️', desc: 'Firm, heavy joints' },
    ],
  },
  {
    id: 13,
    key: 'sweat',
    titleHi: '13. पसीना और शरीर की गंध?',
    titleEn: '13. Sweating tendency?',
    options: [
      { label: 'Minimal (कम पसीना)', dosha: 'vata', icon: '💧', desc: 'Barely sweats even in summer' },
      { label: 'Profuse & Strong (अधिक पसीना)', dosha: 'pitta', icon: '💦', desc: 'Sweats easily with warm body odor' },
      { label: 'Moderate & Sweet (सामान्य)', dosha: 'kapha', icon: '🌊', desc: 'Sweats mainly during exertion' },
    ],
  },
  {
    id: 14,
    key: 'bowels',
    titleHi: '14. शौच (मल) की प्रवृत्ति?',
    titleEn: '14. Bowel habit character?',
    options: [
      { label: 'Hard / Constipated (कठोर/सूखा)', dosha: 'vata', icon: '🪨', desc: 'Irregular frequency' },
      { label: 'Soft / Loose (नरम/ढीला)', dosha: 'pitta', icon: '🍂', desc: 'Multiple times daily' },
      { label: 'Regular & Heavy (सामान्य/भारी)', dosha: 'kapha', icon: '🌱', desc: 'Once daily in morning' },
    ],
  },
  {
    id: 15,
    key: 'mind',
    titleHi: '15. आपकी निर्णय लेने की क्षमता?',
    titleEn: '15. Decision making style?',
    options: [
      { label: 'Hesitant / Changing (दुविधाजनक)', dosha: 'vata', icon: '❓', desc: 'Changes mind frequently' },
      { label: 'Decisive & Confident (दृढ़ निश्चय)', dosha: 'pitta', icon: '⚖️', desc: 'Quick firm decisions' },
      { label: 'Slow & Deliberate (सोच-समझकर)', dosha: 'kapha', icon: '⏳', desc: 'Takes ample time before deciding' },
    ],
  },
];

export function PrakritiQuestionnaire({ onComplete }: { onComplete: () => void }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const { recordPrakritiAnswer, doshaScores, doshaPercentages, agni, setAgni, koshtha, setKoshtha } = useAyushStore();
  const { playSound } = useAudioFeedback();

  const currentQ = PRAKRITI_QUESTIONS[currentIdx];
  const progressVal = Math.round(((currentIdx + 1) / (PRAKRITI_QUESTIONS.length + 1)) * 100);

  const handleSelectOption = (dosha: DoshaType) => {
    playSound('tap');
    recordPrakritiAnswer(currentQ.key, dosha);
    if (currentIdx < PRAKRITI_QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setCurrentIdx(PRAKRITI_QUESTIONS.length);
    }
  };

  const handleAgniKoshthaDone = async () => {
    playSound('success');

    try {
      const session = useSessionStore.getState() as any;

      const abhaId =
        session.abhaId ||
        session.patient?.abhaId ||
        session.patient?.abha_id ||
        null;

      if (!abhaId) {
        onComplete();
        return;
      }

      // Find patient
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('abha_id', abhaId)
        .maybeSingle();

      if (!patient) {
        onComplete();
        return;
      }

      const latestAyush = useAyushStore.getState();

      const ayushAssessment = {
        prakritiResponses: latestAyush.prakritiResponses,
        doshaScores: latestAyush.doshaScores,
        doshaPercentages: latestAyush.doshaPercentages,
        dominantDosha: latestAyush.dominantDosha,
        agni: latestAyush.agni,
        koshtha: latestAyush.koshtha,
        recommendations: latestAyush.recommendations,
        completedAt: new Date().toISOString(),
      };

      // Find latest visit
      const { data: visit } = await supabase
        .from('patient_visits')
        .select('id')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (visit) {
        await supabase
          .from('patient_visits')
          .update({
            ayush_assessment: ayushAssessment,
          })
          .eq('id', visit.id);
      }
    } catch (error) {
      console.error('AYUSH save error:', error);
    }

    onComplete();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Stepper Card */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-black text-[#004f45] uppercase tracking-wide">
              AYUSH Prakriti Question {Math.min(currentIdx + 1, PRAKRITI_QUESTIONS.length)} of {PRAKRITI_QUESTIONS.length}
            </span>
          </div>
          <span className="text-xs font-extrabold text-emerald-800 bg-[#e8f5f2] px-3 py-1 rounded-full border border-[#a7d7cd]">
            {progressVal}% Evaluated
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-[#004f45] h-full rounded-full transition-all duration-300"
            style={{ width: `${progressVal}%` }}
          />
        </div>
      </div>

      {/* Main Question / Final Step Layout */}
      {currentIdx < PRAKRITI_QUESTIONS.length ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Question & Choices Column */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-1.5">
              <span className="text-xs font-bold text-emerald-700 uppercase">Constitutional Parameter</span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-snug">
                {currentQ.titleEn}
              </h2>
              <p className="text-lg font-bold text-gray-500">{currentQ.titleHi}</p>
            </div>

            {/* Touch Choice Options */}
            <div className="grid grid-cols-1 gap-3.5">
              {currentQ.options.map((opt) => (
                <button
                  key={opt.dosha}
                  onClick={() => handleSelectOption(opt.dosha)}
                  className="p-5 rounded-2xl border-2 border-gray-200 hover:border-[#004f45] bg-white hover:bg-[#f4fbf9] text-left transition-all shadow-sm active:scale-98 flex items-center gap-4 min-h-[84px]"
                >
                  <span className="text-4xl flex-shrink-0">{opt.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                      {opt.label}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">{opt.desc}</p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-[#004f45] flex-shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>

            {/* Stepper Navigation */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                className="py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-bold text-xs disabled:opacity-30 transition"
              >
                ← Previous
              </button>

              <button
                type="button"
                onClick={() => setCurrentIdx((prev) => prev + 1)}
                className="py-2.5 px-4 rounded-xl text-gray-500 hover:text-gray-900 font-bold text-xs transition"
              >
                Not Sure / Skip →
              </button>
            </div>
          </div>

          {/* Live Dosha Radar Chart */}
          <div className="lg:col-span-1">
            <DoshaChart scores={doshaScores} percentages={doshaPercentages} />
          </div>

        </div>
      ) : (
        /* Final Agni & Koshtha Review Step */
        <div className="space-y-6 animate-fadeIn">
          <AgniSelector selectedAgni={agni} onSelectAgni={setAgni} />
          <KoshthaSelector selectedKoshtha={koshtha} onSelectKoshtha={setKoshtha} />
          <DoshaResultCard profile={useAyushStore.getState()} />

          <button
            onClick={handleAgniKoshthaDone}
            className="w-full py-4 px-8 rounded-2xl bg-[#004f45] hover:bg-[#00695c] text-white font-extrabold text-base sm:text-lg shadow-md transition active:scale-98 flex items-center justify-center gap-2.5 min-h-[56px]"
          >
            <span>Confirm AYUSH Profile & Continue / आगे बढ़ें</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

    </div>
  );
}
