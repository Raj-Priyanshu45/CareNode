-- V3: Add AI result columns missing from V1
-- Encounter entity references these fields; without them Hibernate
-- validation fails and the application will not start.

ALTER TABLE encounters ADD COLUMN IF NOT EXISTS diagnosis TEXT;
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS treatment_plan TEXT;
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS medicines TEXT;
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS safety_notes TEXT;
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS confidence DOUBLE PRECISION;
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS triage VARCHAR(50);