package com.carenode.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "encounters")
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

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public String getSoapNote() { return soapNote; }
    public void setSoapNote(String soapNote) { this.soapNote = soapNote; }

    public String getVoiceTranscript() { return voiceTranscript; }
    public void setVoiceTranscript(String voiceTranscript) { this.voiceTranscript = voiceTranscript; }

    public String getAudioR2Key() { return audioR2Key; }
    public void setAudioR2Key(String audioR2Key) { this.audioR2Key = audioR2Key; }

    public Integer getSpo2() { return spo2; }
    public void setSpo2(Integer spo2) { this.spo2 = spo2; }

    public Integer getHeartRate() { return heartRate; }
    public void setHeartRate(Integer heartRate) { this.heartRate = heartRate; }

    public Integer getSystolic() { return systolic; }
    public void setSystolic(Integer systolic) { this.systolic = systolic; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public Boolean getPregnant() { return pregnant; }
    public void setPregnant(Boolean pregnant) { this.pregnant = pregnant; }

    public String getTriageScore() { return triageScore; }
    public void setTriageScore(String triageScore) { this.triageScore = triageScore; }

    public String getTriageRationale() { return triageRationale; }
    public void setTriageRationale(String triageRationale) { this.triageRationale = triageRationale; }

    public SyncStatus getSyncStatus() { return syncStatus; }
    public void setSyncStatus(SyncStatus syncStatus) { this.syncStatus = syncStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getSyncedAt() { return syncedAt; }
    public void setSyncedAt(LocalDateTime syncedAt) { this.syncedAt = syncedAt; }
}