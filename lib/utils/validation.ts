import { z } from 'zod';

export const abhaNumberSchema = z.string().refine((val) => {
  const digitsOnly = val.replace(/\D/g, '');
  return digitsOnly.length === 14;
}, {
  message: 'ABHA Number must be exactly 14 digits',
});

export const otpSchema = z.string().length(6, {
  message: 'OTP must be 6 digits',
});

export const chiefComplaintSchema = z.string().min(3, {
  message: 'Please provide at least 3 words describing your symptoms',
});

export const symptomDetailSchema = z.object({
  chiefComplaint: z.string().min(2, 'Chief complaint is required'),
  onset: z.string().min(1, 'Onset duration is required'),
  severity: z.number().min(1).max(10),
  associatedSymptoms: z.array(z.string()),
  medicationsTried: z.string(),
  reliefAchieved: z.boolean().nullable(),
});

export const medicationSchema = z.object({
  name: z.string().min(2, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
});
