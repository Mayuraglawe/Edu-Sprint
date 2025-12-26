package com.edusprint.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Task response DTO matching shared/api.ts Task
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDTO {

    private UUID id;
    private String title;
    private String description;
    private UUID subjectId;
    private UUID studentId;
    private String status; // "not-started", "in-progress", "submitted", "graded"
    private LocalDateTime dueDate;
    private Integer weight;
    private Integer maxScore;
    private Integer currentScore;
    private Integer penalty;
    private List<String> definition; // Definition of Done checklist
    private LocalDateTime createdAt;
}
