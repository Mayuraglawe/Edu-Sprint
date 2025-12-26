package com.edusprint.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Create subject request DTO matching shared/api.ts CreateSubjectRequest
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSubjectRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Code is required")
    private String code;

    private String description;
}
