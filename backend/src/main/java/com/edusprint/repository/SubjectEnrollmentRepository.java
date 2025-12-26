package com.edusprint.repository;

import com.edusprint.entity.SubjectEnrollment;
import com.edusprint.entity.Subject;
import com.edusprint.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for SubjectEnrollment entity operations
 */
@Repository
public interface SubjectEnrollmentRepository extends JpaRepository<SubjectEnrollment, UUID> {

    /**
     * Find enrollment by subject and student
     */
    Optional<SubjectEnrollment> findBySubjectAndStudent(Subject subject, User student);

    /**
     * Find enrollment by subject ID and student ID
     */
    Optional<SubjectEnrollment> findBySubjectIdAndStudentId(UUID subjectId, UUID studentId);

    /**
     * Find all enrollments for a subject
     */
    List<SubjectEnrollment> findBySubject(Subject subject);

    /**
     * Find all enrollments by subject ID
     */
    List<SubjectEnrollment> findBySubjectId(UUID subjectId);

    /**
     * Find all enrollments for a student
     */
    List<SubjectEnrollment> findByStudent(User student);

    /**
     * Find all enrollments by student ID
     */
    List<SubjectEnrollment> findByStudentId(UUID studentId);

    /**
     * Check if student is enrolled in subject
     */
    boolean existsBySubjectIdAndStudentId(UUID subjectId, UUID studentId);

    /**
     * Count enrollments for a subject
     */
    long countBySubjectId(UUID subjectId);

    /**
     * Find subjects enrolled by a student (get Subject entities)
     */
    @Query("SELECT se.subject FROM SubjectEnrollment se WHERE se.student.id = :studentId")
    List<Subject> findSubjectsByStudentId(UUID studentId);

    /**
     * Find students enrolled in a subject (get User entities)
     */
    @Query("SELECT se.student FROM SubjectEnrollment se WHERE se.subject.id = :subjectId")
    List<User> findStudentsBySubjectId(UUID subjectId);
}
