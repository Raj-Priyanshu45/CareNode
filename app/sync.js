// app/sync.js
import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from './model';
import Constants from 'expo-constants';
import { getDeviceId } from './deviceId';

const BASE_URL =
  Constants.expoConfig?.extra?.BASE_URL ||
  (__DEV__ ? 'http://10.0.2.2:8080/api' : 'https://your-railway-url.com/api');

export async function performSync(token) {
  const deviceId = await getDeviceId();
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
      console.log('Pulling changes from server...');
      const response = await fetch(`${BASE_URL}/sync/pull?since=${lastPulledAt ? new Date(lastPulledAt).toISOString() : new Date(0).toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Device-Id': deviceId,
          },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to pull changes');
      }
      const { changes, timestamp } = await response.json();
      return { changes, timestamp };
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      console.log('Pushing changes to server...');
      const response = await fetch(`${BASE_URL}/sync/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'Device-Id': deviceId,
        },
        body: JSON.stringify({ changes }),
      });
      if (!response.ok) {
        const errorBody = await response.json();
        console.error('Failed to push changes:', errorBody);
        throw new Error('Failed to push changes');
      }
      const syncResponse = await response.json();
      if (syncResponse.conflicts && syncResponse.conflicts.length > 0) {
        console.warn('Conflicts detected during push:', syncResponse.conflicts);
        // Implement last-write-wins: assume server wins for simplicity
        // In a real app, resolve based on timestamps or user choice
      }
    },
    sendCreatedAsUpdated: true,
  });
  console.log('Synchronization complete!');
}