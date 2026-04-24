CREATE TABLE workers (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE patients (
    id VARCHAR(36) PRIMARY KEY,
    local_id VARCHAR(50) UNIQUE,
    fhir_resource JSON,
    created_at TIMESTAMP DEFAULT NOW(),
    synced_at TIMESTAMP NULL,
    worker_id VARCHAR(36) REFERENCES workers(id)
);

CREATE TABLE encounters (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) REFERENCES patients(id),
    soap_note TEXT,
    voice_transcript TEXT,
    audio_r2_key VARCHAR(255),
    spO2 INT,
    heart_rate INT,
    systolic INT,
    age INT,
    pregnant BOOLEAN,
    triage_score VARCHAR(10),
    triage_rationale JSON,
    sync_status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT NOW(),
    synced_at TIMESTAMP NULL
);

CREATE TABLE diagnostics (
    id VARCHAR(36) PRIMARY KEY,
    encounter_id VARCHAR(36) REFERENCES encounters(id),
    image_r2_key VARCHAR(255),
    model_name VARCHAR(100),
    prediction VARCHAR(100),
    confidence_score DECIMAL(5,4),
    raw_output JSON,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sync_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(100),
    entity_type VARCHAR(50),
    entity_id VARCHAR(36),
    operation VARCHAR(10),
    payload JSON,
    client_timestamp TIMESTAMP NULL,
    server_timestamp TIMESTAMP DEFAULT NOW(),
    conflict_resolved BOOLEAN DEFAULT FALSE
);