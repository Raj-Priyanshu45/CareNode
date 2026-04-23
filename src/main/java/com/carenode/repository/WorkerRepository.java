package com.carenode.repository;

import com.carenode.entity.Worker;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface WorkerRepository extends JpaRepository<Worker, UUID> {
    Optional<Worker> findByUsername(String username);
}