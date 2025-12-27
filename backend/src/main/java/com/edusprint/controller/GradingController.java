package com.edusprint.controller;

import com.edusprint.dto.GradeDTO;
import com.edusprint.dto.GradeOverrideRequest;
import com.edusprint.entity.GradeOverride;
import com.edusprint.service.GradingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/grading")
@RequiredArgsConstructor
public class GradingController {

    private final GradingService gradingService;

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<GradeDTO>> getGradesByStudent(@PathVariable Long studentId) {
        try {
            List<GradeDTO> grades = gradingService.getGradesByStudent(studentId);
            return ResponseEntity.ok(grades);
        } catch (Exception e) {
            log.error("Error getting grades for student: {}", studentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<GradeDTO>> getGradesBySubject(@PathVariable Long subjectId) {
        try {
            List<GradeDTO> grades = gradingService.getGradesBySubject(subjectId);
            return ResponseEntity.ok(grades);
        } catch (Exception e) {
            log.error("Error getting grades for subject: {}", subjectId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<GradeDTO>> getGradesByTask(@PathVariable Long taskId) {
        try {
            List<GradeDTO> grades = gradingService.getGradesByTask(taskId);
            return ResponseEntity.ok(grades);
        } catch (Exception e) {
            log.error("Error getting grades for task: {}", taskId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<GradeDTO> getGradeById(@PathVariable Long id) {
        try {
            return gradingService.getGradeById(id)
                    .map(grade -> ResponseEntity.ok(grade))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error getting grade: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/auto-grade")
    public ResponseEntity<?> autoGradeSubmission(@RequestBody Map<String, Long> request) {
        try {
            Long taskId = request.get("taskId");
            Long studentId = request.get("studentId");
            
            if (taskId == null || studentId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Task ID and Student ID are required"));
            }

            GradeDTO grade = gradingService.autoGradeSubmission(taskId, studentId);
            return ResponseEntity.status(HttpStatus.CREATED).body(grade);
        } catch (RuntimeException e) {
            log.error("Error auto-grading submission", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error auto-grading submission", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}/review")
    public ResponseEntity<?> facultyReviewGrade(@PathVariable Long id, 
                                               @RequestBody Map<String, Object> request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long facultyId = Long.valueOf(auth.getName());

            Double facultyScore = Double.valueOf(request.get("facultyScore").toString());
            String facultyFeedback = (String) request.get("facultyFeedback");

            if (facultyScore == null || facultyFeedback == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Faculty score and feedback are required"));
            }

            GradeDTO grade = gradingService.facultyReviewGrade(id, facultyScore, facultyFeedback, facultyId);
            return ResponseEntity.ok(grade);
        } catch (RuntimeException e) {
            log.error("Error reviewing grade: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error reviewing grade: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{id}/override")
    public ResponseEntity<?> overrideGrade(@PathVariable Long id, 
                                          @Valid @RequestBody GradeOverrideRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long facultyId = Long.valueOf(auth.getName());

            gradingService.overrideGrade(id, request, facultyId);
            return ResponseEntity.ok(Map.of("message", "Grade overridden successfully"));
        } catch (RuntimeException e) {
            log.error("Error overriding grade: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error overriding grade: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}/overrides")
    public ResponseEntity<List<GradeOverride>> getGradeOverrides(@PathVariable Long id) {
        try {
            List<GradeOverride> overrides = gradingService.getGradeOverrides(id);
            return ResponseEntity.ok(overrides);
        } catch (Exception e) {
            log.error("Error getting grade overrides for grade: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}