package com.edusprint.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Grade record DTO matching shared/api.ts GradeRecord
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradeDTO {

    private UUID id;
    private UUID taskId;
    private UUID studentId;
    private BigDecimal autoScore;
    private BigDecimal finalScore;
    private String feedback;
    private String strictness; // "loose", "medium", "hard"
    private String status; // "pending", "reviewed", "approved"
    private LocalDateTime createdAt;
}
