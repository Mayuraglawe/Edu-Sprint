package com.edusprint.repository;

import com.edusprint.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for User entity operations
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    /**
     * Find user by email
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if email exists
     */
    boolean existsByEmail(String email);

    /**
     * Find all users by role
     */
    List<User> findByRole(User.UserRole role);

    /**
     * Find users by institution
     */
    List<User> findByInstitution(String institution);

    /**
     * Find users by role and institution
     */
    List<User> findByRoleAndInstitution(User.UserRole role, String institution);
}
