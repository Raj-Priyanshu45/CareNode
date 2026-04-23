package com.carenode.sync;

import com.carenode.entity.SyncLog;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sync")
public class SyncController {

    private final SyncService syncService;

    public SyncController(SyncService syncService) {
        this.syncService = syncService;
    }

    @PostMapping("/push")
    public ResponseEntity<SyncService.SyncResponse> pushBatch(@RequestBody SyncService.SyncBatchRequest request,
                                                              @RequestHeader("Device-Id") String deviceId) {
        SyncService.SyncResponse response = syncService.processBatch(request, deviceId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pull")
    public ResponseEntity<?> pullChanges(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since,
                                         @RequestHeader("Device-Id") String deviceId) {
        List<SyncLog> changes = syncService.getChangesSince(since, deviceId);
        Map<String, Object> response = new HashMap<>();
        response.put("changes", changes);
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    // WebSocket endpoint would be added here for real-time status
}