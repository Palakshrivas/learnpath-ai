package learnpath_backend.repositary;

import learnpath_backend.entity.LearningProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LearningProgressRepository
        extends JpaRepository<LearningProgress, Long> {

    List<LearningProgress> findByLearnerId(Long learnerId);

    Optional<LearningProgress> findByLearnerIdAndTopic(
            Long learnerId,
            String topic
    );
}