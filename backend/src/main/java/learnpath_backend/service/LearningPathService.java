package learnpath_backend.service;

import learnpath_backend.entity.Learner;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class LearningPathService {

    private final SkillGapService skillGapService;

    public LearningPathService(SkillGapService skillGapService) {
        this.skillGapService = skillGapService;
    }

    public List<String> generatePath(Learner learner) {

        List<String> path = new ArrayList<>();

        // Analyze learner's missing skills
        List<String> skillGaps = skillGapService.analyzeSkillGaps(learner);

        // Add missing skills to learning path
        path.addAll(skillGaps);

        // Add project at the end
        path.add("Full Stack Project");

        return path;
    }
}
