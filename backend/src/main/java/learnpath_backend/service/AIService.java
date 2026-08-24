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
            return "For Java, focus on Fundamentals → OOP → Collections → Exception Handling → Multithreading → Spring Boot.";
        }

        if (question.contains("spring")) {
            return "For Spring Boot, learn REST APIs, Spring Data JPA, Spring Security, JWT authentication and database integration.";
        }

        if (question.contains("react")) {
            return "For React, focus on Components, Props, State, Hooks, API integration and React Router.";
        }

        if (question.contains("sql") || question.contains("database")) {
            return "For SQL, learn SELECT, JOINs, GROUP BY, subqueries, indexes and database design.";
        }

        if (question.contains("roadmap") || question.contains("path")) {
            return "Your recommended path is Java Fundamentals → OOP → SQL & Database Management → Spring Boot → REST API Development → React.js → Full Stack Project.";
        }

        return "I can help you with Java, Spring Boot, React, SQL, REST APIs and your personalized learning path. Ask me a specific question!";
    }
}