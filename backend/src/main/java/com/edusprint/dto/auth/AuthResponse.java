package com.edusprint.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Authentication response DTO matching shared/api.ts AuthResponse
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private boolean success;
    private UserDTO user;
    private String token;
    private String message;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDTO {
        private UUID id;
        private String name;
        private String email;
        private String role;
    }
}
