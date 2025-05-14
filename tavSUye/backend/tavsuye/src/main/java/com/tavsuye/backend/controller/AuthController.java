package com.tavsuye.backend.controller;

import com.tavsuye.backend.dto.LoginRequest;
import com.tavsuye.backend.dto.LoginResponse;
import com.tavsuye.backend.dto.PasswordResetRequest;
import com.tavsuye.backend.dto.PasswordResetSubmitRequest;
import com.tavsuye.backend.dto.UserRegistrationRequest;
import com.tavsuye.backend.dto.VerificationRequest;
import com.tavsuye.backend.entity.User;
import com.tavsuye.backend.service.AuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // Endpoint for user registration
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@Valid @RequestBody UserRegistrationRequest request) {
        String response = authService.registerUser(request);

        if (response.equals("User registered successfully. Please verify your email.")) {
            // Başarılı kayıt, doğrulama gerektiriyor
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else if (response.equals("Only Sabancı University email addresses are allowed.")) {
            // Sabancı mail değilse
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        } else if (response.equals("Email is already registered.")) {
            // Email zaten kayıtlı
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        } else if (response.equals("Username is already taken.")) {
            // Username zaten alınmış
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        } else if (response.equals("User already exists. Please verify your email.")) {
            // Kullanıcı pending durumda
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        } else {
            // Diğer durumlar için generic bad request
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    // Endpoint for user login (Session-Based)
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginUser(@Valid @RequestBody LoginRequest request, HttpSession session) {
        AuthService.LoginResult result = authService.login(request);

        switch (result.type) {
            case SUCCESS:
                User user = result.user;
                session.setAttribute("userId", user.getUserId());
                session.setAttribute("username", user.getUsername());
                session.setAttribute("role", user.getRole());
                session.setMaxInactiveInterval(30 * 60);

                // Spring Security context'e authentication ekle
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    user.getUsername(), null, Collections.emptyList() // veya user.getAuthorities() eğer rollerin varsa
                );
                SecurityContextHolder.getContext().setAuthentication(auth);
                session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

                return ResponseEntity.ok(new LoginResponse("Login successful.", false, user.getRole()));
            case TWO_FA_REQUIRED:
                return ResponseEntity.status(HttpStatus.ACCEPTED)
                    .body(new LoginResponse("2FA verification required. A code has been sent to your email.", true, result.user.getRole()));
            case INVALID:
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponse("Invalid credentials.", false, null));
            case BANNED:
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new LoginResponse("Your account has been banned. Contact support.", false, null));
            case SUSPENDED:
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new LoginResponse("Account is suspended. Please verify your email to reactivate.", false, null));
            default:
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponse("Invalid credentials.", false, null));
        }
    }

    // Endpoint for 2FA verification
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

                // Spring Security context'e authentication ekle
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    user.getUsername(), null, Collections.emptyList()
                );
                SecurityContextHolder.getContext().setAuthentication(auth);
                session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

                return ResponseEntity.ok(new LoginResponse("2FA verification successful. You are now logged in.", false, user.getRole()));
            }
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new LoginResponse("Invalid or expired 2FA verification code.", false, null));
    }

    // Endpoint for user logout (Destroy session)
    @PostMapping("/logout")
    public ResponseEntity<String> logoutUser(HttpSession session) {
        if (session.getAttribute("userId") != null) {
            session.invalidate(); // Invalidate the session
            return ResponseEntity.ok("Logged out successfully");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("You are not logged in.");
        }
    }

    // Endpoint for email verification
    @PostMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestBody VerificationRequest request) {
        boolean isVerified = authService.verifyEmail(request.getEmail(), request.getVerificationCode());

        if (isVerified) {
            return ResponseEntity.ok("Email successfully verified.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired verification code.");
        }
    }

    // Endpoint for requesting a password reset
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody PasswordResetRequest request) {
        try {
            boolean emailSent = authService.sendPasswordResetEmail(request.getEmail());
            if (emailSent) {
                return ResponseEntity.ok("Password reset email sent successfully.");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email not found.");
            }
        } catch (RuntimeException ex) {
            // Burada exception mesajını döneceğiz
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    // Endpoint for submitting a new password
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody PasswordResetSubmitRequest request) {
        boolean resetSuccessful = authService.resetPassword(request.getEmail(), request.getCode(), request.getNewPassword());
        if (resetSuccessful) {
            return ResponseEntity.ok("Password reset successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired reset code.");
        }
    }
}
