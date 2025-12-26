package com.edusprint.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Penalty Entity - SLA Penalty Tracking for Late Submissions
 */
@Entity
@Table(name = "penalties")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Penalty {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    @ToString.Exclude
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @ToString.Exclude
    private User student;

    @Column(name = "penalty_percent", nullable = false)
    private Integer penaltyPercent;

    @Column(length = 255)
    private String reason;

    @CreatedDate
    @Column(name = "applied_at", nullable = false, updatable = false)
    private LocalDateTime appliedAt;
}
