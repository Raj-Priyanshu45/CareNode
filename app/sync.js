// app/sync.js
import { database } from './model';
import Constants from 'expo-constants';
import { getDeviceId } from './deviceId';

const BASE_URL =
  Constants.expoConfig?.extra?.BASE_URL ||
  (__DEV__ ? 'http://10.0.2.2:8080/api' : 'https://your-railway-url.com/api');

export async function performSync(token) {
  const deviceId = await getDeviceId();
  console.log(`[Sync] triggered for device ${deviceId} — data already pushed via direct API calls`);
  // Direct API calls in createPatient/createEncounter handle persistence.
  // WatermelonDB is the local source of truth; backend is updated inline.
}