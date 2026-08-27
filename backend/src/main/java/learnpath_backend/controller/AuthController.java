package learnpath_backend.controller;

import learnpath_backend.dto.LoginRequest;
import learnpath_backend.entity.Learner;
import learnpath_backend.service.AuthService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        try {

            String token = authService.login(
                    request.getEmail(),
                    request.getPassword()
            );

            Map<String, Object> response =
                    new HashMap<>();

            response.put(
                    "message",
                    "Login successful"
            );

            response.put("token", token);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            Map<String, String> error =
                    new HashMap<>();

            error.put(
                    "message",
                    "Invalid email or password"
            );

            return ResponseEntity
                    .status(401)
                    .body(error);
        }
    }
    @PostMapping("/reset-password")
public ResponseEntity<?> resetPassword(
        @RequestBody Map<String, String> request) {

    try {
        authService.resetPassword(
                request.get("email"),
                request.get("newPassword")
        );

        return ResponseEntity.ok(
                Map.of("message", "Password reset successful")
        );

    } catch (RuntimeException e) {

        return ResponseEntity
                .badRequest()
                .body(Map.of("message", e.getMessage()));
    }
}

    
    
}