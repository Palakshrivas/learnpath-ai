package learnpath_backend.service;

import learnpath_backend.entity.Learner;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RecommendationService {

    public List<String> getRecommendations(Learner learner) {

        List<String> recommendations = new ArrayList<>();

        String skills = learner.getCurrentSkills() == null
                ? ""
                : learner.getCurrentSkills().toLowerCase();

        if (!skills.contains("spring boot")) {
            recommendations.add("Spring Boot REST API Course");
        }

        if (!skills.contains("react")) {
            recommendations.add("React.js Frontend Development");
        }

        if (!skills.contains("rest")) {
            recommendations.add("REST API Development");
        }

        if (!skills.contains("git")) {
            recommendations.add("Git & GitHub Version Control");
        }

        recommendations.add("Build a Java Full Stack Project");

        return recommendations;
    }
}