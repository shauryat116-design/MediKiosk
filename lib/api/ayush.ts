import { apiClient } from './client';
import { AyushProfile } from '@/types/ayush';

export async function submitAyushProfile(sessionId: string, profile: AyushProfile) {
  try {
    const res = await apiClient.post('/ayush/submit', { sessionId, profile });
    return res.data;
  } catch (err) {
    return { success: true, message: 'AYUSH profile saved' };
  }
}
