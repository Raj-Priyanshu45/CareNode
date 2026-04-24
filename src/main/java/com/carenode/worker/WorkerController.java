package com.carenode.worker;

import com.carenode.entity.Worker;
import com.carenode.repository.WorkerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workers")
public class WorkerController {

    private final WorkerRepository workerRepository;

    public WorkerController(WorkerRepository workerRepository) {
        this.workerRepository = workerRepository;
    }

    /**
     * Get all workers. Useful for assigning patients to workers and for admin dashboards.
     * In production you would restrict this to ADMIN role only.
     */
    @GetMapping
    public List<Worker> getAllWorkers() {
        List<Worker> workers = workerRepository.findAll();
        // Never return password hashes over the API
        workers.forEach(w -> w.setPasswordHash(null));
        return workers;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Worker> getWorker(@PathVariable UUID id) {
        return workerRepository.findById(id)
                .map(w -> {
                    w.setPasswordHash(null);
                    return ResponseEntity.ok(w);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/me")
    public ResponseEntity<Worker> getCurrentWorker(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        return workerRepository.findByUsername(userDetails.getUsername())
                .map(w -> {
                    w.setPasswordHash(null);
                    return ResponseEntity.ok(w);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Worker> updateWorker(@PathVariable UUID id, @RequestBody Worker updates) {
        return workerRepository.findById(id)
                .map(existing -> {
                    if (updates.getName() != null) existing.setName(updates.getName());
                    if (updates.getRole() != null) existing.setRole(updates.getRole());
                    // Never allow username or password update through this endpoint
                    Worker saved = workerRepository.save(existing);
                    saved.setPasswordHash(null);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorker(@PathVariable UUID id) {
        if (!workerRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        workerRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}