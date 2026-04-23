package com.carenode.encounter;

import com.carenode.ai.AIBridgeService;
import com.carenode.common.CloudinaryService;
import com.carenode.entity.Encounter;
import com.carenode.repository.EncounterRepository;
import com.carenode.repository.PatientRepository;
import com.carenode.triage.TriageEngine;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/encounters")
public class EncounterController {

    private final EncounterRepository encounterRepository;
    private final PatientRepository patientRepository;
    private final AIBridgeService aiBridgeService;
    private final CloudinaryService cloudinaryService;
    private final TriageEngine triageEngine;

    public EncounterController(EncounterRepository encounterRepository,
                               PatientRepository patientRepository,
                               AIBridgeService aiBridgeService,
                               CloudinaryService cloudinaryService,
                               TriageEngine triageEngine) {
        this.encounterRepository = encounterRepository;
        this.patientRepository = patientRepository;
        this.aiBridgeService = aiBridgeService;
        this.cloudinaryService = cloudinaryService;
        this.triageEngine = triageEngine;
    }

    @GetMapping
    public List<Encounter> getAllEncounters() {
        return encounterRepository.findAll();
    }

    @PostMapping
    public Encounter createEncounter(@RequestBody Encounter encounter) {
        if (encounter.getPatient() != null && encounter.getPatient().getId() != null) {
            patientRepository.findById(encounter.getPatient().getId())
                    .ifPresent(encounter::setPatient);
        }

        TriageEngine.EncounterData data = new TriageEngine.EncounterData();
        data.setSpO2(encounter.getSpo2());
        data.setHeartRate(encounter.getHeartRate());
        data.setSystolic(encounter.getSystolic());
        data.setAge(encounter.getAge());
        data.setPregnant(encounter.getPregnant() != null && encounter.getPregnant());

        TriageEngine.TriageResult result = triageEngine.score(data);
        encounter.setTriageScore(result.getSeverity());
        encounter.setTriageRationale(result.getRationale());
        return encounterRepository.save(encounter);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Encounter> getEncounterById(@PathVariable UUID id) {
        return encounterRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/transcribe")
    public ResponseEntity<?> transcribeAudio(@PathVariable UUID id,
                                             @RequestParam("audio") MultipartFile audioFile) {
        Encounter encounter = encounterRepository.findById(id).orElse(null);
        if (encounter == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            String audioKey = cloudinaryService.uploadAudio(audioFile, "carenode/audio");
            AIBridgeService.SoapResponse response = aiBridgeService.transcribeToSoap(audioFile).block();
            if (response != null) {
                encounter.setAudioR2Key(audioKey);
                encounter.setVoiceTranscript(response.getTranscript());
                encounter.setSoapNote(response.getSoap() != null ? response.getSoap().toString() : null);
                encounterRepository.save(encounter);
            }
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(ex.getMessage());
        }
    }
}