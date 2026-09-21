/**
 * Specialist Recommendation Utility for Swaasth Saathi
 * Deterministically maps reported patient symptoms and case details to an appropriate medical specialist referral.
 */

export interface SpecialistRecommendation {
  specialist: string;
  specialistHi: string;
  department: string;
  icon: string;
  reason: string;
  reasonHi: string;
}

export function getRecommendedSpecialist(data: {
  chiefComplaint?: string;
  associatedSymptoms?: string[];
  notes?: string;
  age?: number;
  gender?: string;
}): SpecialistRecommendation {
  const textParts: string[] = [
    data.chiefComplaint || '',
    ...(data.associatedSymptoms || []),
    data.notes || '',
  ];
  const combined = textParts.join(' ').toLowerCase();

  // 1. Pediatric check (if age provided and under 14)
  if (data.age && data.age > 0 && data.age <= 14) {
    return {
      specialist: 'Pediatrician',
      specialistHi: 'बाल रोग विशेषज्ञ (Pediatrician)',
      department: 'Pediatrics / बाल रोग विभाग',
      icon: '👶',
      reason: 'Based on the patient age and symptoms reported, consultation with a Pediatrician may be appropriate.',
      reasonHi: 'मरीज की आयु और लक्षणों के आधार पर बाल रोग विशेषज्ञ से परामर्श उचित रहेगा।',
    };
  }

  // 2. Heart / Cardiovascular
  const heartKeywords = [
    'chest pain', 'heart', 'palpitation', 'angina', 'cardiac', 'pulse racing',
    'सीने में दर्द', 'दिल', 'धड़कन', 'घबराहट'
  ];
  if (heartKeywords.some((kw) => combined.includes(kw))) {
    return {
      specialist: 'Cardiologist',
      specialistHi: 'हृदय रोग विशेषज्ञ (Cardiologist)',
      department: 'Cardiology / हृदय रोग विभाग',
      icon: '❤️',
      reason: 'Based on the cardiovascular-related symptoms reported, consultation with a Cardiologist may be appropriate.',
      reasonHi: 'हृदय व सीने से संबंधित लक्षणों के आधार पर कार्डियोलॉजिस्ट से परामर्श उचित रहेगा।',
    };
  }

  // 3. Respiratory / Lungs
  const respiratoryKeywords = [
    'breath', 'breathing', 'wheezing', 'asthma', 'bronchitis', 'lung', 'phlegm', 'shortness of breath', 'dyspnea',
    'सांस लेने में तकलीफ', 'दमा', 'सांस फूलना', 'फेफड़े'
  ];
  if (respiratoryKeywords.some((kw) => combined.includes(kw))) {
    return {
      specialist: 'Pulmonologist',
      specialistHi: 'श्वसन व फेफड़ा रोग विशेषज्ञ (Pulmonologist)',
      department: 'Pulmonology / श्वसन रोग विभाग',
      icon: '🫁',
      reason: 'Based on the respiratory and lung-related symptoms reported, consultation with a Pulmonologist may be appropriate.',
      reasonHi: 'सांस व फेफड़ों से संबंधित लक्षणों के आधार पर पल्मोनोलॉजिस्ट से परामर्श उचित रहेगा।',
    };
  }

  // 4. Neurological
  const neuroKeywords = [
    'headache', 'migraine', 'dizziness', 'seizure', 'numbness', 'tingling', 'paralysis', 'tremor', 'vertigo', 'fainting', 'loss of balance',
    'सिर दर्द', 'चक्कर', 'माइग्रेन', 'दौरा', 'सुन्नपन', 'कमजोरी'
  ];
  if (neuroKeywords.some((kw) => combined.includes(kw))) {
    return {
      specialist: 'Neurologist',
      specialistHi: 'न्यूरोलॉजिस्ट / तंत्रिका रोग विशेषज्ञ (Neurologist)',
      department: 'Neurology / तंत्रिका रोग विभाग',
      icon: '🧠',
      reason: 'Based on the neurological symptoms reported, consultation with a Neurologist may be appropriate.',
      reasonHi: 'तंत्रिका व सिर दर्द संबंधी लक्षणों के आधार पर न्यूरोलॉजिस्ट से परामर्श उचित रहेगा।',
    };
  }

  // 5. Stomach / Digestion / Gastroenterology
  const gastroKeywords = [
    'stomach', 'digestion', 'abdominal', 'acidity', 'gas', 'bloating', 'constipation', 'diarrhea', 'vomiting', 'nausea', 'loose motion', 'heartburn',
    'पेट दर्द', 'पेट', 'गैस', 'एसिडिटी', 'उल्टी', 'दस्त', 'कब्ज', 'अपच', 'अफारा'
  ];
  if (gastroKeywords.some((kw) => combined.includes(kw))) {
    return {
      specialist: 'Gastroenterologist',
      specialistHi: 'पेट व पाचन रोग विशेषज्ञ (Gastroenterologist)',
      department: 'Gastroenterology / गैस्ट्रोएंटरोलॉजी',
      icon: '🥣',
      reason: 'Based on the digestive and abdominal symptoms reported, consultation with a Gastroenterologist may be appropriate.',
      reasonHi: 'पेट व पाचन संबंधी लक्षणों के आधार पर गैस्ट्रोएंटेरोलॉजिस्ट से परामर्श उचित रहेगा।',
    };
  }

  // 6. Bone / Joint / Muscle / Orthopedics
  const orthoKeywords = [
    'bone', 'joint', 'knee', 'backache', 'back pain', 'fracture', 'sprain', 'arthritis', 'shoulder pain', 'spine', 'swelling in joints',
    'जोड़', 'हड्डी', 'घुटने', 'कमर दर्द', 'पीठ दर्द', 'मोच', 'गठिया'
  ];
  if (orthoKeywords.some((kw) => combined.includes(kw))) {
    return {
      specialist: 'Orthopedist',
      specialistHi: 'हड्डी व जोड़ रोग विशेषज्ञ (Orthopedist)',
      department: 'Orthopedics / अस्थि रोग विभाग',
      icon: '🦴',
      reason: 'Based on the bone, joint, or musculoskeletal symptoms reported, consultation with an Orthopedist may be appropriate.',
      reasonHi: 'हड्डी, जोड़ या मांसपेशियों से संबंधित लक्षणों के आधार पर आर्थोपेडिस्ट से परामर्श उचित रहेगा।',
    };
  }

  // 7. Skin / Dermatology
  const skinKeywords = [
    'skin', 'rash', 'itching', 'acne', 'eczema', 'allergy', 'boil', 'redness', 'dermatitis', 'pigmentation',
    'त्वचा', 'खुजली', 'दाद', 'मुंहासे', 'दाने', 'एलर्जी'
  ];
  if (skinKeywords.some((kw) => combined.includes(kw))) {
    return {
      specialist: 'Dermatologist',
      specialistHi: 'त्वचा रोग विशेषज्ञ (Dermatologist)',
      department: 'Dermatology / त्वचा रोग विभाग',
      icon: '🧴',
      reason: 'Based on the skin-related symptoms reported, consultation with a Dermatologist may be appropriate.',
      reasonHi: 'त्वचा संबंधी लक्षणों के आधार पर त्वचा रोग विशेषज्ञ (डर्मेटोलॉजिस्ट) से परामर्श उचित रहेगा।',
    };
  }

  // 8. Ear / Nose / Throat / ENT
  const entKeywords = [
    'ear', 'throat', 'tonsil', 'hearing', 'sinus', 'runny nose', 'nasal', 'sore throat', 'earache', 'hoarseness',
    'कान', 'गला', 'नाक', 'टॉन्सिल', 'साइनस', 'गले में खराश'
  ];
  if (entKeywords.some((kw) => combined.includes(kw))) {
    return {
      specialist: 'ENT Specialist',
      specialistHi: 'ईएनटी विशेषज्ञ (कान, नाक, गला)',
      department: 'ENT / कान, नाक एवं गला विभाग',
      icon: '👂',
      reason: 'Based on the ear, nose, or throat symptoms reported, consultation with an ENT Specialist may be appropriate.',
      reasonHi: 'कान, नाक या गले से संबंधित लक्षणों के आधार पर ईएनटी विशेषज्ञ से परामर्श उचित रहेगा।',
    };
  }

  // 9. Eye / Ophthalmology
  const eyeKeywords = [
    'eye', 'vision', 'blurred', 'cataract', 'conjunctivitis', 'watery eyes', 'red eye', 'burning eye',
    'आँख', 'आंख', 'धुंधला', 'मोतियाबिंद', 'आंखों में जलन'
  ];
  if (eyeKeywords.some((kw) => combined.includes(kw))) {
    return {
      specialist: 'Ophthalmologist',
      specialistHi: 'नेत्र रोग विशेषज्ञ (Ophthalmologist)',
      department: 'Ophthalmology / नेत्र रोग विभाग',
      icon: '👁️',
      reason: 'Based on the vision and eye-related symptoms reported, consultation with an Ophthalmologist may be appropriate.',
      reasonHi: 'नेत्र संबंधी लक्षणों के आधार पर नेत्र रोग विशेषज्ञ से परामर्श उचित रहेगा।',
    };
  }

  // 10. Women's Health / Gynecology
  const gynecologyKeywords = [
    'pregnancy', 'pregnant', 'menstrual', 'period', 'periods', 'uterine', 'ovary', 'pcos', 'pelvic pain', 'gynecological',
    'गर्भावस्था', 'मासिक धर्म', 'पीरियड्स', 'गर्भाशय', 'महिला स्वास्थ्य'
  ];
  if (gynecologyKeywords.some((kw) => combined.includes(kw))) {
    return {
      specialist: 'Gynecologist',
      specialistHi: 'स्त्री रोग विशेषज्ञ (Gynecologist)',
      department: 'Gynecology / प्रसूति एवं स्त्री रोग विभाग',
      icon: '🌸',
      reason: "Based on the women's health and gynecological concerns reported, consultation with a Gynecologist may be appropriate.",
      reasonHi: 'महिला स्वास्थ्य संबंधी लक्षणों के आधार पर स्त्री रोग विशेषज्ञ से परामर्श उचित रहेगा।',
    };
  }

  // 11. Mental Health / Psychiatry
  const mentalHealthKeywords = [
    'anxiety', 'depression', 'stress', 'insomnia', 'panic', 'hallucination', 'mood', 'mental', 'nervousness',
    'तनाव', 'चिंता', 'अवसाद', 'अनिद्रा', 'घबराहट', 'मानसिक'
  ];
  if (mentalHealthKeywords.some((kw) => combined.includes(kw))) {
    return {
      specialist: 'Psychiatrist / Mental Health Specialist',
      specialistHi: 'मनोचिकित्सक (Psychiatrist)',
      department: 'Psychiatry / मनोचिकित्सा विभाग',
      icon: '🧘',
      reason: 'Based on the emotional wellbeing and mental health concerns reported, consultation with a Mental Health Specialist may be appropriate.',
      reasonHi: 'मानसिक स्वास्थ्य व तनाव संबंधी लक्षणों के आधार पर मनोचिकित्सक से परामर्श उचित रहेगा।',
    };
  }

  // 12. Default / General Physician
  return {
    specialist: 'General Physician',
    specialistHi: 'सामान्य चिकित्सक (General Physician)',
    department: 'General Medicine / सामान्य चिकित्सा विभाग',
    icon: '👨‍⚕️',
    reason: 'Based on the symptoms provided, consultation with a General Physician may be appropriate for comprehensive evaluation.',
    reasonHi: 'दिए गए सामान्य स्वास्थ्य लक्षणों के आधार पर सामान्य चिकित्सक (General Physician) से परामर्श उचित रहेगा।',
  };
}
