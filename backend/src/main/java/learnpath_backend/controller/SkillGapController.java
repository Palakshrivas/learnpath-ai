package learnpath_backend.controller;

import learnpath_backend.entity.Learner;
import learnpath_backend.service.LearnerService;
import learnpath_backend.service.SkillGapService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skill-gap")
@CrossOrigin
public class SkillGapController {

    private final LearnerService learnerService;
    private final SkillGapService skillGapService;

    public SkillGapController(
            LearnerService learnerService,
            SkillGapService skillGapService) {

        this.learnerService = learnerService;
        this.skillGapService = skillGapService;
    }

    @GetMapping("/{id}")
    public List<String> getSkillGaps(@PathVariable Long id) {

        Learner learner = learnerService.getLearnerById(id);

        if (learner == null) {
            return List.of("Learner not found");
        }

        return skillGapService.analyzeSkillGaps(learner);
    }
}
