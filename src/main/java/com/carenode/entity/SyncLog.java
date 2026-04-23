package com.carenode.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sync_log")
public class SyncLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String deviceId;

    private String entityType;

    private java.util.UUID entityId;

    private String operation;

    @Column(columnDefinition = "jsonb")
    private String payload;

    private LocalDateTime clientTimestamp;

    private LocalDateTime serverTimestamp;

    private Boolean conflictResolved = false;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public java.util.UUID getEntityId() { return entityId; }
    public void setEntityId(java.util.UUID entityId) { this.entityId = entityId; }

    public String getOperation() { return operation; }
    public void setOperation(String operation) { this.operation = operation; }

    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }

    public LocalDateTime getClientTimestamp() { return clientTimestamp; }
    public void setClientTimestamp(LocalDateTime clientTimestamp) { this.clientTimestamp = clientTimestamp; }

    public LocalDateTime getServerTimestamp() { return serverTimestamp; }
    public void setServerTimestamp(LocalDateTime serverTimestamp) { this.serverTimestamp = serverTimestamp; }

    public Boolean getConflictResolved() { return conflictResolved; }
    public void setConflictResolved(Boolean conflictResolved) { this.conflictResolved = conflictResolved; }
}