package com.carenode.sync;

import com.carenode.entity.Encounter;
import com.carenode.entity.Patient;
import com.carenode.entity.SyncLog;
import com.carenode.repository.EncounterRepository;
import com.carenode.repository.PatientRepository;
import com.carenode.repository.SyncLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class SyncService {

    private final SyncLogRepository syncLogRepository;
    private final PatientRepository patientRepository;
    private final EncounterRepository encounterRepository;
    private final ObjectMapper objectMapper = new ObjectMapper()
        .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    public SyncService(SyncLogRepository syncLogRepository,
                       PatientRepository patientRepository,
                       EncounterRepository encounterRepository) {
        this.syncLogRepository = syncLogRepository;
        this.patientRepository = patientRepository;
        this.encounterRepository = encounterRepository;
    }

    public SyncResponse processBatch(SyncBatchRequest request, String deviceId) {
        List<SyncConflict> conflicts = new ArrayList<>();
        List<UUID> accepted = new ArrayList<>();

        for (SyncRecord record : request.getChanges()) {
            Optional<SyncLog> existing = syncLogRepository.findTopByEntityIdOrderByServerTimestampDesc(record.getEntityId());

            if (existing.isPresent() &&
                existing.get().getServerTimestamp().isAfter(record.getClientTimestamp())) {
                conflicts.add(new SyncConflict(record, existing.get()));
            } else {
                applyChange(record, deviceId);
                accepted.add(record.getEntityId());
            }
        }

        return new SyncResponse(accepted, conflicts, LocalDateTime.now());
    }

    private void applyChange(SyncRecord record, String deviceId) {
        SyncLog log = new SyncLog();
        log.setDeviceId(deviceId);
        log.setEntityType(record.getEntityType());
        log.setEntityId(record.getEntityId());
        log.setOperation(record.getOperation());
        log.setPayload(record.getPayload());
        log.setClientTimestamp(record.getClientTimestamp());
        log.setServerTimestamp(LocalDateTime.now());
        syncLogRepository.save(log);

        try {
            if ("PATIENT".equalsIgnoreCase(record.getEntityType())) {
                Map<String, Object> body = objectMapper.readValue(record.getPayload(), Map.class);
                Patient patient = patientRepository.findById(record.getEntityId()).orElse(new Patient());
                patient.setId(record.getEntityId());
                patient.setLocalId((String) body.get("localId"));
                patient.setFhirResource(objectMapper.writeValueAsString(body.get("fhirResource")));
                patientRepository.save(patient);
            } else if ("ENCOUNTER".equalsIgnoreCase(record.getEntityType())) {
                Map<String, Object> body = objectMapper.readValue(record.getPayload(), Map.class);
                Encounter encounter = encounterRepository.findById(record.getEntityId()).orElse(new Encounter());
                encounter.setId(record.getEntityId());
                if (body.containsKey("soapNote")) {
                    encounter.setSoapNote((String) body.get("soapNote"));
                }
                if (body.containsKey("voiceTranscript")) {
                    encounter.setVoiceTranscript((String) body.get("voiceTranscript"));
                }
                if (body.containsKey("triageScore")) {
                    encounter.setTriageScore((String) body.get("triageScore"));
                }
                if (body.containsKey("triageRationale")) {
                    encounter.setTriageRationale(objectMapper.writeValueAsString(body.get("triageRationale")));
                }
                encounterRepository.save(encounter);
            }
        } catch (Exception ignore) {
            // sync payload parse failed, but log still records the request
        }
    }

    public List<SyncLog> getChangesSince(LocalDateTime since, String deviceId) {
        return syncLogRepository.findByServerTimestampAfter(since);
    }

    public static class SyncBatchRequest {
        private List<SyncRecord> changes;

        public List<SyncRecord> getChanges() { return changes; }
        public void setChanges(List<SyncRecord> changes) { this.changes = changes; }
    }

    public static class SyncRecord {
        private String entityType;
        private UUID entityId;
        private String operation;
        private String payload;
        private LocalDateTime clientTimestamp;

        public String getEntityType() { return entityType; }
        public void setEntityType(String entityType) { this.entityType = entityType; }
        public UUID getEntityId() { return entityId; }
        public void setEntityId(UUID entityId) { this.entityId = entityId; }
        public String getOperation() { return operation; }
        public void setOperation(String operation) { this.operation = operation; }
        public String getPayload() { return payload; }
        public void setPayload(String payload) { this.payload = payload; }
        public LocalDateTime getClientTimestamp() { return clientTimestamp; }
        public void setClientTimestamp(LocalDateTime clientTimestamp) { this.clientTimestamp = clientTimestamp; }
    }

    public static class SyncResponse {
        private List<UUID> accepted;
        private List<SyncConflict> conflicts;
        private LocalDateTime lastSynced;

        public SyncResponse(List<UUID> accepted, List<SyncConflict> conflicts, LocalDateTime lastSynced) {
            this.accepted = accepted;
            this.conflicts = conflicts;
            this.lastSynced = lastSynced;
        }

        public List<UUID> getAccepted() { return accepted; }
        public List<SyncConflict> getConflicts() { return conflicts; }
        public LocalDateTime getLastSynced() { return lastSynced; }
    }

    public static class SyncConflict {
        private SyncRecord clientRecord;
        private SyncLog serverLog;

        public SyncConflict(SyncRecord clientRecord, SyncLog serverLog) {
            this.clientRecord = clientRecord;
            this.serverLog = serverLog;
        }

        public SyncRecord getClientRecord() { return clientRecord; }
        public SyncLog getServerLog() { return serverLog; }
    }
}