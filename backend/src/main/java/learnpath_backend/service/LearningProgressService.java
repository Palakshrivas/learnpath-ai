package learnpath_backend.service;

import learnpath_backend.entity.LearningProgress;
import learnpath_backend.repositary.LearningProgressRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LearningProgressService {

    private final LearningProgressRepository progressRepository;

    public LearningProgressService(
            LearningProgressRepository progressRepository) {
        this.progressRepository = progressRepository;
    }

    public List<LearningProgress> getProgress(Long learnerId) {
        return progressRepository.findByLearnerId(learnerId);
    }

    public LearningProgress updateProgress(
            Long learnerId,
            String topic,
            boolean completed) {

        LearningProgress progress = new LearningProgress(
                learnerId,
                topic,
                completed
        );

        return progressRepository.save(progress);
    }
}