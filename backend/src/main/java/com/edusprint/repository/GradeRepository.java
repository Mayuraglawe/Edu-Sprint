package com.edusprint.repository;

import com.edusprint.entity.Grade;
import com.edusprint.entity.Task;
import com.edusprint.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Grade entity operations
 */
@Repository
public interface GradeRepository extends JpaRepository<Grade, UUID> {

    /**
     * Find grade by task and student
     */
    Optional<Grade> findByTaskAndStudent(Task task, User student);

    /**
     * Find grade by task ID and student ID
     */
    Optional<Grade> findByTaskIdAndStudentId(UUID taskId, UUID studentId);

    /**
     * Find all grades for a task
     */
    List<Grade> findByTask(Task task);

    /**
     * Find all grades by task ID
     */
    List<Grade> findByTaskId(UUID taskId);

    /**
     * Find all grades for a student
     */
    List<Grade> findByStudent(User student);

    /**
     * Find all grades by student ID
     */
    List<Grade> findByStudentId(UUID studentId);

    /**
     * Find grades by status
     */
    List<Grade> findByStatus(String status);

    /**
     * Find grades by strictness
     */
    List<Grade> findByStrictness(String strictness);

    /**
     * Find pending grades
     */
    List<Grade> findByStatusOrderByCreatedAtAsc(String status);

    /**
     * Find grades that need faculty review
     */
    @Query("SELECT g FROM Grade g WHERE g.status = 'PENDING' OR g.status = 'REVIEWED'")
    List<Grade> findGradesNeedingReview();

    /**
     * Find grades by faculty who graded them
     */
    List<Grade> findByGradedBy(User faculty);

    /**
     * Check if grade exists for task and student
     */
    boolean existsByTaskIdAndStudentId(UUID taskId, UUID studentId);

    /**
     * Find all grades for a subject (through task relationship)
     */
    @Query("SELECT g FROM Grade g JOIN g.task t WHERE t.subject.id = :subjectId")
    List<Grade> findBySubjectId(UUID subjectId);
}
