package com.edusprint.repository;

import com.edusprint.entity.Penalty;
import com.edusprint.entity.Task;
import com.edusprint.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for Penalty entity operations
 */
@Repository
public interface PenaltyRepository extends JpaRepository<Penalty, UUID> {

    /**
     * Find all penalties for a task
     */
    List<Penalty> findByTask(Task task);

    /**
     * Find all penalties by task ID
     */
    List<Penalty> findByTaskId(UUID taskId);

    /**
     * Find all penalties for a student
     */
    List<Penalty> findByStudent(User student);

    /**
     * Find all penalties by student ID
     */
    List<Penalty> findByStudentId(UUID studentId);

    /**
     * Find penalties for a specific task and student
     */
    List<Penalty> findByTaskIdAndStudentId(UUID taskId, UUID studentId);

    /**
     * Find all penalties ordered by application date
     */
    List<Penalty> findAllByOrderByAppliedAtDesc();
}
