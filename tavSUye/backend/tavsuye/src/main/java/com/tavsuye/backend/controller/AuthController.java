package com.tavsuye.backend.controller;

import com.tavsuye.backend.dto.LoginRequest;
import com.tavsuye.backend.dto.LoginResponse;
import com.tavsuye.backend.dto.UserRegistrationRequest;
import com.tavsuye.backend.dto.VerificationRequest;
import com.tavsuye.backend.entity.User;
import com.tavsuye.backend.service.AuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // User registration endpoint
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@Valid @RequestBody UserRegistrationRequest request) {
        String response = authService.registerUser(request);
        return ResponseEntity.ok(response);
    }

    // User login endpoint (Session-Based)
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginUser(@Valid @RequestBody LoginRequest request, HttpSession session) {
        Optional<User> userOptional = authService.login(request);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            // ❌ If the user is banned, deny login
            if (user.getAccountStatus() == User.AccountStatus.BANNED) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new LoginResponse("Your account has been banned. Contact support.", false, null));
            }

            // ❌ If email is not verified, deny login
            if (!user.getEmailVerified()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new LoginResponse("Email not verified. Please verify your email.", false, null));
            }

            // ❌ If the account is suspended, force verification before login
            if (user.getAccountStatus() == User.AccountStatus.SUSPENDED) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new LoginResponse("Account is suspended. Please verify your email to reactivate.", false, null));
            }

            // ❌ If 2FA is enabled, request verification first
            if (Boolean.TRUE.equals(user.getIs2faEnabled())) {
                return ResponseEntity.status(HttpStatus.ACCEPTED)
                        .body(new LoginResponse("2FA verification required. A code has been sent to your email.", true, user.getRole()));
            }

            // ✅ Store user information in the session
            session.setAttribute("userId", user.getUserId());
            session.setAttribute("username", user.getUsername());
            session.setAttribute("role", user.getRole());

            session.setMaxInactiveInterval(30 * 60); // 30 minutes

            return ResponseEntity.ok(new LoginResponse("Login successful.", false, user.getRole()));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new LoginResponse("Invalid credentials.", false, null));
    }

    // 2FA Verification Endpoint
    @PostMapping("/verify-2fa")
    public ResponseEntity<LoginResponse> verifyTwoFactorAuth(@RequestBody VerificationRequest request, HttpSession session) {
        boolean isVerified = authService.verify2FA(request.getEmail(), request.getVerificationCode());

        if (isVerified) {
            Optional<User> userOptional = authService.findByEmail(request.getEmail());

            if (userOptional.isPresent()) {
                User user = userOptional.get();

                // Store session information
                session.setAttribute("userId", user.getUserId());
                session.setAttribute("username", user.getUsername());
                session.setAttribute("role", user.getRole());

                session.setMaxInactiveInterval(30 * 60); // 30 minutes

                return ResponseEntity.ok(new LoginResponse("2FA verification successful. You are now logged in.", false, user.getRole()));
            }
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new LoginResponse("Invalid or expired 2FA verification code.", false, null));
    }

    // Logout endpoint (Destroy session)
    @PostMapping("/logout")
    public ResponseEntity<String> logoutUser(HttpSession session) {
        if (session.getAttribute("userId") != null) {
            session.invalidate(); // Invalidate the session
            return ResponseEntity.ok("Logged out successfully");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("You are not logged in.");
        }
    }

    // Email verification endpoint
    @PostMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestBody VerificationRequest request, HttpSession session) {
        boolean isVerified = authService.verifyEmail(request.getEmail(), request.getVerificationCode());

        if (isVerified) {
            // If the user is logged in, update session attributes
            if (session.getAttribute("userId") != null) {
                session.setAttribute("emailVerified", true);
            }
            return ResponseEntity.ok("Email successfully verified.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired verification code.");
        }
    }
}
