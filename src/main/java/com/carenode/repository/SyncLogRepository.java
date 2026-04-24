package com.carenode.repository;

import com.carenode.entity.SyncLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SyncLogRepository extends JpaRepository<SyncLog, Long> {

    Optional<SyncLog> findTopByEntityIdOrderByServerTimestampDesc(java.util.UUID entityId);

    /**
     * Bug fix: the original query returned ALL changes including the requesting
     * device's own pushes, causing the device to re-apply its own writes on pull.
     *
     * This version excludes changes that originated from the pulling device, so
     * a device only gets deltas written by *other* devices or by the server.
     */
    @Query("SELECT s FROM SyncLog s WHERE s.serverTimestamp > :since AND s.deviceId != :deviceId ORDER BY s.serverTimestamp ASC")
    List<SyncLog> findByServerTimestampAfterAndDeviceIdNot(
            @Param("since") LocalDateTime since,
            @Param("deviceId") String deviceId);

    /**
     * Kept for admin/audit use — returns the full change log regardless of device.
     */
    List<SyncLog> findByServerTimestampAfter(LocalDateTime since);
}