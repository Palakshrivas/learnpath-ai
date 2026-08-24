package learnpath_backend.service;

import learnpath_backend.entity.Learner;
import learnpath_backend.repositary.LearnerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LearnerService {

    private final LearnerRepository learnerRepository;

    public LearnerService(LearnerRepository learnerRepository) {
        this.learnerRepository = learnerRepository;
    }

    public Learner createLearner(Learner learner) {
        return learnerRepository.save(learner);
    }

    public List<Learner> getAllLearners() {
        return learnerRepository.findAll();
    }

    public Learner getLearnerById(Long id) {
        return learnerRepository.findById(id).orElse(null);
    }
}