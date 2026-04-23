package com.carenode.patient;

import com.carenode.entity.Patient;
import com.carenode.repository.PatientRepository;
import com.carenode.repository.EncounterRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientRepository patientRepository;
    private final EncounterRepository encounterRepository;

    public PatientController(PatientRepository patientRepository, EncounterRepository encounterRepository) {
        this.patientRepository = patientRepository;
        this.encounterRepository = encounterRepository;
    }

    @GetMapping
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Patient> getPatient(@PathVariable UUID id) {
        return patientRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Patient createPatient(@RequestBody Patient patient) {
        return patientRepository.save(patient);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Patient> updatePatient(@PathVariable UUID id, @RequestBody Patient patient) {
        if (!patientRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        patient.setId(id);
        return ResponseEntity.ok(patientRepository.save(patient));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable UUID id) {
        if (!patientRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        patientRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{patientId}/encounters")
    public List<com.carenode.entity.Encounter> getEncountersByPatient(@PathVariable UUID patientId) {
        return encounterRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }
}