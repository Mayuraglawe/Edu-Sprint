package com.edusprint.controller;

import com.edusprint.entity.Penalty;
import com.edusprint.service.PenaltyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/penalties")
@RequiredArgsConstructor
public class PenaltyController {
    private final PenaltyService penaltyService;

    @GetMapping
    public ResponseEntity<List<Penalty>> getAllPenalties() {
        return ResponseEntity.ok(penaltyService.getAllPenalties());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Penalty> getPenaltyById(@PathVariable Long id) {
        return penaltyService.getPenaltyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createPenalty(@RequestBody Penalty penalty) {
        try {
            Penalty created = penaltyService.createPenalty(penalty);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            log.error("Error creating penalty", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePenalty(@PathVariable Long id, @RequestBody Penalty penalty) {
        try {
            Penalty updated = penaltyService.updatePenalty(id, penalty);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("Error updating penalty: {}", id, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePenalty(@PathVariable Long id) {
        try {
            penaltyService.deletePenalty(id);
            return ResponseEntity.ok(Map.of("message", "Penalty deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting penalty: {}", id, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}