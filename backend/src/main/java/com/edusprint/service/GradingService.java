package com.edusprint.service;

import com.edusprint.dto.GradeDTO;
import com.edusprint.dto.GradeOverrideRequest;
import com.edusprint.entity.Grade;
import com.edusprint.entity.GradeOverride;
import com.edusprint.entity.TaskAssignment;
import com.edusprint.repository.GradeRepository;
import com.edusprint.repository.GradeOverrideRepository;
import com.edusprint.repository.TaskAssignmentRepository;
import com.edusprint.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GradingService {

    private final GradeRepository gradeRepository;
    private final GradeOverrideRepository gradeOverrideRepository;
    private final TaskAssignmentRepository taskAssignmentRepository;
    private final SubjectRepository subjectRepository;

    public List<GradeDTO> getGradesByStudent(Long studentId) {
        return gradeRepository.findByStudentId(studentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<GradeDTO> getGradesBySubject(Long subjectId) {
        return gradeRepository.findBySubjectId(subjectId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<GradeDTO> getGradesByTask(Long taskId) {
        return gradeRepository.findByTaskId(taskId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<GradeDTO> getGradeById(Long id) {
        return gradeRepository.findById(id)
                .map(this::convertToDTO);
    }

    @Transactional
    public GradeDTO autoGradeSubmission(Long taskId, Long studentId) {
        TaskAssignment assignment = taskAssignmentRepository
                .findByTaskIdAndStudentId(taskId, studentId)
                .orElseThrow(() -> new RuntimeException("Task assignment not found"));

        if (!"SUBMITTED".equals(assignment.getStatus())) {
            throw new RuntimeException("Task must be submitted before grading");
        }

        // Simple auto-grading logic (can be enhanced)
        Double autoScore = calculateAutoScore(assignment);
        String autoFeedback = generateAutoFeedback(assignment, autoScore);

        Grade grade = Grade.builder()
                .taskId(taskId)
                .studentId(studentId)
                .subjectId(assignment.getTask().getSubjectId())
                .autoScore(autoScore)
                .autoFeedback(autoFeedback)
                .status("AUTO_GRADED")
                .gradedAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Grade savedGrade = gradeRepository.save(grade);
        log.info("Auto-graded task: {} for student: {} with score: {}", 
                 taskId, studentId, autoScore);

        return convertToDTO(savedGrade);
    }

    @Transactional
    public GradeDTO facultyReviewGrade(Long gradeId, Double facultyScore, String facultyFeedback, Long facultyId) {
        Grade grade = gradeRepository.findById(gradeId)
                .orElseThrow(() -> new RuntimeException("Grade not found"));

        // Verify faculty permissions
        if (!subjectRepository.existsByIdAndFacultyId(grade.getSubjectId(), facultyId)) {
            throw new RuntimeException("Faculty can only review grades for their subjects");
        }

        grade.setFacultyScore(facultyScore);
        grade.setFacultyFeedback(facultyFeedback);
        grade.setStatus("FACULTY_REVIEWED");
        grade.setUpdatedAt(LocalDateTime.now());

        Grade updatedGrade = gradeRepository.save(grade);
        log.info("Faculty: {} reviewed grade: {} with score: {}", 
                 facultyId, gradeId, facultyScore);

        return convertToDTO(updatedGrade);
    }

    @Transactional
    public void overrideGrade(Long gradeId, GradeOverrideRequest request, Long facultyId) {
        Grade grade = gradeRepository.findById(gradeId)
                .orElseThrow(() -> new RuntimeException("Grade not found"));

        // Verify faculty permissions
        if (!subjectRepository.existsByIdAndFacultyId(grade.getSubjectId(), facultyId)) {
            throw new RuntimeException("Faculty can only override grades for their subjects");
        }

        // Store original scores for audit
        Double originalAutoScore = grade.getAutoScore();
        Double originalFacultyScore = grade.getFacultyScore();

        // Create override record
        GradeOverride override = GradeOverride.builder()
                .gradeId(gradeId)
                .facultyId(facultyId)
                .originalAutoScore(originalAutoScore)
                .originalFacultyScore(originalFacultyScore)
                .newScore(request.getNewScore())
                .reason(request.getReason())
                .overriddenAt(LocalDateTime.now())
                .build();

        gradeOverrideRepository.save(override);

        // Update the grade
        grade.setFacultyScore(request.getNewScore());
        grade.setFacultyFeedback(grade.getFacultyFeedback() + " [OVERRIDDEN: " + request.getReason() + "]");
        grade.setStatus("OVERRIDDEN");
        grade.setUpdatedAt(LocalDateTime.now());

        gradeRepository.save(grade);
        log.info("Faculty: {} overrode grade: {} to score: {} for reason: {}", 
                 facultyId, gradeId, request.getNewScore(), request.getReason());
    }

    public List<GradeOverride> getGradeOverrides(Long gradeId) {
        return gradeOverrideRepository.findByGradeIdOrderByOverriddenAtDesc(gradeId);
    }

    private Double calculateAutoScore(TaskAssignment assignment) {
        // Simple scoring based on submission completeness and timing
        if (assignment.getSubmissionText() == null || assignment.getSubmissionText().trim().isEmpty()) {
            return 0.0;
        }

        double baseScore = 70.0; // Base score for submission
        
        // Add points for submission length (rough indicator of effort)
        int textLength = assignment.getSubmissionText().length();
        if (textLength > 100) baseScore += 10.0;
        if (textLength > 500) baseScore += 10.0;
        if (textLength > 1000) baseScore += 10.0;

        // Deduct points for late submission (if we had due date logic)
        // This would require more sophisticated date comparison

        return Math.min(baseScore, 100.0);
    }

    private String generateAutoFeedback(TaskAssignment assignment, Double score) {
        if (score >= 90.0) {
            return "Excellent submission! Well detailed and comprehensive.";
        } else if (score >= 80.0) {
            return "Good submission! Consider adding more detail for better understanding.";
        } else if (score >= 70.0) {
            return "Adequate submission. Could benefit from more elaboration and examples.";
        } else if (score >= 60.0) {
            return "Basic submission. Please provide more comprehensive answers.";
        } else {
            return "Incomplete submission. Please review requirements and resubmit.";
        }
    }

    private GradeDTO convertToDTO(Grade grade) {
        return GradeDTO.builder()
                .id(grade.getId())
                .taskId(grade.getTaskId())
                .studentId(grade.getStudentId())
                .subjectId(grade.getSubjectId())
                .autoScore(grade.getAutoScore())
                .facultyScore(grade.getFacultyScore())
                .autoFeedback(grade.getAutoFeedback())
                .facultyFeedback(grade.getFacultyFeedback())
                .status(grade.getStatus())
                .gradedAt(grade.getGradedAt())
                .createdAt(grade.getCreatedAt())
                .updatedAt(grade.getUpdatedAt())
                .build();
    }
}