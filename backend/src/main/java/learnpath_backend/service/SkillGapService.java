package learnpath_backend.service;

import learnpath_backend.entity.Learner;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SkillGapService {

    public List<String> analyzeSkillGaps(Learner learner) {

        List<String> gaps = new ArrayList<>();

        String skills = learner.getCurrentSkills() == null
                ? ""
                : learner.getCurrentSkills().toLowerCase();

        String goal = learner.getCareerGoal() == null
                ? ""
                : learner.getCareerGoal().toLowerCase();

        if (goal.contains("java") && !skills.contains("java")) {
            gaps.add("Java");
        }

        if ((goal.contains("full stack") || goal.contains("backend"))
                && !skills.contains("spring boot")) {
            gaps.add("Spring Boot");
        }

        if ((goal.contains("full stack") || goal.contains("web"))
                && !skills.contains("react")) {
            gaps.add("React.js");
        }

        if (!skills.contains("sql")) {
            gaps.add("SQL & Database Management");
        }

        if (!skills.contains("rest")) {
            gaps.add("REST API Development");
        }

        if (!skills.contains("git")) {
            gaps.add("Git & GitHub");
        }

        return gaps;
    }
}