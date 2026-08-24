package learnpath_backend.controller;

import learnpath_backend.service.AIService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/ask")
    public String askAI(@RequestBody AIRequest request) {
        return aiService.getResponse(request.message());
    }

    public record AIRequest(String message) {
    }
}
