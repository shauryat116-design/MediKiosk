import { useUIStore } from '@/lib/stores/uiStore';

export function useAccessibility() {
  const { fontSize, highContrast, setFontSize, toggleHighContrast } = useUIStore();

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'large':
        return 'text-lg md:text-xl';
      case 'xlarge':
        return 'text-xl md:text-2xl';
      default:
        return 'text-base md:text-lg';
    }
  };

  const getHeadingSizeClass = () => {
    switch (fontSize) {
      case 'large':
        return 'text-3xl md:text-4xl';
      case 'xlarge':
        return 'text-4xl md:text-5xl';
      default:
        return 'text-2xl md:text-3xl';
    }
  };

  return {
    fontSize,
    highContrast,
    setFontSize,
    toggleHighContrast,
    getFontSizeClass,
    getHeadingSizeClass,
  };
}
