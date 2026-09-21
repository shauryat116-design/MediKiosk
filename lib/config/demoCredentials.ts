/**
 * Configuration for Demo Doctor Credentials
 * Used for SIH judges / evaluators to pre-fill the login form.
 * 
 * Configurable via environment variables:
 * - NEXT_PUBLIC_DEMO_DOCTOR_EMAIL
 * - NEXT_PUBLIC_DEMO_DOCTOR_PASSWORD
 */

export const DEMO_DOCTOR_CONFIG = {
  email: process.env.NEXT_PUBLIC_DEMO_DOCTOR_EMAIL || 'shivam@gmail.com',
  password: process.env.NEXT_PUBLIC_DEMO_DOCTOR_PASSWORD || 'Shivam1346@',
};

