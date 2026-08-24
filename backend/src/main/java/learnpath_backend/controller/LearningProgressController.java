package learnpath_backend.controller;

import learnpath_backend.entity.LearningProgress;
import learnpath_backend.service.LearningProgressService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin
public class LearningProgressController {

    private final LearningProgressService progressService;

    public LearningProgressController(
            LearningProgressService progressService) {
        this.progressService = progressService;
    }

    @GetMapping("/{learnerId}")
    public List<LearningProgress> getProgress(
            @PathVariable Long learnerId) {

        return progressService.getProgress(learnerId);
    }

    @PostMapping("/{learnerId}")
    public LearningProgress updateProgress(
            @PathVariable Long learnerId,
            @RequestParam String topic,
            @RequestParam boolean completed) {

        return progressService.updateProgress(
                learnerId,
                topic,
                completed
        );
    }
}