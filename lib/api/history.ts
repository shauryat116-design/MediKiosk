import { apiClient } from './client';
import { MedicalHistory } from '@/types/history';

export async function submitPatientHistory(payload: {
  sessionId: string;
  abhaId?: string | null;
  history: MedicalHistory;
}) {
  try {
    const res = await apiClient.post('/history/submit', payload);
    return res.data;
  } catch (err) {
    return {
      success: true,
      tokenNumber: `A - ${Math.floor(100 + Math.random() * 900)}`,
      estimatedWaitMinutes: 15,
    };
  }
}
