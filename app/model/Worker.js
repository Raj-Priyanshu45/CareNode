// app/model/Worker.js
import { Model } from '@nozbe/watermelondb';
import { field, text, date } from '@nozbe/watermelondb/decorators';

export default class Worker extends Model {
  static table = 'workers';
  static associations = {
    patients: { type: 'has_many', foreignKey: 'worker_id' },
  };

  @field('username') username;
  @field('password_hash') passwordHash;
  @text('name') name;
  @field('role') role;
  @date('created_at') createdAt;
}