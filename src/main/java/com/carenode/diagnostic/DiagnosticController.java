package com.carenode.diagnostic;

import com.carenode.ai.AIBridgeService;
import com.carenode.common.CloudinaryService;
import com.carenode.entity.Diagnostic;
import com.carenode.entity.Encounter;
import com.carenode.repository.DiagnosticRepository;
import com.carenode.repository.EncounterRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/diagnostics")
public class DiagnosticController {

    private final DiagnosticRepository diagnosticRepository;
    private final EncounterRepository encounterRepository;
    private final AIBridgeService aiBridgeService;
    private final CloudinaryService cloudinaryService;

    public DiagnosticController(DiagnosticRepository diagnosticRepository,
                                EncounterRepository encounterRepository,
                                AIBridgeService aiBridgeService,
                                CloudinaryService cloudinaryService) {
        this.diagnosticRepository = diagnosticRepository;
        this.encounterRepository = encounterRepository;
        this.aiBridgeService = aiBridgeService;
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping
    public ResponseEntity<?> createDiagnostic(@RequestParam("image") MultipartFile image,
                                              @RequestParam("encounterId") UUID encounterId,
                                              @RequestParam("modelType") String modelType) {
        Optional<Encounter> encounterOpt = encounterRepository.findById(encounterId);
        if (encounterOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        try {
            String imageKey = cloudinaryService.uploadImage(image, "carenode/diagnostics");
            AIBridgeService.DiagnosticResponse aiResult = aiBridgeService.diagnoseImage(image, modelType).block();
            Diagnostic diagnostic = new Diagnostic();
            diagnostic.setEncounter(encounterOpt.get());
            diagnostic.setImageCloudinaryKey(imageKey);
            diagnostic.setModelName(modelType);
            if (aiResult != null) {
                diagnostic.setPrediction(aiResult.getPrediction());
                diagnostic.setConfidenceScore(java.math.BigDecimal.valueOf(aiResult.getConfidence()));
                diagnostic.setRawOutput("{\"requiresReferral\":" + aiResult.isRequiresReferral() + "}");
            }
            diagnostic.setCreatedAt(java.time.LocalDateTime.now());
            diagnosticRepository.save(diagnostic);
            return ResponseEntity.ok(diagnostic);
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(ex.getMessage());
        }
    }
}