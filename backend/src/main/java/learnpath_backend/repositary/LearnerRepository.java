package learnpath_backend.repositary;

import learnpath_backend.entity.Learner;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LearnerRepository
        extends JpaRepository<Learner, Long> {

    Optional<Learner> findByEmail(String email);

    boolean existsByEmail(String email);
}