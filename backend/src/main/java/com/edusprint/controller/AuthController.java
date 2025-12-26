package com.edusprint.controller;

import com.edusprint.dto.auth.AuthResponse;
import com.edusprint.dto.auth.LoginRequest;
import com.edusprint.dto.auth.SignupRequest;
import com.edusprint.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller
 * Endpoints: /api/auth/*
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User authentication endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return JWT token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    @Operation(summary = "User signup", description = "Register new user and return JWT token")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        AuthResponse response = authService.signup(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "User logout", description = "Logout user (client-side token removal)")
    public ResponseEntity<AuthResponse> logout() {
        // In JWT, logout is typically handled client-side by removing the token
        return ResponseEntity.ok(AuthResponse.builder()
                .success(true)
                .message("Logout successful")
                .build());
    }

    @GetMapping("/verify")
    @Operation(summary = "Verify token", description = "Verify JWT token validity")
    public ResponseEntity<AuthResponse> verifyToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.ok(AuthResponse.builder()
                    .success(false)
                    .message("Invalid authorization header")
                    .build());
        }

        String token = authHeader.substring(7);
        AuthResponse response = authService.verifyToken(token);
        return ResponseEntity.ok(response);
    }
}
