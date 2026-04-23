// app/model/Encounter.js
import { Model } from '@nozbe/watermelondb';
import { field, text, date, relation, json } from '@nozbe/watermelondb/decorators';

export default class Encounter extends Model {
  static table = 'encounters';
  static associations = {
    patients: { type: 'belongs_to', foreignKey: 'patient_id' },
    diagnostics: { type: 'has_many', foreignKey: 'encounter_id' },
  };

  @relation('patients', 'patient_id') patient;
  @text('soap_note') soapNote;
  @text('voice_transcript') voiceTranscript;
  @field('audio_r2_key') audioR2Key;
  @field('sp_o2') spO2;
  @field('heart_rate') heartRate;
  @field('systolic') systolic;
  @field('age') age;
  @field('pregnant') pregnant;
  @field('triage_score') triageScore;
  @json('triage_rationale', (json) => json) triageRationale;
  @text('diagnosis') diagnosis;
  @text('treatment_plan') treatmentPlan;
  @text('medicines') medicines;
  @text('safety_notes') safetyNotes;
  @field('confidence') confidence;
  @text('triage') triage;
  @field('sync_status') syncStatus;
  @date('created_at') createdAt;
  @date('synced_at') syncedAt;
}