package com.tavsuye.backend.controller;

import com.tavsuye.backend.dto.LoginRequest;
import com.tavsuye.backend.dto.UserRegistrationRequest;
import com.tavsuye.backend.dto.VerificationRequest;
import com.tavsuye.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * User Registration Endpoint
     */
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@Valid @RequestBody UserRegistrationRequest request) {
        String response = authService.registerUser(request);
        return ResponseEntity.ok(response);
    }

    /**
     * User Login Endpoint
     */
    @PostMapping("/login")
    public ResponseEntity<String> loginUser(@Valid @RequestBody LoginRequest request) {
        String response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Email Verification Endpoint
     */
    @PostMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestBody VerificationRequest request) {
        boolean isVerified = authService.verifyEmail(request.getEmail(), request.getVerificationCode());
        if (isVerified) {
            return ResponseEntity.ok("Email successfully verified.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid verification code.");
        }
    }
}
