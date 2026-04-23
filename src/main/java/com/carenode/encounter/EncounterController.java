package com.carenode.encounter;

import com.carenode.ai.AIBridgeService;
import com.carenode.entity.Encounter;
import com.carenode.repository.EncounterRepository;
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
    private final AIBridgeService aiBridgeService;
    private final TriageEngine triageEngine;

    public EncounterController(EncounterRepository encounterRepository,
                               AIBridgeService aiBridgeService,
                               TriageEngine triageEngine) {
        this.encounterRepository = encounterRepository;
        this.aiBridgeService = aiBridgeService;
        this.triageEngine = triageEngine;
    }

    @GetMapping
    public List<Encounter> getAllEncounters() {
        return encounterRepository.findAll();
    }

    @PostMapping
    public Encounter createEncounter(@RequestBody Encounter encounter) {
        // Calculate triage score
        TriageEngine.EncounterData data = new TriageEngine.EncounterData();
        // Populate data from encounter or request
        TriageEngine.TriageResult result = triageEngine.score(data);
        encounter.setTriageScore(result.getSeverity());
        encounter.setTriageRationale(result.getRationale());
        return encounterRepository.save(encounter);
    }

    @PostMapping("/transcribe")
    public ResponseEntity<?> transcribeAudio(@RequestParam("audio") MultipartFile audioFile) {
        // Call AI service
        AIBridgeService.SoapResponse response = aiBridgeService.transcribeToSoap(audioFile).block();
        return ResponseEntity.ok(response);
    }
}