package com.carenode.repository;

import com.carenode.entity.SyncLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SyncLogRepository extends JpaRepository<SyncLog, Long> {
    Optional<SyncLog> findTopByEntityIdOrderByServerTimestampDesc(java.util.UUID entityId);
}