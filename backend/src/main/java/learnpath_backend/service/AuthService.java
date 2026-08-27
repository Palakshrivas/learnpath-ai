package learnpath_backend.service;

import learnpath_backend.entity.Learner;
import learnpath_backend.repositary.LearnerRepository;
import learnpath_backend.security.JwtService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import learnpath_backend.service.LearnerService;

@Service
public class AuthService {

    private final LearnerRepository learnerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final LearnerService learnerService;

    public AuthService(
            LearnerRepository learnerRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService ,
            LearnerService learnerService) {

        this.learnerRepository = learnerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.learnerService = learnerService;

    }

    public String login(
            String email,
            String password) {

        Learner learner =
                learnerRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invalid email or password"
                                )
                        );

        if (!passwordEncoder.matches(
                password,
                learner.getPassword())) {

            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        return jwtService.generateToken(
                learner.getId(),
                learner.getEmail(),
                learner.getRole()
        );
    }
    public void resetPassword(String email, String newPassword) {
    learnerService.resetPassword(email, newPassword);
}
}