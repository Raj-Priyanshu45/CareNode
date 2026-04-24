-- V2: Performance indexes for production workloads
-- These are absent from V1 but become critical once you have >100 patients
-- and concurrent devices pushing sync batches.

-- sync_log is the hottest table: every push/pull queries it by entity_id and
-- server_timestamp. Without an index the conflict-resolution query is a full
-- table scan.
CREATE INDEX IF NOT EXISTS idx_sync_log_entity_id
    ON sync_log (entity_id);

CREATE INDEX IF NOT EXISTS idx_sync_log_server_timestamp
    ON sync_log (server_timestamp DESC);

-- Composite index for the pull query:
-- SELECT * FROM sync_log WHERE server_timestamp > ? AND device_id != ?
CREATE INDEX IF NOT EXISTS idx_sync_log_pull
    ON sync_log (server_timestamp, device_id);

-- Encounters ordered by triage severity (the dashboard query)
-- The CASE expression in the JPQL ORDER BY cannot use a B-tree index directly,
-- but indexing triage_score alone speeds up the sort significantly on large tables.
CREATE INDEX IF NOT EXISTS idx_encounters_triage_score
    ON encounters (triage_score);

-- Patient lookup by local_id (offline sync matching)
CREATE INDEX IF NOT EXISTS idx_patients_local_id
    ON patients (local_id);

-- Encounter lookup by patient for the /patients/{id}/encounters endpoint
CREATE INDEX IF NOT EXISTS idx_encounters_patient_id
    ON encounters (patient_id, created_at DESC);

-- Diagnostics by encounter
CREATE INDEX IF NOT EXISTS idx_diagnostics_encounter_id
    ON diagnostics (encounter_id);