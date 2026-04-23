-- Healthcare workers
CREATE TABLE workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    role VARCHAR(50), -- ASHA, ANM, etc.
    created_at TIMESTAMP DEFAULT NOW()
);

-- FHIR-aligned Patient resource
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    local_id VARCHAR(50) UNIQUE,          -- device-generated ID for offline
    fhir_resource JSONB,                  -- full FHIR Patient JSON
    created_at TIMESTAMP DEFAULT NOW(),
    synced_at TIMESTAMP,
    worker_id UUID REFERENCES workers(id)
);

-- Clinical encounters (maps to FHIR Encounter)
CREATE TABLE encounters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id),
    soap_note TEXT,                       -- generated SOAP note
    voice_transcript TEXT,
    audio_r2_key VARCHAR(255),            -- Cloudflare R2 key
    spO2 INT,
    heart_rate INT,
    systolic INT,
    age INT,
    pregnant BOOLEAN,
    triage_score VARCHAR(10),             -- LOW / MEDIUM / HIGH / CRITICAL
    triage_rationale JSONB,               -- AI reasoning breakdown
    sync_status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT NOW(),
    synced_at TIMESTAMP
);

-- Diagnostic findings (image-based)
CREATE TABLE diagnostics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encounter_id UUID REFERENCES encounters(id),
    image_r2_key VARCHAR(255),
    model_name VARCHAR(100),
    prediction VARCHAR(100),              -- e.g. "diabetic_retinopathy_mild"
    confidence_score DECIMAL(5,4),        -- 0.0000 to 1.0000
    raw_output JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sync log for conflict resolution
CREATE TABLE sync_log (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(100),
    entity_type VARCHAR(50),
    entity_id UUID,
    operation VARCHAR(10),                -- INSERT / UPDATE / DELETE
    payload JSONB,
    client_timestamp TIMESTAMP,
    server_timestamp TIMESTAMP DEFAULT NOW(),
    conflict_resolved BOOLEAN DEFAULT FALSE
);