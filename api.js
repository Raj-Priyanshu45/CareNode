const BASE_URL = __DEV__
  ? 'http://YOUR_LAPTOP_IP:8080/api'   // physical phone
  : 'https://your-railway-url.com/api'; // production

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
  const response = await fetch(`${BASE_URL}/patients`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Unable to load patients');
  }
  return response.json();
}

export async function createEncounter(token, encounter) {
  const response = await fetch(`${BASE_URL}/encounters`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(encounter),
  });
  if (!response.ok) {
    throw new Error('Unable to save encounter');
  }
  return response.json();
}

export async function transcribeEncounterAudio(token, encounterId, uri) {
  const formData = new FormData();
  formData.append('audio', {
    uri,
    name: 'recording.wav',
    type: 'audio/wav',
  });
  const response = await fetch(`${BASE_URL}/encounters/${encounterId}/transcribe`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Unable to transcribe audio');
  }
  return response.json();
}

export async function uploadDiagnostic(token, encounterId, uri, modelType) {
  const formData = new FormData();
  formData.append('image', {
    uri,
    name: 'diagnostic.jpg',
    type: 'image/jpeg',
  });
  formData.append('encounterId', encounterId);
  formData.append('modelType', modelType);
  const response = await fetch(`${BASE_URL}/diagnostics`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Unable to upload diagnostic');
  }
  return response.json();
}