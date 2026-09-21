export type DoshaType = 'vata' | 'pitta' | 'kapha';

export type PrakritiType =
  | 'vata'
  | 'pitta'
  | 'kapha'
  | 'vata-pitta'
  | 'pitta-kapha'
  | 'vata-kapha'
  | 'tridoshaja';

export type AgniType = 'tikshna' | 'manda' | 'sama' | 'vishama';

export type KoshthaType = 'mridu' | 'madhya' | 'krura';

export interface PrakritiQuestion {
  id: number;
  key: string;
  questionHi: string;
  questionEn: string;
  questionTa: string;
  options: {
    labelHi: string;
    labelEn: string;
    labelTa: string;
    value: DoshaType;
    icon: string;
    descriptionHi: string;
    descriptionEn: string;
  }[];
}

export interface DoshaScores {
  vata: number;
  pitta: number;
  kapha: number;
}

export interface AyushProfile {
  prakritiResponses: Record<string, DoshaType>;
  doshaScores: DoshaScores;
  doshaPercentages: {
    vata: number;
    pitta: number;
    kapha: number;
  };
  dominantDosha: PrakritiType;
  agni: AgniType;
  koshtha: KoshthaType;
  recommendations: {
    diet: string[];
    lifestyle: string[];
    herbs: string[];
  };
}
