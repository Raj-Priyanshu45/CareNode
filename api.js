import Constants from 'expo-constants';
import { database } from './app/model';
import { performSync } from './app/sync';

const BASE_URL =
  Constants.expoConfig?.extra?.BASE_URL ||
  (__DEV__ ? 'http://10.0.2.2:8080/api' : 'https://your-railway-url.com/api');

const AI_BASE_URL =
  Constants.expoConfig?.extra?.AI_BASE_URL ||
  (__DEV__ ? 'http://10.0.2.2:8000' : 'https://your-ai-url.com');

export async function login(username, password) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    throw new Error('Login failed');
  }
  return response.json();
}

export async function fetchPatients(token) {
  // First, try to fetch from local DB
  const patientsCollection = database.collections.get('patients');
  const localPatients = await patientsCollection.query().fetch();

  if (localPatients.length > 0) {
    console.log('Serving patients from local DB');
    return localPatients.map(p => ({ id: p.id, localId: p.localId, fhirResource: p.fhirResource }));
  }

  // If no local data, fetch from remote and sync
  console.log('Fetching patients from remote API');
  const response = await fetch(`${BASE_URL}/patients`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Unable to load patients');
  }
  const remotePatients = await response.json();

  // Save remote patients to local DB
  await database.write(async () => {
    for (const remotePatient of remotePatients) {
      await patientsCollection.create(patient => {
        patient._raw.id = remotePatient.id;
        patient.localId = remotePatient.localId;
        patient.fhirResource = remotePatient.fhirResource;
        patient.createdAt = new Date(remotePatient.createdAt).getTime();
        patient.syncedAt = new Date().getTime();
      });
    }
  });

  return remotePatients;
}

export async function getPatient(patientId) {
  const patientsCollection = database.collections.get('patients');
  const patient = await patientsCollection.find(patientId);
  return patient;
}

export async function createEncounter(token, encounterData) {
  const encountersCollection = database.collections.get('encounters');
  let newEncounter;

  await database.write(async () => {
    newEncounter = await encountersCollection.create(encounter => {
      encounter.patient.id = encounterData.patient.id;
      encounter.spO2 = encounterData.spo2;
      encounter.heartRate = encounterData.heartRate;
      encounter.systolic = encounterData.systolic;
      encounter.age = encounterData.age;
      encounter.pregnant = encounterData.pregnant;
      encounter.syncStatus = 'PENDING';
      encounter.createdAt = new Date().getTime();
    });
  });

  // Trigger a sync after local creation
  await performSync(token);

  return { id: newEncounter.id, triageScore: newEncounter.triageScore };
}

export async function transcribeEncounterAudio(token, encounterId, uri) {
  // Get patient data
  const encounterCollection = database.collections.get('encounters');
  const encounter = await encounterCollection.find(encounterId);
  const patient = await getPatient(encounter.patient.id);

  let patientData = {};
  try {
    patientData = JSON.parse(patient.fhirResource);
  } catch {
    patientData = { name: [{ text: 'Unknown' }], birthDate: '1990-01-01', gender: 'unknown', telecom: [{ value: '0000000000' }], address: [{ text: 'Unknown' }] };
  }

  const formData = new FormData();
  formData.append('audio', {
    uri,
    name: 'recording.wav',
    type: 'audio/wav',
  });
  formData.append('patient_id', patient.localId || patient.id);
  formData.append('patient_name', patientData.name?.[0]?.text || 'Unknown');
  formData.append('age', encounter.age ? encounter.age.toString() : '30');
  formData.append('sex', patientData.gender || 'Unknown');
  formData.append('date_of_birth', patientData.birthDate || '1990-01-01');
  formData.append('phone_no', patientData.telecom?.[0]?.value || '0000000000');
  formData.append('address', patientData.address?.[0]?.text || 'Unknown');

  const response = await fetch(`${AI_BASE_URL}/full_diagnose`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Unable to transcribe audio');
  }
  const result = await response.json();

  // Store locally in WatermelonDB
  await database.write(async () => {
    const encounter = await database.collections.get('encounters').find(encounterId);
    if (encounter) {
      encounter.update(encounter => {
        encounter.voiceTranscript = result.speech_to_text;
        encounter.soapNote = JSON.stringify({
          subjective: result.speech_to_text,
          objective: `Confidence: ${result.confidence}`,
          assessment: result.doctor_response,
          plan: `${result.treatment_plan}. Medicines: ${result.medicines}. Safety: ${result.safety_notes}. Triage: ${result.triage}`
        });
        encounter.triageScore = result.triage || encounter.triageScore;
        encounter.diagnosis = result.doctor_response;
        encounter.treatmentPlan = result.treatment_plan;
        encounter.medicines = result.medicines;
        encounter.safetyNotes = result.safety_notes;
        encounter.confidence = result.confidence;
      });
    }
  });

  return { transcript: result.speech_to_text, soap: {
    subjective: result.speech_to_text,
    objective: `Confidence: ${result.confidence}`,
    assessment: result.doctor_response,
    plan: `${result.treatment_plan}. Medicines: ${result.medicines}. Safety: ${result.safety_notes}. Triage: ${result.triage}`
  } };
}

export async function uploadDiagnostic(token, encounterId, uri, modelType) {
  // Get patient data
  const encounterCollection = database.collections.get('encounters');
  const encounter = await encounterCollection.find(encounterId);
  const patient = await getPatient(encounter.patient.id);

  let patientData = {};
  try {
    patientData = JSON.parse(patient.fhirResource);
  } catch {
    patientData = { name: [{ text: 'Unknown' }], birthDate: '1990-01-01', gender: 'unknown', telecom: [{ value: '0000000000' }], address: [{ text: 'Unknown' }] };
  }

  const formData = new FormData();
  formData.append('image', {
    uri,
    name: 'diagnostic.jpg',
    type: 'image/jpeg',
  });
  formData.append('patient_id', patient.localId || patient.id);
  formData.append('patient_name', patientData.name?.[0]?.text || 'Unknown');
  formData.append('age', encounter.age ? encounter.age.toString() : '30');
  formData.append('sex', patientData.gender || 'Unknown');
  formData.append('date_of_birth', patientData.birthDate || '1990-01-01');
  formData.append('phone_no', patientData.telecom?.[0]?.value || '0000000000');
  formData.append('address', patientData.address?.[0]?.text || 'Unknown');

  const response = await fetch(`${AI_BASE_URL}/full_diagnose`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Unable to upload diagnostic');
  }
  const result = await response.json();

  // Store locally in WatermelonDB
  await database.write(async () => {
    await database.collections.get('diagnostics').create(diagnostic => {
      diagnostic.encounter.id = encounterId;
      diagnostic.imageR2Key = uri; // or result key
      diagnostic.modelName = modelType;
      diagnostic.prediction = result.doctor_response;
      diagnostic.confidenceScore = result.confidence;
      diagnostic.rawOutput = JSON.stringify(result);
      diagnostic.createdAt = new Date().getTime();
    });
    // Also update encounter with AI results
    const enc = await encounterCollection.find(encounterId);
    enc.update(enc => {
      enc.diagnosis = result.doctor_response;
      enc.treatmentPlan = result.treatment_plan;
      enc.medicines = result.medicines;
      enc.safetyNotes = result.safety_notes;
      enc.confidence = result.confidence;
      enc.triage = result.triage;
    });
  });

  return {
    prediction: result.doctor_response,
    confidence: result.confidence,
    requires_referral: result.confidence > 0.75
  };
}

export async function logout(token) {
  const response = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Logout failed');
  }
  return response.text();
}