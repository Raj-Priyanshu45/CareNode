// app/model/Patient.js
import { Model } from '@nozbe/watermelondb';
import { field, json, date, relation } from '@nozbe/watermelondb/decorators';

export default class Patient extends Model {
  static table = 'patients';
  static associations = {
    encounters: { type: 'has_many', foreignKey: 'patient_id' },
    workers: { type: 'belongs_to', key: 'worker_id' },
  };

  @field('local_id') localId;
  @json('fhir_resource', (json) => json) fhirResource;
  @date('created_at') createdAt;
  @date('synced_at') syncedAt;
  @relation('workers', 'worker_id') worker;
}