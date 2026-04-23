package com.carenode.repository;

import com.carenode.entity.Encounter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface EncounterRepository extends JpaRepository<Encounter, UUID> {
    List<Encounter> findByPatientIdOrderByCreatedAtDesc(UUID patientId);

    @Query("SELECT e FROM Encounter e ORDER BY CASE e.triageScore WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END")
    List<Encounter> findAllOrderedBySeverity();
}