export type Language = 'hi' | 'en' | 'ta' | 'te' | 'bn';

export interface SessionData {
  sessionId: string;
  abhaId: string | null;
  patientName?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  language: Language;
  consentGiven: boolean;
  startTime: string; // ISO string
  expiresAt: string; // ISO string
  currentStep: number;
  totalSteps: number;
  tokenNumber?: string;
  patient?: {
    abhaId?: string | null;
    name?: string;
    age?: number;
    gender?: string;
    pastRecordsCount?: number;
  };
}
