# Swaasth Saathi (स्वास्थ्य साथी) - AI-Powered AYUSH Kiosk Frontend

"Swaasth Saathi" is an AI-driven, accessible digital history capture touchscreen kiosk frontend designed for Indian OPDs and AYUSH hospitals. It allows low-literacy, rural, and elderly patients to pre-capture comprehensive clinical medical history and AYUSH Prakriti dosha assessments in 5–7 minutes before meeting the doctor.

---

## 🌟 Key Features

1. **Dual Input Engine (Voice + Touch Hybrid)**:
   - Simultaneous active Web Speech API voice transcription and touch button grid.
   - Emergency keyword detection ("chest pain", "bleeding", "unconscious", "सीने में दर्द") triggers high-priority red alert banners for OPD triage.
   - Multi-lingual code-switching support (Hindi, English, Tamil, Telugu, Bengali).

2. **AYUSH Prakriti & Digestive Assessment**:
   - 15-question visual assessment evaluating physical frame, skin, digestion, sleep, stress, body heat, and joints.
   - Real-time Dosha percentage calculations (Vata, Pitta, Kapha) displayed using interactive Recharts Radar/Triangle charts.
   - Agni (digestive fire) & Koshtha (bowel habit) categorization.
   - Personalized AYUSH diet, lifestyle (Vihara), and herbal recommendations.

3. **Document Digitization & Camera Scanner**:
   - WebCam capture with visual green bounding box edge-detection guidance.
   - Client-side Canvas image preprocessing (grayscale, contrast adjustment, compression < 500KB).
   - Multi-stage OCR progress simulator extracting prescription dosages, frequencies, and lab report parameters.

4. **Physician EMR SOAP Review & PDF Export**:
   - Comprehensive SOAP clinical summary (Subjective, Objective, Assessment, Plan).
   - Inline touch field editing for physician corrections.
   - ABDM FHIR R4 document bundle conversion for EMR integration.
   - Automated PDF download using `jsPDF` with token number generation (`A - 245`).

5. **Accessibility & Kiosk Resilience**:
   - WCAG AAA compliance with minimum 60px touch targets, 20px+ font sizes, high-contrast toggle, and text zoom (+20%, +40%).
   - Web Audio touch feedback and Web Speech Synthesis audio narration for illiterate/visually impaired users.
   - 100% Offline Mode support using IndexedDB (`Dexie.js`) with automatic background queue sync.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS + Shadcn/ui design system
- **State Management**: Zustand
- **Multilingual / i18n**: i18next + react-i18next
- **Speech API**: Web Speech API (`webkitSpeechRecognition`) & Web SpeechSynthesis
- **Offline Storage**: Dexie.js (IndexedDB wrapper)
- **Data Visualization**: Recharts
- **PDF Generation**: jsPDF
- **Animations**: Framer Motion & Canvas Confetti
- **Validation**: Zod & React Hook Form

---

## 📁 Project Structure

```
newMedicose/
├── app/
│   ├── layout.tsx                    # Root layout with Client Providers
│   ├── page.tsx                      # Screen 1: Kiosk Welcome / Home
│   ├── language-select/page.tsx      # Screen 2: Multilingual Selector
│   ├── abha-login/page.tsx           # Screen 3: ABHA Authentication & OTP
│   ├── consent/page.tsx              # Screen 4: Digital Privacy Consent
│   ├── history-capture/
│   │   ├── layout.tsx                # Stepper & Session Timer Wrapper
│   │   └── page.tsx                  # Screen 5: Core Dual-Input History Flow
│   ├── ayush-assessment/page.tsx     # Screen 6: 15-Q Prakriti Assessment
│   ├── document-upload/page.tsx      # Screen 7: Document Scanner & OCR
│   ├── summary-review/page.tsx       # Screen 8: SOAP History Review
│   └── completion/page.tsx           # Screen 9: Token & PDF Success Screen
│
├── components/
│   ├── ui/                           # Touch-optimized primitives (button, card, progress, dialog, slider, badge)
│   ├── shared/                       # Header, ProgressStepper, SessionTimer, AudioPlayer, AccessibilityMenu
│   ├── input/                        # DualInputQuestion, VoiceRecorder, TouchButtonGrid, BodyDiagram, ScaleSlider, DatePicker
│   ├── ayush/                        # PrakritiQuestionnaire, DoshaChart, AgniSelector, KoshthaSelector, DoshaResultCard
│   ├── document/                     # CameraCapture, DocumentPreview, ImageCropper, OCRProgress
│   └── summary/                      # HistorySummaryCard, MedicationList, TimelineView, EditableField
│
├── lib/
│   ├── api/                          # Axios client & mock ABDM/OCR endpoints
│   ├── stores/                       # Zustand state stores (session, history, ayush, document, ui)
│   ├── hooks/                        # Custom hooks (voice, audio, session, offline, accessibility)
│   ├── utils/                        # Validation, encryption, audio, canvas image processor, prakriti calculator, fhir, pdf
│   ├── db/                           # Dexie.js IndexedDB offline database
│   └── i18n.ts                       # i18next configuration
│
├── locales/                          # Hindi (hi), English (en), Tamil (ta) dictionaries
├── styles/globals.css                # Tailwind directives & kiosk high-contrast styles
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Setup & Execution Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Kiosk Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in Chrome/Edge in fullscreen mode (`F11`).

3. **Build for Production**:
   ```bash
   npm run build
   npm run start
   ```

---

## 🎯 Kiosk Testing Scenarios

1. **Elderly Hindi Speaker Scenario**:
   - Tap "👉 START NOW" -> Select "हिंदी" -> Enter ABHA or Skip -> Tap Microphone to speak "मुझे पिछले ३ दिनों से बुखार है".
2. **AYUSH Prakriti Assessment**:
   - Complete the 15 body frame/skin/sleep questions -> View live updating Vata-Pitta-Kapha radar chart & lifestyle advice.
3. **Document Scanning & PDF Download**:
   - Scan prescription -> Confirm extracted Metformin & Amlodipine dosages -> Review EMR summary -> Download PDF token report.
