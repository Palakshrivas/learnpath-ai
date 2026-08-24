package learnpath_backend.controller;

import learnpath_backend.entity.Learner;
import learnpath_backend.service.LearnerService;
import learnpath_backend.service.RecommendationService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin
public class RecommendationController {

    private final LearnerService learnerService;
    private final RecommendationService recommendationService;

    public RecommendationController(
            LearnerService learnerService,
            RecommendationService recommendationService) {

        this.learnerService = learnerService;
        this.recommendationService = recommendationService;
    }

    @GetMapping("/{id}")
    public List<String> getRecommendations(@PathVariable Long id) {

        Learner learner = learnerService.getLearnerById(id);

        if (learner == null) {
            return List.of("Learner not found");
        }

        return recommendationService.getRecommendations(learner);
    }
}