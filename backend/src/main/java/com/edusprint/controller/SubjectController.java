package com.edusprint.controller;

import com.edusprint.dto.CreateSubjectRequest;
import com.edusprint.dto.SubjectDTO;
import com.edusprint.service.SubjectService;
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
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService subjectService;

    @GetMapping
    public ResponseEntity<List<SubjectDTO>> getAllSubjects() {
        try {
            List<SubjectDTO> subjects = subjectService.getAllSubjects();
            return ResponseEntity.ok(subjects);
        } catch (Exception e) {
            log.error("Error getting all subjects", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/faculty/{facultyId}")
    public ResponseEntity<List<SubjectDTO>> getSubjectsByFaculty(@PathVariable Long facultyId) {
        try {
            List<SubjectDTO> subjects = subjectService.getSubjectsByFaculty(facultyId);
            return ResponseEntity.ok(subjects);
        } catch (Exception e) {
            log.error("Error getting subjects for faculty: {}", facultyId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<SubjectDTO>> getSubjectsByStudent(@PathVariable Long studentId) {
        try {
            List<SubjectDTO> subjects = subjectService.getSubjectsByStudent(studentId);
            return ResponseEntity.ok(subjects);
        } catch (Exception e) {
            log.error("Error getting subjects for student: {}", studentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubjectDTO> getSubjectById(@PathVariable Long id) {
        try {
            return subjectService.getSubjectById(id)
                    .map(subject -> ResponseEntity.ok(subject))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error getting subject: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createSubject(@Valid @RequestBody CreateSubjectRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long facultyId = Long.valueOf(auth.getName()); // Assuming username is the user ID

            SubjectDTO subject = subjectService.createSubject(request, facultyId);
            return ResponseEntity.status(HttpStatus.CREATED).body(subject);
        } catch (RuntimeException e) {
            log.error("Error creating subject", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error creating subject", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSubject(@PathVariable Long id, 
                                          @Valid @RequestBody CreateSubjectRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long facultyId = Long.valueOf(auth.getName());

            SubjectDTO subject = subjectService.updateSubject(id, request, facultyId);
            return ResponseEntity.ok(subject);
        } catch (RuntimeException e) {
            log.error("Error updating subject: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error updating subject: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSubject(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long facultyId = Long.valueOf(auth.getName());

            subjectService.deleteSubject(id, facultyId);
            return ResponseEntity.ok(Map.of("message", "Subject deleted successfully"));
        } catch (RuntimeException e) {
            log.error("Error deleting subject: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error deleting subject: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{id}/enroll")
    public ResponseEntity<?> enrollStudent(@PathVariable Long id, 
                                          @RequestBody Map<String, Long> request) {
        try {
            Long studentId = request.get("studentId");
            if (studentId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Student ID is required"));
            }

            subjectService.enrollStudent(id, studentId);
            return ResponseEntity.ok(Map.of("message", "Student enrolled successfully"));
        } catch (RuntimeException e) {
            log.error("Error enrolling student in subject: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error enrolling student in subject: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}/enroll")
    public ResponseEntity<?> unenrollStudent(@PathVariable Long id, 
                                            @RequestBody Map<String, Long> request) {
        try {
            Long studentId = request.get("studentId");
            if (studentId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Student ID is required"));
            }

            subjectService.unenrollStudent(id, studentId);
            return ResponseEntity.ok(Map.of("message", "Student unenrolled successfully"));
        } catch (RuntimeException e) {
            log.error("Error unenrolling student from subject: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error unenrolling student from subject: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}