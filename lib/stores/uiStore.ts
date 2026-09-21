import { create } from 'zustand';

export type FontSizeOption = 'normal' | 'large' | 'xlarge';

interface UIStore {
  isLoading: boolean;
  error: string | null;
  showTimeoutWarning: boolean;
  showAccessibilityMenu: boolean;
  fontSize: FontSizeOption;
  highContrast: boolean;
  audioFeedbackEnabled: boolean;
  activeModal: string | null;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setShowTimeoutWarning: (show: boolean) => void;
  setShowAccessibilityMenu: (show: boolean) => void;
  setFontSize: (size: FontSizeOption) => void;
  toggleHighContrast: () => void;
  toggleAudioFeedback: () => void;
  setActiveModal: (modalId: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isLoading: false,
  error: null,
  showTimeoutWarning: false,
  showAccessibilityMenu: false,
  fontSize: 'normal',
  highContrast: false,
  audioFeedbackEnabled: true,
  activeModal: null,

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setShowTimeoutWarning: (showTimeoutWarning) => set({ showTimeoutWarning }),
  setShowAccessibilityMenu: (showAccessibilityMenu) => set({ showAccessibilityMenu }),
  setFontSize: (fontSize) => set({ fontSize }),
  toggleHighContrast: () => set((state) => ({ highContrast: !state.highContrast })),
  toggleAudioFeedback: () => set((state) => ({ audioFeedbackEnabled: !state.audioFeedbackEnabled })),
  setActiveModal: (activeModal) => set({ activeModal }),
}));
