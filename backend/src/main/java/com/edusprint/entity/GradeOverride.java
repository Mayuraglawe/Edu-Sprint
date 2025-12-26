package com.edusprint.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * GradeOverride Entity - Faculty Override Audit Trail
 */
@Entity
@Table(name = "grade_overrides")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class GradeOverride {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grade_id", nullable = false)
    @ToString.Exclude
    private Grade grade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faculty_id", nullable = false)
    @ToString.Exclude
    private User faculty;

    @Column(name = "original_score", precision = 5, scale = 2)
    private BigDecimal originalScore;

    @Column(name = "override_score", precision = 5, scale = 2)
    private BigDecimal overrideScore;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
