import { DoshaScores, DoshaType, PrakritiType } from '@/types/ayush';

export function calculateDoshaPercentages(scores: DoshaScores) {
  const total = scores.vata + scores.pitta + scores.kapha;
  if (total === 0) {
    return { vata: 33.3, pitta: 33.3, kapha: 33.4 };
  }
  return {
    vata: Math.round((scores.vata / total) * 100),
    pitta: Math.round((scores.pitta / total) * 100),
    kapha: Math.round((scores.kapha / total) * 100),
  };
}

export function determineDominantDosha(percentages: { vata: number; pitta: number; kapha: number }): PrakritiType {
  const { vata, pitta, kapha } = percentages;

  // Check tri-doshic (all within 10% of each other)
  if (Math.abs(vata - pitta) <= 10 && Math.abs(pitta - kapha) <= 10 && Math.abs(vata - kapha) <= 10) {
    return 'tridoshaja';
  }

  // Check bi-doshic
  if (Math.abs(vata - pitta) <= 10 && vata > kapha && pitta > kapha) {
    return 'vata-pitta';
  }
  if (Math.abs(pitta - kapha) <= 10 && pitta > vata && kapha > vata) {
    return 'pitta-kapha';
  }
  if (Math.abs(vata - kapha) <= 10 && vata > pitta && kapha > pitta) {
    return 'vata-kapha';
  }

  // Single dominant
  if (vata > pitta && vata > kapha) return 'vata';
  if (pitta > vata && pitta > kapha) return 'pitta';
  return 'kapha';
}

export function getAYUSHRecommendations(dominant: PrakritiType) {
  switch (dominant) {
    case 'vata':
    case 'vata-pitta':
      return {
        diet: [
          'Eat warm, cooked, nourishing foods (soup, kitchari)',
          'Prefer sweet, sour, and salty tastes',
          'Avoid cold drinks, raw vegetables, and dry snacks',
          'Use warm oils like sesame or ghee in cooking',
        ],
        lifestyle: [
          'Maintain a strict daily routine for meals and sleep',
          'Practice Abhyanga (daily warm oil body massage)',
          'Keep warm and avoid cold windy weather',
          'Practice grounding yoga and Nadi Shodhana pranayama',
        ],
        herbs: ['Ashwagandha', 'Bala', 'Shatavari', 'Triphala at bedtime'],
      };

    case 'pitta':
    case 'pitta-kapha':
      return {
        diet: [
          'Eat cooling, moderately heavy foods (sweet fruits, leafy greens)',
          'Prefer sweet, bitter, and astringent tastes',
          'Minimize spicy, sour, salty, fried, and fermented foods',
          'Drink coconut water and cooling herbal teas (mint, coriander)',
        ],
        lifestyle: [
          'Avoid excessive sun exposure and heat during mid-day',
          'Engage in calming exercises (swimming, moonlight walks)',
          'Avoid overworking and intense competition',
          'Practice Sheetali pranayama and cooling meditation',
        ],
        herbs: ['Amalaki (Amla)', 'Guduchi (Giloy)', 'Shatavari', 'Brahmi'],
      };

    case 'kapha':
    case 'vata-kapha':
    default:
      return {
        diet: [
          'Eat light, warm, dry, and cooked foods',
          'Prefer pungent, bitter, and astringent tastes',
          'Avoid heavy, oily, sweet, cold dairy, and cold drinks',
          'Incorporate digestive spices (ginger, black pepper, turmeric)',
        ],
        lifestyle: [
          'Exercise vigorously daily (brisk walking, sun salutations)',
          'Wake up early before 6:00 AM (avoid daytime sleeping)',
          'Stay active and try new engaging activities',
          'Practice Kapalabhati and Bhastrika pranayama',
        ],
        herbs: ['Trikatu (Ginger-Pepper-Pippali)', 'Tulsi', 'Guggulu', 'Punar Nava'],
      };
  }
}
