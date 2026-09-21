export interface SymptomDetail {
  chiefComplaint: string;
  onset: string; // e.g. "3 days ago"
  severity: number; // 1 to 10 scale
  associatedSymptoms: string[];
  medicationsTried: string;
  reliefAchieved: boolean | null;
  location?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string; // e.g., "1-0-1 after meals"
  duration?: string;
  source?: 'abha' | 'ocr' | 'manual';
}

export interface MedicalHistory {
  chiefComplaint: string;
  symptoms: SymptomDetail;
  pastMedicalHistory: string[];
  medications: Medication[];
  allergies: string[];
  familyHistory: Record<string, string[]>;
  socialHistory: {
    smoking: boolean;
    alcohol: boolean;
    exercise: string;
  };
  notes?: string;
}
