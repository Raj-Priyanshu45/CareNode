// app/model/Diagnostic.js
import { Model } from '@nozbe/watermelondb';
import { field, text, date, relation, json } from '@nozbe/watermelondb/decorators';

export default class Diagnostic extends Model {
  static table = 'diagnostics';
  static associations = {
    encounters: { type: 'belongs_to', foreignKey: 'encounter_id' },
  };

  @relation('encounters', 'encounter_id') encounter;
  @field('image_r2_key') imageR2Key;
  @field('model_name') modelName;
  @field('prediction') prediction;
  @field('confidence_score') confidenceScore;
  @json('raw_output', (json) => json) rawOutput;
  @date('created_at') createdAt;
}