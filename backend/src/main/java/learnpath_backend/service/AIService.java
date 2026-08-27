package learnpath_backend.service;

import org.springframework.stereotype.Service;

@Service
public class AIService {

    public String getResponse(String message) {

    if (message == null || message.trim().isEmpty()) {
        return "Please ask me something about your learning journey.";
    }

    String question = message.toLowerCase();

    if (question.contains("java")) {
        return "Java roadmap: Fundamentals → OOP → Collections → Exception Handling → Multithreading → Spring Boot.";
    }

    if (question.contains("spring")) {
        return "Spring Boot roadmap: Core Spring → REST APIs → Spring Data JPA → Spring Security → JWT → Database Integration.";
    }

    if (question.contains("react")) {
        return "React roadmap: Components → Props → State → Hooks → API Integration → React Router → Projects.";
    }

    if (question.contains("python")) {
        return "Python roadmap: Syntax → Functions → OOP → Collections → File Handling → APIs → Projects.";
    }

    if (question.contains("sql") || question.contains("database")) {
        return "SQL roadmap: SELECT → WHERE → JOINs → GROUP BY → Subqueries → Indexes → Database Design.";
    }

    if (question.contains("javascript") || question.contains("js")) {
        return "JavaScript roadmap: Variables → Functions → Arrays → Objects → DOM → Async JavaScript → APIs → Modern JavaScript.";
    }

    if (question.contains("html") || question.contains("css")) {
        return "Frontend foundation: HTML → CSS → Responsive Design → Flexbox → Grid → Accessibility → Modern UI.";
    }

    if (question.contains("roadmap") || question.contains("path")) {
        return "Tell me the technology or career you want to learn, and I can suggest a structured roadmap for it.";
    }

    return "I can help you with programming, web development, databases, backend, frontend, APIs and career learning paths. Ask me what you want to learn.";
}
}