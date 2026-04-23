package com.carenode.repository;

import com.carenode.entity.Diagnostic;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface DiagnosticRepository extends JpaRepository<Diagnostic, UUID> {
}