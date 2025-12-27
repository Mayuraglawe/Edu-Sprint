package com.edusprint.controller;

import com.edusprint.dto.TaskDTO;
import com.edusprint.service.TaskService;
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
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<List<TaskDTO>> getAllTasks() {
        try {
            List<TaskDTO> tasks = taskService.getAllTasks();
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            log.error("Error getting all tasks", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<TaskDTO>> getTasksBySubject(@PathVariable Long subjectId) {
        try {
            List<TaskDTO> tasks = taskService.getTasksBySubject(subjectId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            log.error("Error getting tasks for subject: {}", subjectId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<TaskDTO>> getTasksByStudent(@PathVariable Long studentId) {
        try {
            List<TaskDTO> tasks = taskService.getTasksByStudent(studentId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            log.error("Error getting tasks for student: {}", studentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> getTaskById(@PathVariable Long id) {
        try {
            return taskService.getTaskById(id)
                    .map(task -> ResponseEntity.ok(task))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error getting task: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createTask(@Valid @RequestBody TaskDTO taskDTO) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long facultyId = Long.valueOf(auth.getName());

            TaskDTO task = taskService.createTask(taskDTO, facultyId);
            return ResponseEntity.status(HttpStatus.CREATED).body(task);
        } catch (RuntimeException e) {
            log.error("Error creating task", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error creating task", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(@PathVariable Long id, 
                                       @Valid @RequestBody TaskDTO taskDTO) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long facultyId = Long.valueOf(auth.getName());

            TaskDTO task = taskService.updateTask(id, taskDTO, facultyId);
            return ResponseEntity.ok(task);
        } catch (RuntimeException e) {
            log.error("Error updating task: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error updating task: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long facultyId = Long.valueOf(auth.getName());

            taskService.deleteTask(id, facultyId);
            return ResponseEntity.ok(Map.of("message", "Task deleted successfully"));
        } catch (RuntimeException e) {
            log.error("Error deleting task: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error deleting task: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<?> assignTask(@PathVariable Long id, 
                                       @RequestBody Map<String, Long> request) {
        try {
            Long studentId = request.get("studentId");
            if (studentId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Student ID is required"));
            }

            taskService.assignTaskToStudent(id, studentId);
            return ResponseEntity.ok(Map.of("message", "Task assigned successfully"));
        } catch (RuntimeException e) {
            log.error("Error assigning task: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error assigning task: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submitTask(@PathVariable Long id, 
                                       @RequestBody Map<String, String> request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long studentId = Long.valueOf(auth.getName());

            String submissionText = request.get("submissionText");
            if (submissionText == null || submissionText.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Submission text is required"));
            }

            taskService.submitTask(id, studentId, submissionText);
            return ResponseEntity.ok(Map.of("message", "Task submitted successfully"));
        } catch (RuntimeException e) {
            log.error("Error submitting task: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error submitting task: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}