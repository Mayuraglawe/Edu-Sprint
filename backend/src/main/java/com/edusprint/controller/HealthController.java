package com.edusprint.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Demo/Health Check Controller
 */
@RestController
@RequestMapping("/api")
@Tag(name = "Health", description = "Health check endpoints")
public class HealthController {

    @GetMapping("/ping")
    @Operation(summary = "Ping endpoint", description = "Health check endpoint")
    public ResponseEntity<Map<String, String>> ping() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "pong");
        response.put("status", "healthy");
        response.put("service", "EduSprint Backend");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/demo")
    @Operation(summary = "Demo endpoint", description = "Demo API endpoint")
    public ResponseEntity<Map<String, String>> demo() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Demo endpoint working");
        response.put("platform", "EduSprint - AI-Powered Academic Workload Management");
        return ResponseEntity.ok(response);
    }
}
