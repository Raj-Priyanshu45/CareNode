package com.carenode.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "patients")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(unique = true)
    private String localId;

    @Column(columnDefinition = "jsonb")
    private String fhirResource;

    private LocalDateTime createdAt;

    private LocalDateTime syncedAt;

    @ManyToOne
    @JoinColumn(name = "worker_id")
    private Worker worker;

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getLocalId() { return localId; }
    public void setLocalId(String localId) { this.localId = localId; }

    public String getFhirResource() { return fhirResource; }
    public void setFhirResource(String fhirResource) { this.fhirResource = fhirResource; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getSyncedAt() { return syncedAt; }
    public void setSyncedAt(LocalDateTime syncedAt) { this.syncedAt = syncedAt; }

    public Worker getWorker() { return worker; }
    public void setWorker(Worker worker) { this.worker = worker; }
}