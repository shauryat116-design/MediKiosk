import { create } from 'zustand';
import { AgniType, AyushProfile, DoshaScores, DoshaType, KoshthaType, PrakritiType } from '@/types/ayush';
import { calculateDoshaPercentages, determineDominantDosha, getAYUSHRecommendations } from '@/lib/utils/prakritiCalculator';

interface AyushStore extends AyushProfile {
  recordPrakritiAnswer: (questionKey: string, dosha: DoshaType) => void;
  setAgni: (agni: AgniType) => void;
  setKoshtha: (koshtha: KoshthaType) => void;
  recalculateDoshas: () => void;
  resetAyush: () => void;
}

const DEFAULT_SCORES: DoshaScores = { vata: 12, pitta: 7, kapha: 3 }; // Initial baseline demo scores
const initialPercentages = calculateDoshaPercentages(DEFAULT_SCORES);
const initialDominant = determineDominantDosha(initialPercentages);
const initialRecs = getAYUSHRecommendations(initialDominant);

export const useAyushStore = create<AyushStore>((set, get) => ({
  prakritiResponses: {
    frame: 'vata',
    skin: 'vata',
    hair: 'pitta',
    appetite: 'pitta',
    digestion: 'vata',
  },
  doshaScores: DEFAULT_SCORES,
  doshaPercentages: initialPercentages,
  dominantDosha: initialDominant,
  agni: 'manda',
  koshtha: 'krura',
  recommendations: initialRecs,

  recordPrakritiAnswer: (questionKey, dosha) => {
    set((state) => {
      const updatedResponses = { ...state.prakritiResponses, [questionKey]: dosha };
      
      // Calculate scores: 2 points per response
      const newScores: DoshaScores = { vata: 0, pitta: 0, kapha: 0 };
      Object.values(updatedResponses).forEach((val) => {
        if (val in newScores) {
          newScores[val] += 2;
        }
      });

      const newPercentages = calculateDoshaPercentages(newScores);
      const newDominant = determineDominantDosha(newPercentages);
      const newRecs = getAYUSHRecommendations(newDominant);

      return {
        prakritiResponses: updatedResponses,
        doshaScores: newScores,
        doshaPercentages: newPercentages,
        dominantDosha: newDominant,
        recommendations: newRecs,
      };
    });
  },

  setAgni: (agni) => set({ agni }),

  setKoshtha: (koshtha) => set({ koshtha }),

  recalculateDoshas: () => {
    const state = get();
    const percentages = calculateDoshaPercentages(state.doshaScores);
    const dominant = determineDominantDosha(percentages);
    const recs = getAYUSHRecommendations(dominant);
    set({
      doshaPercentages: percentages,
      dominantDosha: dominant,
      recommendations: recs,
    });
  },

  resetAyush: () => {
    const scores = { vata: 0, pitta: 0, kapha: 0 };
    const percentages = calculateDoshaPercentages(scores);
    set({
      prakritiResponses: {},
      doshaScores: scores,
      doshaPercentages: percentages,
      dominantDosha: 'vata',
      agni: 'sama',
      koshtha: 'madhya',
      recommendations: getAYUSHRecommendations('vata'),
    });
  },
}));
