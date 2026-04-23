// app/model/index.js
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqliteAdapter';

import { mySchema } from './schema';
import Patient from './Patient';
import Encounter from './Encounter';
import Diagnostic from './Diagnostic';
import Worker from './Worker';
import SyncLog from './SyncLog';

const adapter = new SQLiteAdapter({
  schema: mySchema,
});

export const database = new Database({
  adapter,
  modelClasses: [Patient, Encounter, Diagnostic, Worker, SyncLog],
  actionsEnabled: true,
});