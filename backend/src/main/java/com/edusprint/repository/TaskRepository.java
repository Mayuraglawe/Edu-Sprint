package com.edusprint.repository;

import com.edusprint.entity.Task;
import com.edusprint.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repository for Task entity operations
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

    /**
     * Find all tasks by subject
     */
    List<Task> findBySubject(Subject subject);

    /**
     * Find all tasks by subject ID
     */
    List<Task> findBySubjectId(UUID subjectId);

    /**
     * Find all tasks by status
     */
    List<Task> findByStatus(String status);

    /**
     * Find all tasks by subject and status
     */
    List<Task> findBySubjectIdAndStatus(UUID subjectId, String status);

    /**
     * Find tasks due before a certain date
     */
    List<Task> findByDueDateBefore(LocalDateTime dueDate);

    /**
     * Find tasks due between dates
     */
    List<Task> findByDueDateBetween(LocalDateTime start, LocalDateTime end);

    /**
     * Find overdue tasks
     */
    @Query("SELECT t FROM Task t WHERE t.dueDate < :now AND t.status != 'GRADED'")
    List<Task> findOverdueTasks(@Param("now") LocalDateTime now);

    /**
     * Search tasks by title containing
     */
    List<Task> findByTitleContainingIgnoreCase(String title);
}
