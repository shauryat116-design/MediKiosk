import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY is not configured in server environment (.env.local)' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { image, docType = 'prescription' } = body;

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'No prescription image provided' },
        { status: 400 }
      );
    }

    // Extract mimeType and base64 string
    let mimeType = 'image/jpeg';
    let base64Data = image;

    if (image.startsWith('data:')) {
      const matches = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Data = matches[2];
      } else {
        base64Data = image.split(',')[1] || image;
      }
    }

    const systemPrompt = `You are an expert medical OCR and prescription parsing AI for Indian hospital OPDs.
Analyze the provided prescription or medical report image carefully.

Extract the following information in strict JSON format:
- doctorName: string (Doctor's name with credentials if available, e.g. "Dr. Ramesh Sharma, MD")
- patientName: string (Patient's name if written, e.g. "Rajesh Kumar", or null)
- date: string (Prescription or lab report date if written, e.g. "15/12/2025" or "15 Dec 2025")
- diagnosis: string[] (Array of diagnoses, conditions, or clinical findings mentioned, e.g. ["Type 2 Diabetes", "Hypertension"])
- medications: array of objects, where each object has:
  - name: string (Medicine name and strength, e.g. "Metformin 500mg")
  - dosage: string (Dosage strength or quantity, e.g. "500mg" or "1 tablet")
  - frequency: string (Frequency/timing in clear terms, e.g. "1-0-1 after meals", "Once daily morning", "BD", "OD")
  - duration: string (Duration if specified, e.g. "5 days", "1 month")
  - instructions: string (Special instructions like "after food", "before sleep")
- rawText: string (Brief summary of key text extracted from the document)
- confidence: number (Overall confidence score from 50 to 100 based on image clarity and legibility)

Return ONLY a JSON object matching this structure:
{
  "doctorName": "...",
  "patientName": "...",
  "date": "...",
  "diagnosis": ["..."],
  "medications": [
    {
      "name": "...",
      "dosage": "...",
      "frequency": "...",
      "duration": "...",
      "instructions": "..."
    }
  ],
  "rawText": "...",
  "confidence": 95
}`;

    // Primary: Call Google Gemini REST API
    let jsonResult: any = null;
    const modelNames = ['gemini-3.6-flash'];

    for (const model of modelNames) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      inlineData: {
                        mimeType: mimeType,
                        data: base64Data,
                      },
                    },
                    {
                      text: systemPrompt,
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.1,
              },
            }),
          }
        );

        if (response.ok) {
          const resData = await response.json();
          const rawResponseText =
            resData?.candidates?.[0]?.content?.parts?.[0]?.text;

          if (rawResponseText) {
            const cleanedText = rawResponseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            jsonResult = JSON.parse(cleanedText);
            break;
          }
        } else {
          const errText = await response.text();
          console.warn(`Gemini model ${model} error:`, response.status, errText);
        }
      } catch (e) {
        console.warn(`Attempt with ${model} failed:`, e);
      }
    }

    if (!jsonResult) {
      return NextResponse.json(
        { success: false, error: 'Failed to extract prescription data using Gemini vision API' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      extractedData: {
        doctorName: jsonResult.doctorName || 'Prescription',
        patientName: jsonResult.patientName || null,
        date: jsonResult.date || new Date().toLocaleDateString(),
        diagnosis: Array.isArray(jsonResult.diagnosis) ? jsonResult.diagnosis : [],
        medications: Array.isArray(jsonResult.medications)
          ? jsonResult.medications.map((m: any) => ({
              name: m.name || 'Medicine',
              dosage: m.dosage || 'As directed',
              frequency: m.frequency || '1-0-1 after meals',
              duration: m.duration || '',
              instructions: m.instructions || '',
            }))
          : [],
        rawText: jsonResult.rawText || '',
      },
      confidence: typeof jsonResult.confidence === 'number' ? jsonResult.confidence : 90,
    });
  } catch (error: any) {
    console.error('Prescription OCR API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error during prescription analysis' },
      { status: 500 }
    );
  }
}
