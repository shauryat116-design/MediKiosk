import { create } from 'zustand';
import { MedicalHistory, Medication, SymptomDetail } from '@/types/history';

interface HistoryStore extends MedicalHistory {
  setChiefComplaint: (complaint: string) => void;
  updateSymptoms: (symptoms: Partial<SymptomDetail>) => void;
  addPastMedicalCondition: (condition: string) => void;
  removePastMedicalCondition: (condition: string) => void;
  addMedication: (medication: Omit<Medication, 'id'>) => void;
  removeMedication: (id: string) => void;
  addAllergy: (allergy: string) => void;
  removeAllergy: (allergy: string) => void;
  setNotes: (notes: string) => void;
  resetHistory: () => void;
}

const DEFAULT_HISTORY: MedicalHistory = {
  chiefComplaint: '',
  symptoms: {
    chiefComplaint: '',
    onset: '',
    severity: 0,
    associatedSymptoms: [],
    medicationsTried: '',
    reliefAchieved: null,
  },
  pastMedicalHistory: [],
  medications: [],
  allergies: [],
  familyHistory: {},
  socialHistory: {
    smoking: false,
    alcohol: false,
    exercise: '',
  },
  notes: '',
};

export const useHistoryStore = create<HistoryStore>((set) => ({
  ...DEFAULT_HISTORY,

  setChiefComplaint: (complaint) =>
    set((state) => ({
      chiefComplaint: complaint,
      symptoms: { ...state.symptoms, chiefComplaint: complaint },
    })),

  updateSymptoms: (symptomsUpdate) =>
    set((state) => ({
      symptoms: { ...state.symptoms, ...symptomsUpdate },
    })),

  addPastMedicalCondition: (condition) =>
    set((state) => ({
      pastMedicalHistory: Array.from(new Set([...state.pastMedicalHistory, condition])),
    })),

  removePastMedicalCondition: (condition) =>
    set((state) => ({
      pastMedicalHistory: state.pastMedicalHistory.filter((c) => c !== condition),
    })),

  addMedication: (med) =>
    set((state) => ({
      medications: [
        ...state.medications,
        { ...med, id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 5)}` },
      ],
    })),

  removeMedication: (id) =>
    set((state) => ({
      medications: state.medications.filter((m) => m.id !== id),
    })),

  addAllergy: (allergy) =>
    set((state) => ({
      allergies: Array.from(new Set([...state.allergies, allergy])),
    })),

  removeAllergy: (allergy) =>
    set((state) => ({
      allergies: state.allergies.filter((a) => a !== allergy),
    })),

  setNotes: (notes) => set({ notes }),

  resetHistory: () => set(DEFAULT_HISTORY),
}));
