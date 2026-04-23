package com.carenode.sync;

import com.carenode.entity.SyncLog;
import com.carenode.repository.SyncLogRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SyncService {

    private final SyncLogRepository syncLogRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SyncService(SyncLogRepository syncLogRepository) {
        this.syncLogRepository = syncLogRepository;
    }

    public SyncResponse processBatch(SyncBatchRequest request, String deviceId) {
        List<SyncConflict> conflicts = new ArrayList<>();
        List<UUID> accepted = new ArrayList<>();

        for (SyncRecord record : request.getChanges()) {
            Optional<SyncLog> existing = syncLogRepository.findTopByEntityIdOrderByServerTimestampDesc(record.getEntityId());

            if (existing.isPresent() &&
                existing.get().getServerTimestamp().isAfter(record.getClientTimestamp())) {
                // Conflict: server has newer data
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
        // Here you would apply the change to the actual entity, e.g., save/update patient, encounter, etc.
    }

    public List<SyncLog> getChangesSince(LocalDateTime since, String deviceId) {
        // Simplified: return all logs after since
        return syncLogRepository.findAll().stream()
                .filter(log -> log.getServerTimestamp().isAfter(since))
                .toList();
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

        // getters and setters
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