'use client';
import React from 'react';
import { useUIStore } from '@/lib/stores/uiStore';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ZoomIn, Eye, Volume2 } from 'lucide-react';

export function AccessibilityMenu() {
  const {
    showAccessibilityMenu,
    setShowAccessibilityMenu,
    fontSize,
    setFontSize,
    highContrast,
    toggleHighContrast,
    audioFeedbackEnabled,
    toggleAudioFeedback,
  } = useUIStore();

  return (
    <Dialog
      isOpen={showAccessibilityMenu}
      onClose={() => setShowAccessibilityMenu(false)}
      title="♿ Accessibility Options / सुगम्यता विकल्प"
    >
      <div className="space-y-6 py-4">
        {/* Font Size Selector */}
        <div>
          <label className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-3">
            <ZoomIn className="w-6 h-6 text-primary-600" />
            Text Size / अक्षर का आकार:
          </label>
          <div className="grid grid-cols-3 gap-4">
            <Button
              variant={fontSize === 'normal' ? 'primary' : 'outline'}
              size="md"
              onClick={() => setFontSize('normal')}
            >
              Normal (100%)
            </Button>
            <Button
              variant={fontSize === 'large' ? 'primary' : 'outline'}
              size="md"
              onClick={() => setFontSize('large')}
            >
              Large (+20%)
            </Button>
            <Button
              variant={fontSize === 'xlarge' ? 'primary' : 'outline'}
              size="md"
              onClick={() => setFontSize('xlarge')}
            >
              Extra (+40%)
            </Button>
          </div>
        </div>

        {/* High Contrast Mode */}
        <div className="flex items-center justify-between p-4 bg-gray-100 rounded-2xl">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-primary-700" />
            <div>
              <p className="text-xl font-bold text-gray-900">High Contrast Mode</p>
              <p className="text-base text-gray-600">उच्च कंट्रास्ट मोड (सफ़ेद व काला)</p>
            </div>
          </div>
          <Button variant={highContrast ? 'primary' : 'outline'} size="md" onClick={toggleHighContrast}>
            {highContrast ? 'Enabled ✓' : 'Turn On'}
          </Button>
        </div>

        {/* Audio Narration Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-100 rounded-2xl">
          <div className="flex items-center gap-3">
            <Volume2 className="w-8 h-8 text-primary-700" />
            <div>
              <p className="text-xl font-bold text-gray-900">Audio Touch Feedback</p>
              <p className="text-base text-gray-600">आवाज प्रतिक्रिया (स्पीकर)</p>
            </div>
          </div>
          <Button variant={audioFeedbackEnabled ? 'primary' : 'outline'} size="md" onClick={toggleAudioFeedback}>
            {audioFeedbackEnabled ? 'Enabled ✓' : 'Turn On'}
          </Button>
        </div>

        <Button variant="secondary" size="kiosk" onClick={() => setShowAccessibilityMenu(false)}>
          Done / संपन्न
        </Button>
      </div>
    </Dialog>
  );
}
