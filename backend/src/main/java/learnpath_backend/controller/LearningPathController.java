package learnpath_backend.controller;

import learnpath_backend.entity.Learner;
import learnpath_backend.service.LearnerService;
import learnpath_backend.service.LearningPathService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/learning-path")
@CrossOrigin
public class LearningPathController {

    private final LearnerService learnerService;
    private final LearningPathService learningPathService;

    public LearningPathController(
            LearnerService learnerService,
            LearningPathService learningPathService) {

        this.learnerService = learnerService;
        this.learningPathService = learningPathService;
    }

    @GetMapping("/generate/{id}")
    public List<String> generatePath(@PathVariable Long id) {

        Learner learner = learnerService.getLearnerById(id);

        if (learner == null) {
            return List.of("Learner not found");
        }

        return learningPathService.generatePath(learner);
    }
}