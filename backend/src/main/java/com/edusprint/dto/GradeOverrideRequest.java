package com.edusprint.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Grade override request DTO matching shared/api.ts GradeOverrideRequest
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradeOverrideRequest {

    @NotNull(message = "Task ID is required")
    private UUID taskId;

    @NotNull(message = "Student ID is required")
    private UUID studentId;

    @NotNull(message = "Final score is required")
    private BigDecimal finalScore;

    @NotNull(message = "Reason is required")
    private String reason;
}
