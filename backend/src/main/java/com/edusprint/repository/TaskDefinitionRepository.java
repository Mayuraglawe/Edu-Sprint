package com.edusprint.repository;

import com.edusprint.entity.TaskDefinition;
import com.edusprint.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for TaskDefinition entity operations
 */
@Repository
public interface TaskDefinitionRepository extends JpaRepository<TaskDefinition, Long> {

    /**
     * Find all definitions for a task, ordered by index
     */
    List<TaskDefinition> findByTaskOrderByOrderIndexAsc(Task task);

    /**
     * Find all definitions by task ID, ordered by index
     */
    List<TaskDefinition> findByTaskIdOrderByOrderIndexAsc(Long taskId);

    /**
     * Find definition by task ID
     */
    Optional<TaskDefinition> findByTaskId(Long taskId);

    /**
     * Delete all definitions for a task
     */
    void deleteByTask(Task task);

    /**
     * Delete all definitions by task ID
     */
    void deleteByTaskId(Long taskId);

    /**
     * Count definitions by task
     */
    long countByTask(Task task);
}
