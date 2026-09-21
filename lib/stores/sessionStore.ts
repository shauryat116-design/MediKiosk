import { create } from 'zustand';
import { Language, SessionData } from '@/types/session';

interface SessionStore extends SessionData {
  initSession: () => void;
  setLanguage: (lang: Language) => void;
  setAbhaId: (abhaId: string | null, name?: string, age?: number, gender?: 'male' | 'female' | 'other') => void;
  giveConsent: () => void;
  setCurrentStep: (step: number) => void;
  extendSession: () => void;
  setTokenNumber: (token: string) => void;
  resetSession: () => void;
}

const INITIAL_TOTAL_STEPS = 6;

export const useSessionStore = create<SessionStore>((set) => ({
  sessionId: '',
  abhaId: null,
  patientName: 'Rahul Sharma',
  age: 58,
  gender: 'male',
  language: 'hi',
  consentGiven: false,
  startTime: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 mins
  currentStep: 1,
  totalSteps: INITIAL_TOTAL_STEPS,
  tokenNumber: '',

  initSession: () => {
    const newSessionId = `SS-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();
    const expiry = new Date(now.getTime() + 10 * 60 * 1000); // 10 min kiosk timeout
    set({
      sessionId: newSessionId,
      abhaId: null,
      patientName: 'Rahul Sharma',
      age: 58,
      gender: 'male',
      language: 'hi',
      consentGiven: false,
      startTime: now.toISOString(),
      expiresAt: expiry.toISOString(),
      currentStep: 1,
      tokenNumber: `A - ${Math.floor(100 + Math.random() * 900)}`,
    });
  },

  setLanguage: (lang: Language) => set({ language: lang }),

  setAbhaId: (abhaId, name, age, gender) =>
    set({
      abhaId,
      patientName: name || 'Rahul Sharma',
      age: age || 58,
      gender: gender || 'male',
      patient: {
        abhaId: abhaId || '14-1234-5678-9012',
        name: name || 'Rahul Sharma',
        age: age || 58,
        gender: gender || 'male',
      },
    }),

  giveConsent: () => set({ consentGiven: true }),

  setCurrentStep: (step) => set({ currentStep: step }),

  extendSession: () => {
    const newExpiry = new Date(Date.now() + 5 * 60 * 1000); // Extend 5 min
    set({ expiresAt: newExpiry.toISOString() });
  },

  setTokenNumber: (token) => set({ tokenNumber: token }),

  resetSession: () => {
    const newSessionId = `SS-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();
    const expiry = new Date(now.getTime() + 10 * 60 * 1000);
    set({
      sessionId: newSessionId,
      abhaId: null,
      patientName: 'Rahul Sharma',
      age: 58,
      gender: 'male',
      language: 'hi',
      consentGiven: false,
      startTime: now.toISOString(),
      expiresAt: expiry.toISOString(),
      currentStep: 1,
      tokenNumber: `A - ${Math.floor(100 + Math.random() * 900)}`,
    });
  },
}));
