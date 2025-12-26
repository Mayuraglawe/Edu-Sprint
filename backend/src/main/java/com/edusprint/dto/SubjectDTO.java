package com.edusprint.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Subject response DTO matching shared/api.ts Subject
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectDTO {

    private UUID id;
    private String name;
    private String code;
    private String description;
    private UUID faculty; // Faculty ID
    private Integer students; // Student count
    private LocalDateTime createdAt;
}
