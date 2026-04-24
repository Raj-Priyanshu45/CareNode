import { database } from './model';
import Constants from 'expo-constants';
import { getDeviceId } from './deviceId';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL =
  Constants.expoConfig?.extra?.BASE_URL ||
  (__DEV__ ? 'http://10.0.2.2:8080/api' : 'https://your-railway-url.com/api');

const LAST_SYNC_KEY = 'lastSyncTimestamp';

export async function performSync(token) {
  const deviceId = await getDeviceId();

  // 1. Push any encounters still in PENDING status
  try {
    const encountersCollection = database.collections.get('encounters');
    const pending = await encountersCollection
      .query(require('@nozbe/watermelondb/QueryDescription').Q.where('sync_status', 'PENDING'))
      .fetch();

    if (pending.length > 0) {
      const changes = pending.map(e => ({
        entityType: 'ENCOUNTER',
        entityId: e.id,
        operation: 'UPDATE',
        payload: JSON.stringify({
          soapNote: e.soapNote,
          voiceTranscript: e.voiceTranscript,
          triageScore: e.triageScore,
        }),
        clientTimestamp: new Date(e.createdAt).toISOString(),
      }));

      const pushRes = await fetch(`${BASE_URL}/sync/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'Device-Id': deviceId,
        },
        body: JSON.stringify({ changes }),
      });

      if (pushRes.ok) {
        const { accepted } = await pushRes.json();
        await database.write(async () => {
          for (const enc of pending) {
            if (accepted.includes(enc.id)) {
              await enc.update(e => {
                e.syncStatus = 'SYNCED';
                e.syncedAt = Date.now();
              });
            }
          }
        });
        console.log(`[Sync] Pushed ${accepted.length} encounters`);
      }
    }
  } catch (e) {
    console.warn('[Sync] Push failed:', e.message);
    return; // offline — try again next interval
  }

  // 2. Pull changes from other devices
  try {
    const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
    const since = lastSync || new Date(0).toISOString();

    const pullRes = await fetch(
      `${BASE_URL}/sync/pull?since=${encodeURIComponent(since)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Device-Id': deviceId,
        },
      }
    );

    if (pullRes.ok) {
      const { changes, timestamp } = await pullRes.json();
      console.log(`[Sync] Pulled ${changes.length} changes from server`);
      await AsyncStorage.setItem(LAST_SYNC_KEY, new Date(timestamp).toISOString());
    }
  } catch (e) {
    console.warn('[Sync] Pull failed:', e.message);
  }
}