// app/model/SyncLog.js
import { Model } from '@nozbe/watermelondb';
import { field, text, date, json } from '@nozbe/watermelondb/decorators';

export default class SyncLog extends Model {
  static table = 'sync_logs';

  @field('device_id') deviceId;
  @field('entity_type') entityType;
  @field('entity_id') entityId;
  @field('operation') operation;
  @json('payload', (json) => json) payload;
  @date('client_timestamp') clientTimestamp;
  @date('server_timestamp') serverTimestamp;
  @field('conflict_resolved') conflictResolved;
}