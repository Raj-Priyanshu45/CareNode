package com.carenode.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "encounters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Encounter {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @Column(columnDefinition = "TEXT")
    private String soapNote;

    @Column(columnDefinition = "TEXT")
    private String voiceTranscript;

    @Column(name = "audio_r2_key")
    private String audioR2Key;

    @Column(name = "spO2")
    private Integer spo2;
    private Integer heartRate;
    private Integer systolic;
    private Integer age;
    private Boolean pregnant;

    private String triageScore;

    @Column(columnDefinition = "jsonb")
    private String triageRationale;

    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    @Column(columnDefinition = "TEXT")
    private String treatmentPlan;

    @Column(columnDefinition = "TEXT")
    private String medicines;

    @Column(columnDefinition = "TEXT")
    private String safetyNotes;

    private Double confidence;

    private String triage;

    @Enumerated(EnumType.STRING)
    private SyncStatus syncStatus = SyncStatus.PENDING;

    @PrePersist
    private void onCreate() {
        createdAt = LocalDateTime.now();
    }

    private LocalDateTime createdAt;

    private LocalDateTime syncedAt;

    public enum SyncStatus {
        PENDING, SYNCED, CONFLICT
    }
}