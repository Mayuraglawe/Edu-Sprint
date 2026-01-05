package com.edusprint.service;

import com.edusprint.entity.Penalty;
import com.edusprint.repository.PenaltyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PenaltyService {
    private final PenaltyRepository penaltyRepository;

    public List<Penalty> getAllPenalties() {
        return penaltyRepository.findAll();
    }

    public Optional<Penalty> getPenaltyById(Long id) {
        return penaltyRepository.findById(id);
    }

    @Transactional
    public Penalty createPenalty(Penalty penalty) {
        penalty.setCreatedAt(LocalDateTime.now());
        penalty.setUpdatedAt(LocalDateTime.now());
        // Example: log user info (placeholder, replace with actual user context if available)
        log.info("User [system] is creating a penalty");
        Penalty saved = penaltyRepository.save(penalty);
        log.info("Created penalty: {}", saved.getId());
        return saved;
    }

    @Transactional
    public Penalty updatePenalty(Long id, Penalty penaltyDetails) {
        Penalty penalty = penaltyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Penalty not found"));
        penalty.setReason(penaltyDetails.getReason());
        penalty.setAmount(penaltyDetails.getAmount());
        penalty.setUpdatedAt(LocalDateTime.now());
        // Example: log user info (placeholder, replace with actual user context if available)
        log.info("User [system] is updating a penalty");
        Penalty updated = penaltyRepository.save(penalty);
        log.info("Updated penalty: {}", updated.getId());
        return updated;
    }

    @Transactional
    public void deletePenalty(Long id) {
        Penalty penalty = penaltyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Penalty not found"));
        penaltyRepository.delete(penalty);
        log.info("Deleted penalty: {}", id);
    }
}