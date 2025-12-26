package com.edusprint.repository;

import com.edusprint.entity.TaskAssignment;
import com.edusprint.entity.Task;
import com.edusprint.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for TaskAssignment entity operations
 */
@Repository
public interface TaskAssignmentRepository extends JpaRepository<TaskAssignment, UUID> {

    /**
     * Find assignment by task and student
     */
    Optional<TaskAssignment> findByTaskAndStudent(Task task, User student);

    /**
     * Find assignment by task ID and student ID
     */
    Optional<TaskAssignment> findByTaskIdAndStudentId(UUID taskId, UUID studentId);

    /**
     * Find all assignments for a task
     */
    List<TaskAssignment> findByTask(Task task);

    /**
     * Find all assignments by task ID
     */
    List<TaskAssignment> findByTaskId(UUID taskId);

    /**
     * Find all assignments for a student
     */
    List<TaskAssignment> findByStudent(User student);

    /**
     * Find all assignments by student ID
     */
    List<TaskAssignment> findByStudentId(UUID studentId);

    /**
     * Find submitted assignments
     */
    List<TaskAssignment> findBySubmittedAtIsNotNull();

    /**
     * Find pending assignments (not yet submitted)
     */
    List<TaskAssignment> findBySubmittedAtIsNull();

    /**
     * Find submitted assignments for a student
     */
    List<TaskAssignment> findByStudentIdAndSubmittedAtIsNotNull(UUID studentId);

    /**
     * Find pending assignments for a student
     */
    List<TaskAssignment> findByStudentIdAndSubmittedAtIsNull(UUID studentId);

    /**
     * Find late submissions
     */
    @Query("SELECT ta FROM TaskAssignment ta JOIN ta.task t WHERE ta.submittedAt > t.dueDate")
    List<TaskAssignment> findLateSubmissions();

    /**
     * Check if student has assignment for task
     */
    boolean existsByTaskIdAndStudentId(UUID taskId, UUID studentId);
}
