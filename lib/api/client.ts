import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Kiosk-ID': process.env.NEXT_PUBLIC_KIOSK_ID || 'KIOSK-01',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn('API call failed, falling back to client-side mock handler', error);
    return Promise.resolve({ data: { success: true, mockFallback: true } });
  }
);
