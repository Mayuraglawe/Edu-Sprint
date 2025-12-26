package com.edusprint.service;

import com.edusprint.dto.auth.AuthResponse;
import com.edusprint.dto.auth.LoginRequest;
import com.edusprint.dto.auth.SignupRequest;
import com.edusprint.entity.User;
import com.edusprint.repository.UserRepository;
import com.edusprint.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Authentication Service
 * Handles user login, signup, and token management
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    /**
     * User login
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        try {
            // Authenticate user
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            // Find user
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Generate token
            String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());

            // Build response
            return AuthResponse.builder()
                    .success(true)
                    .user(AuthResponse.UserDTO.builder()
                            .id(user.getId())
                            .name(user.getName())
                            .email(user.getEmail())
                            .role(user.getRole().name())
                            .build())
                    .token(token)
                    .message("Login successful")
                    .build();

        } catch (Exception e) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Invalid email or password")
                    .build();
        }
    }

    /**
     * User signup
     */
    @Transactional
    public AuthResponse signup(SignupRequest request) {
        try {
            // Check if user already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                return AuthResponse.builder()
                        .success(false)
                        .message("Email already registered")
                        .build();
            }

            // Validate role
            User.UserRole role;
            try {
                role = User.UserRole.valueOf(request.getRole().toLowerCase());
            } catch (IllegalArgumentException e) {
                return AuthResponse.builder()
                        .success(false)
                        .message("Invalid role. Must be student, faculty, or admin")
                        .build();
            }

            // Create new user
            User user = User.builder()
                    .name(request.getName())
                    .email(request.getEmail())
                    .passwordHash(passwordEncoder.encode(request.getPassword()))
                    .role(role)
                    .institution(request.getInstitution())
                    .build();

            user = userRepository.save(user);

            // Generate token
            String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());

            // Build response
            return AuthResponse.builder()
                    .success(true)
                    .user(AuthResponse.UserDTO.builder()
                            .id(user.getId())
                            .name(user.getName())
                            .email(user.getEmail())
                            .role(user.getRole().name())
                            .build())
                    .token(token)
                    .message("Signup successful")
                    .build();

        } catch (Exception e) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Signup failed: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Verify token
     */
    public AuthResponse verifyToken(String token) {
        try {
            String email = jwtUtil.extractUsername(token);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return AuthResponse.builder()
                    .success(true)
                    .user(AuthResponse.UserDTO.builder()
                            .id(user.getId())
                            .name(user.getName())
                            .email(user.getEmail())
                            .role(user.getRole().name())
                            .build())
                    .message("Token valid")
                    .build();

        } catch (Exception e) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Invalid token")
                    .build();
        }
    }
}
