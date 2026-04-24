package com.carenode.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "patients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(unique = true)
    private String localId;

    @Column(columnDefinition = "jsonb")
    private String fhirResource;

    @PrePersist
    private void onCreate() {
        createdAt = LocalDateTime.now();
    }

    private LocalDateTime createdAt;

    private LocalDateTime syncedAt;

    @ManyToOne
    @JoinColumn(name = "worker_id")
    private Worker worker;
}