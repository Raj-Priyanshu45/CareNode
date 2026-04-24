package com.carenode.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "sync_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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
}