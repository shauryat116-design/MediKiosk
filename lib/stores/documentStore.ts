import { create } from 'zustand';
import { DocumentUploadResponse } from '@/types/api';

export interface DocumentItem {
  id: string;
  type: 'prescription' | 'lab_report' | 'discharge_summary';
  previewUrl: string;
  uploadProgress: number;
  ocrStatus: 'pending' | 'processing' | 'completed' | 'failed';
  extractedData: {
    doctorName?: string;
    patientName?: string;
    date?: string;
    diagnosis?: string[];
    medications?: Array<{ name: string; dosage: string; frequency: string; duration?: string; instructions?: string }>;
    rawText?: string;
  };
  confidence: number;
  createdAt: string;
  errorMessage?: string;
}

interface DocumentStore {
  documents: DocumentItem[];
  isScanning: boolean;
  addDocument: (doc: Omit<DocumentItem, 'id' | 'createdAt'>) => string;
  removeDocument: (id: string) => void;
  updateDocumentProgress: (id: string, progress: number, status?: DocumentItem['ocrStatus']) => void;
  updateExtractedData: (id: string, data: DocumentItem['extractedData'], confidence?: number) => void;
  setDocumentError: (id: string, errorMessage: string) => void;
  setIsScanning: (scanning: boolean) => void;
  clearDocuments: () => void;
}

export const useDocumentStore = create<DocumentStore>((set) => ({
  documents: [],
  isScanning: false,

  addDocument: (doc) => {
    const id = `doc-${Date.now()}`;
    const newDoc: DocumentItem = {
      ...doc,
      id,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ documents: [newDoc, ...state.documents] }));
    return id;
  },

  removeDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id),
    })),

  updateDocumentProgress: (id, progress, status) =>
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id ? { ...d, uploadProgress: progress, ...(status ? { ocrStatus: status } : {}) } : d
      ),
    })),

  updateExtractedData: (id, data, confidence) =>
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id
          ? {
              ...d,
              extractedData: data,
              ...(confidence !== undefined ? { confidence } : {}),
              ocrStatus: 'completed',
              uploadProgress: 100,
            }
          : d
      ),
    })),

  setDocumentError: (id, errorMessage) =>
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id ? { ...d, ocrStatus: 'failed', errorMessage } : d
      ),
    })),

  setIsScanning: (isScanning) => set({ isScanning }),

  clearDocuments: () => set({ documents: [] }),
}));
