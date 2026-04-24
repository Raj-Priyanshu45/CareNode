-- V2: Performance indexes for production workloads

CREATE INDEX idx_sync_log_entity_id
    ON sync_log (entity_id);

CREATE INDEX idx_sync_log_server_timestamp
    ON sync_log (server_timestamp DESC);

CREATE INDEX idx_sync_log_pull
    ON sync_log (server_timestamp, device_id);

CREATE INDEX idx_encounters_triage_score
    ON encounters (triage_score);

CREATE INDEX idx_patients_local_id
    ON patients (local_id);

CREATE INDEX idx_encounters_patient_id
    ON encounters (patient_id, created_at DESC);

CREATE INDEX idx_diagnostics_encounter_id
    ON diagnostics (encounter_id);