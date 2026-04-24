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
  const patientsCollection = database.collections.get('patients');

  // Always try remote first when we have a token
  try {
    const response = await fetch(`${BASE_URL}/patients`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const remotePatients = await response.json();

      await database.write(async () => {
        for (const rp of remotePatients) {
          const existing = await patientsCollection.query(
            require('@nozbe/watermelondb/QueryDescription').Q.where('_id', rp.id)
          ).fetch();
          if (existing.length === 0) {
            await patientsCollection.create(p => {
              p._raw.id = rp.id;
              p.localId = rp.localId;
              p.fhirResource = typeof rp.fhirResource === 'string'
                ? rp.fhirResource
                : JSON.stringify(rp.fhirResource);
              p.createdAt = rp.createdAt ? new Date(rp.createdAt).getTime() : Date.now();
              p.syncedAt = Date.now();
            });
          }
        }
      });

      return remotePatients;
    }
  } catch (e) {
    console.warn('[Patients] Offline — serving local cache');
  }

  // Fallback to local only when offline
  const local = await patientsCollection.query().fetch();
  return local.map(p => ({ id: p.id, localId: p.localId, fhirResource: p.fhirResource }));
}

export async function getPatient(patientId) {
  const patientsCollection = database.collections.get('patients');
  const patient = await patientsCollection.find(patientId);
  return patient;
}

export async function createPatient(token, patientData) {
  const patientsCollection = database.collections.get('patients');
  let newPatient;

  await database.write(async () => {
    newPatient = await patientsCollection.create(patient => {
      patient.localId = patientData.localId;
      patient.fhirResource = JSON.stringify({
        resourceType: 'Patient',
        name: [{ text: patientData.name }],
        birthDate: patientData.birthDate,
        gender: patientData.gender,
        telecom: [{ value: patientData.phone }],
        address: [{ text: patientData.address }]
      });
      patient.createdAt = new Date().getTime();
      patient.syncedAt = new Date().getTime();
    });
  });

  // Push to backend while online
  try {
    await fetch(`${BASE_URL}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        localId: patientData.localId,
        fhirResource: JSON.stringify({
          resourceType: 'Patient',
          name: [{ text: patientData.name }],
          birthDate: patientData.birthDate,
          gender: patientData.gender,
          telecom: [{ value: patientData.phone }],
          address: [{ text: patientData.address }]
        })
      }),
    });
  } catch (e) {
    console.warn('[Sync] Offline — patient queued locally only');
  }

  // Trigger sync
  // await performSync(token);  // Removed: data already pushed via direct API call above

  return { id: newPatient.id, localId: newPatient.localId };
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

  // Push to backend while online
  try {
    await fetch(`${BASE_URL}/encounters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        patient: { id: encounterData.patient.id },
        spo2: encounterData.spo2,
        heartRate: encounterData.heartRate,
        systolic: encounterData.systolic,
        age: encounterData.age,
        pregnant: encounterData.pregnant,
      }),
    });
  } catch (e) {
    console.warn('[Sync] Offline — encounter queued locally only');
  }

  // Trigger a sync after local creation
  // await performSync(token);  // Removed: data already pushed via direct API call above

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
      encounter.update(e => {
        e.voiceTranscript = result.speech_to_text;
        e.soapNote = JSON.stringify({
          subjective: result.speech_to_text,
          objective: `Confidence: ${result.confidence}`,
          assessment: result.doctor_response,
          plan: `${result.treatment_plan}. Medicines: ${result.medicines}. Safety: ${result.safety_notes}. Triage: ${result.triage}`
        });
        e.triageScore = result.triage || encounter.triageScore;
        e.diagnosis = result.doctor_response;
        e.treatmentPlan = result.treatment_plan;
        e.medicines = result.medicines;
        e.safetyNotes = result.safety_notes;
        e.confidence = result.confidence;
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
    enc.update(e => {
      e.diagnosis = result.doctor_response;
      e.treatmentPlan = result.treatment_plan;
      e.medicines = result.medicines;
      e.safetyNotes = result.safety_notes;
      e.confidence = result.confidence;
      e.triage = result.triage;
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