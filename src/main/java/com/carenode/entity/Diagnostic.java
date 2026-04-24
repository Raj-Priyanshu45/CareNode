package com.carenode.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "diagnostics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Diagnostic {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "encounter_id")
    private Encounter encounter;

    @Column(name = "image_r2_key")
    private String imageCloudinaryKey;

    private String modelName;

    private String prediction;

    @Column(precision = 5, scale = 4)
    private BigDecimal confidenceScore;

    @Column(columnDefinition = "jsonb")
    private String rawOutput;

    private LocalDateTime createdAt;
}