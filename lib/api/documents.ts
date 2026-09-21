import axios from 'axios';
import { DocumentUploadResponse } from '@/types/api';

export async function uploadDocumentScan(base64Image: string, docType: string): Promise<DocumentUploadResponse> {
  const response = await axios.post('/api/prescription', {
    image: base64Image,
    docType,
  });

  if (!response.data || !response.data.success) {
    throw new Error(response.data?.error || 'Failed to process medical document');
  }

  return {
    id: `doc-${Date.now()}`,
    filename: `${docType}_${Date.now()}.jpg`,
    type: docType as any,
    ocrStatus: 'completed',
    extractedData: response.data.extractedData,
    confidence: response.data.confidence,
  };
}
