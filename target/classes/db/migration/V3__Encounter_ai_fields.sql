-- V3: Add AI result columns missing from V1
ALTER TABLE encounters ADD COLUMN diagnosis TEXT;
ALTER TABLE encounters ADD COLUMN treatment_plan TEXT;
ALTER TABLE encounters ADD COLUMN medicines TEXT;
ALTER TABLE encounters ADD COLUMN safety_notes TEXT;
ALTER TABLE encounters ADD COLUMN confidence DOUBLE;
ALTER TABLE encounters ADD COLUMN triage VARCHAR(50);