import { MedicalHistory } from './history';
import { AyushProfile } from './ayush';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface DocumentUploadResponse {
  id: string;
  filename: string;
  type: 'prescription' | 'lab_report' | 'discharge_summary';
  ocrStatus: 'completed' | 'failed' | 'processing';
  extractedData: {
    doctorName?: string;
    date?: string;
    diagnosis?: string[];
    medications?: Array<{
      name: string;
      dosage: string;
      frequency: string;
    }>;
    rawText?: string;
  };
  confidence: number;
}

export interface PatientSubmission {
  sessionId: string;
  abhaId?: string | null;
  timestamp: string;
  medicalHistory: MedicalHistory;
  ayushProfile: AyushProfile;
  documents: DocumentUploadResponse[];
  tokenNumber: string;
}
