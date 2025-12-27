package com.edusprint.repository;

import com.edusprint.entity.Subject;
import com.edusprint.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Subject entity operations
 */
@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {

    /**
     * Find subject by code
     */
    Optional<Subject> findByCode(String code);

    /**
     * Check if code exists
     */
    boolean existsByCode(String code);

    /**
     * Find all subjects by faculty
     */
    List<Subject> findByFaculty(User faculty);

    /**
     * Find all subjects by faculty ID
     */
    List<Subject> findByFacultyId(Long facultyId);

    /**
     * Search subjects by name containing
     */
    List<Subject> findByNameContainingIgnoreCase(String name);

    /**
     * Search subjects by code containing
     */
    List<Subject> findByCodeContainingIgnoreCase(String code);

    /**
     * Check if subject exists by ID and faculty ID
     */
    boolean existsByIdAndFacultyId(Long id, Long facultyId);
}
