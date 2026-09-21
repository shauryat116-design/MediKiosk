import { convertToFHIRBundle } from '@/lib/utils/fhirFormatter';

export async function pushToHospitalEMR(patientData: any) {
  const fhirBundle = convertToFHIRBundle(patientData);
  console.log('Pushing FHIR Bundle to ABDM Gateway / Hospital EMR:', fhirBundle);
  await new Promise((r) => setTimeout(r, 1000));
  return {
    success: true,
    emrRecordId: `EMR-${Math.floor(10000 + Math.random() * 90000)}`,
    fhirBundle,
  };
}
