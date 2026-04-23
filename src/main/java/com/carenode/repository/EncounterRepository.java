package com.carenode.repository;

import com.carenode.entity.Encounter;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface EncounterRepository extends JpaRepository<Encounter, UUID> {
    List<Encounter> findByPatientIdOrderByCreatedAtDesc(UUID patientId);
}