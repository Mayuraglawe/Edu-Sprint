package com.edusprint.repository;

import com.edusprint.entity.TaskDefinition;
import com.edusprint.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for TaskDefinition entity operations
 */
@Repository
public interface TaskDefinitionRepository extends JpaRepository<TaskDefinition, UUID> {

    /**
     * Find all definitions for a task, ordered by index
     */
    List<TaskDefinition> findByTaskOrderByOrderIndexAsc(Task task);

    /**
     * Find all definitions by task ID, ordered by index
     */
    List<TaskDefinition> findByTaskIdOrderByOrderIndexAsc(UUID taskId);

    /**
     * Delete all definitions for a task
     */
    void deleteByTask(Task task);

    /**
     * Delete all definitions by task ID
     */
    void deleteByTaskId(UUID taskId);
}
