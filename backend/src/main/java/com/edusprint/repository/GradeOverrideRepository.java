package com.edusprint.repository;

import com.edusprint.entity.GradeOverride;
import com.edusprint.entity.Grade;
import com.edusprint.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for GradeOverride entity operations
 */
@Repository
public interface GradeOverrideRepository extends JpaRepository<GradeOverride, UUID> {

    /**
     * Find all overrides for a grade
     */
    List<GradeOverride> findByGrade(Grade grade);

    /**
     * Find all overrides by grade ID
     */
    List<GradeOverride> findByGradeId(UUID gradeId);

    /**
     * Find all overrides by a faculty member
     */
    List<GradeOverride> findByFaculty(User faculty);

    /**
     * Find all overrides by faculty ID
     */
    List<GradeOverride> findByFacultyId(UUID facultyId);

    /**
     * Find all overrides ordered by creation date
     */
    List<GradeOverride> findAllByOrderByCreatedAtDesc();
}
