package learnpath_backend.controller;

import learnpath_backend.entity.Learner;
import learnpath_backend.service.LearnerService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/learners")
@CrossOrigin(origins = "http://localhost:5173")
public class LearnerController {

    private final LearnerService learnerService;

    public LearnerController(LearnerService learnerService) {
        this.learnerService = learnerService;
    }

    @PostMapping
    public Learner createLearner(@RequestBody Learner learner) {
        return learnerService.createLearner(learner);
    }

    @GetMapping
    public List<Learner> getAllLearners() {
        return learnerService.getAllLearners();
    }

    @GetMapping("/{id}")
    public Learner getLearnerById(@PathVariable Long id) {
        return learnerService.getLearnerById(id);
    }
}