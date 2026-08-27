package learnpath_backend.service;

import learnpath_backend.entity.Learner;
import learnpath_backend.repositary.LearnerRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LearnerService {

    private final LearnerRepository learnerRepository;
    private final PasswordEncoder passwordEncoder;

    public LearnerService(
            LearnerRepository learnerRepository,
            PasswordEncoder passwordEncoder) {

        this.learnerRepository = learnerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Learner createLearner(Learner learner) {

        if (learnerRepository.existsByEmail(
                learner.getEmail())) {

            throw new RuntimeException(
                    "Email already registered"
            );
        }

        learner.setPassword(
                passwordEncoder.encode(
                        learner.getPassword()
                )
        );

        if (learner.getRole() == null ||
                learner.getRole().isBlank()) {

            learner.setRole("LEARNER");
        }

        return learnerRepository.save(learner);
    }

    public List<Learner> getAllLearners() {
        return learnerRepository.findAll();
    }

    public Learner getLearnerById(Long id) {
        return learnerRepository
                .findById(id)
                .orElse(null);
    }

    public void resetPassword(String email, String newPassword) {

    Learner learner = learnerRepository
            .findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("Email not found")
            );

    learner.setPassword(
            passwordEncoder.encode(newPassword)
    );

    learnerRepository.save(learner);
}
}