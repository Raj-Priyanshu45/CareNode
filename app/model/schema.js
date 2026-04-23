// app/model/schema.js
import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const mySchema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'workers',
      columns: [
        { name: 'username', type: 'string', isIndexed: true },
        { name: 'password_hash', type: 'string' },
        { name: 'name', type: 'string', isOptional: true },
        { name: 'role', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'patients',
      columns: [
        { name: 'local_id', type: 'string', isIndexed: true, isOptional: true },
        { name: 'fhir_resource', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'worker_id', type: 'string', isIndexed: true, isOptional: true },
      ],
    }),
    tableSchema({
      name: 'encounters',
      columns: [
        { name: 'patient_id', type: 'string', isIndexed: true },
        { name: 'soap_note', type: 'string', isOptional: true },
        { name: 'voice_transcript', type: 'string', isOptional: true },
        { name: 'audio_r2_key', type: 'string', isOptional: true },
        { name: 'sp_o2', type: 'number', isOptional: true },
        { name: 'heart_rate', type: 'number', isOptional: true },
        { name: 'systolic', type: 'number', isOptional: true },
        { name: 'age', type: 'number', isOptional: true },
        { name: 'pregnant', type: 'boolean', isOptional: true },
        { name: 'triage_score', type: 'string', isOptional: true },
        { name: 'triage_rationale', type: 'string', isOptional: true },
        { name: 'diagnosis', type: 'string', isOptional: true },
        { name: 'treatment_plan', type: 'string', isOptional: true },
        { name: 'medicines', type: 'string', isOptional: true },
        { name: 'safety_notes', type: 'string', isOptional: true },
        { name: 'confidence', type: 'number', isOptional: true },
        { name: 'triage', type: 'string', isOptional: true },
        { name: 'sync_status', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'diagnostics',
      columns: [
        { name: 'encounter_id', type: 'string', isIndexed: true },
        { name: 'image_r2_key', type: 'string', isOptional: true },
        { name: 'model_name', type: 'string', isOptional: true },
        { name: 'prediction', type: 'string', isOptional: true },
        { name: 'confidence_score', type: 'number', isOptional: true },
        { name: 'raw_output', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'sync_logs',
      columns: [
        { name: 'device_id', type: 'string', isOptional: true },
        { name: 'entity_type', type: 'string' },
        { name: 'entity_id', type: 'string', isIndexed: true },
        { name: 'operation', type: 'string' },
        { name: 'payload', type: 'string', isOptional: true },
        { name: 'client_timestamp', type: 'number' },
        { name: 'server_timestamp', type: 'number' },
        { name: 'conflict_resolved', type: 'boolean' },
      ],
    }),
  ],
});