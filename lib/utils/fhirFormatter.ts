import { MedicalHistory } from '@/types/history';
import { AyushProfile } from '@/types/ayush';

export function convertToFHIRBundle(patientData: {
  sessionId: string;
  abhaId?: string | null;
  patientName?: string;
  history: MedicalHistory;
  ayush: AyushProfile;
}) {
  const { sessionId, abhaId, patientName = 'Rajesh Kumar', history, ayush } = patientData;

  return {
    resourceType: 'Bundle',
    type: 'document',
    timestamp: new Date().toISOString(),
    entry: [
      {
        resource: {
          resourceType: 'Patient',
          id: abhaId || `TEMP-${sessionId.substring(0, 8)}`,
          name: [{ text: patientName }],
          identifier: [
            {
              system: 'https://healthid.ndhm.gov.in',
              value: abhaId || 'UNLINKED',
            },
          ],
        },
      },
      {
        resource: {
          resourceType: 'Condition',
          clinicalStatus: {
            coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }],
          },
          code: {
            text: history.chiefComplaint,
          },
          subject: { reference: `Patient/${abhaId || sessionId}` },
          onsetDateTime: new Date().toISOString(),
          note: history.notes ? [{ text: history.notes }] : [],
        },
      },
      {
        resource: {
          resourceType: 'Observation',
          status: 'final',
          category: [
            {
              coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'exam' }],
            },
          ],
          code: {
            text: 'AYUSH Prakriti Assessment',
          },
          valueString: `Dominant Dosha: ${ayush.dominantDosha.toUpperCase()} (V:${ayush.doshaPercentages.vata}%, P:${ayush.doshaPercentages.pitta}%, K:${ayush.doshaPercentages.kapha}%), Agni: ${ayush.agni}, Koshtha: ${ayush.koshtha}`,
        },
      },
    ],
  };
}
