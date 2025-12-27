package com.edusprint.service;

import com.edusprint.dto.CreateSubjectRequest;
import com.edusprint.dto.SubjectDTO;
import com.edusprint.entity.Subject;
import com.edusprint.entity.SubjectEnrollment;
import com.edusprint.entity.User;
import com.edusprint.repository.SubjectRepository;
import com.edusprint.repository.SubjectEnrollmentRepository;
import com.edusprint.repository.UserRepository;
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
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final SubjectEnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    public List<SubjectDTO> getAllSubjects() {
        return subjectRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SubjectDTO> getSubjectsByFaculty(Long facultyId) {
        return subjectRepository.findByFacultyId(facultyId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SubjectDTO> getSubjectsByStudent(Long studentId) {
        return enrollmentRepository.findByStudentId(studentId).stream()
                .map(enrollment -> convertToDTO(enrollment.getSubject()))
                .collect(Collectors.toList());
    }

    public Optional<SubjectDTO> getSubjectById(Long id) {
        return subjectRepository.findById(id)
                .map(this::convertToDTO);
    }

    @Transactional
    public SubjectDTO createSubject(CreateSubjectRequest request, Long facultyId) {
        User faculty = userRepository.findById(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        if (!"FACULTY".equals(faculty.getRole())) {
            throw new RuntimeException("Only faculty can create subjects");
        }

        Subject subject = Subject.builder()
                .name(request.getName())
                .description(request.getDescription())
                .facultyId(facultyId)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Subject savedSubject = subjectRepository.save(subject);
        log.info("Created new subject: {} by faculty: {}", savedSubject.getName(), facultyId);
        
        return convertToDTO(savedSubject);
    }

    @Transactional
    public SubjectDTO updateSubject(Long id, CreateSubjectRequest request, Long facultyId) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        if (!subject.getFacultyId().equals(facultyId)) {
            throw new RuntimeException("Only the subject faculty can update this subject");
        }

        subject.setName(request.getName());
        subject.setDescription(request.getDescription());
        subject.setUpdatedAt(LocalDateTime.now());

        Subject updatedSubject = subjectRepository.save(subject);
        log.info("Updated subject: {} by faculty: {}", updatedSubject.getName(), facultyId);
        
        return convertToDTO(updatedSubject);
    }

    @Transactional
    public void deleteSubject(Long id, Long facultyId) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        if (!subject.getFacultyId().equals(facultyId)) {
            throw new RuntimeException("Only the subject faculty can delete this subject");
        }

        subjectRepository.delete(subject);
        log.info("Deleted subject: {} by faculty: {}", subject.getName(), facultyId);
    }

    @Transactional
    public void enrollStudent(Long subjectId, Long studentId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (!"STUDENT".equals(student.getRole())) {
            throw new RuntimeException("Only students can be enrolled in subjects");
        }

        // Check if already enrolled
        if (enrollmentRepository.findBySubjectIdAndStudentId(subjectId, studentId).isPresent()) {
            throw new RuntimeException("Student already enrolled in this subject");
        }

        SubjectEnrollment enrollment = SubjectEnrollment.builder()
                .subjectId(subjectId)
                .studentId(studentId)
                .enrolledAt(LocalDateTime.now())
                .build();

        enrollmentRepository.save(enrollment);
        log.info("Enrolled student: {} in subject: {}", studentId, subjectId);
    }

    @Transactional
    public void unenrollStudent(Long subjectId, Long studentId) {
        SubjectEnrollment enrollment = enrollmentRepository
                .findBySubjectIdAndStudentId(subjectId, studentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        enrollmentRepository.delete(enrollment);
        log.info("Unenrolled student: {} from subject: {}", studentId, subjectId);
    }

    private SubjectDTO convertToDTO(Subject subject) {
        return SubjectDTO.builder()
                .id(subject.getId())
                .name(subject.getName())
                .description(subject.getDescription())
                .facultyId(subject.getFacultyId())
                .createdAt(subject.getCreatedAt())
                .updatedAt(subject.getUpdatedAt())
                .build();
    }
}