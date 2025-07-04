package com.tavsuye.backend.controller;

import com.tavsuye.backend.service.ProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    // 1. API: Get user profile details
    @GetMapping
    public ResponseEntity<Map<String, Object>> getUserProfile(HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        try {
            Map<String, Object> userProfile = profileService.getUserProfile(userId);
            return ResponseEntity.ok(userProfile);
        } catch (RuntimeException ex) {
            if (ex.getMessage().contains("User not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            }
        }
    }

    // 2. API: Update 2FA setting
    @PutMapping("/2fa")
    public ResponseEntity<String> updateTwoFactorAuth(@RequestParam Boolean is2faEnabled, HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You must be logged in to update 2FA settings.");
        }

        try {
            profileService.updateTwoFactorAuth(userId, is2faEnabled);
            return ResponseEntity.ok("Two-factor authentication setting updated successfully.");
        } catch (RuntimeException ex) {
            if (ex.getMessage().contains("User not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
            }
        }
    }

    // 3. API: Update user profile details
    @PutMapping
    public ResponseEntity<String> updateUserProfile(@RequestBody Map<String, Object> updates, HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You must be logged in to update your profile.");
        }

        try {
            profileService.updateUserProfile(userId, updates);
            return ResponseEntity.ok("Profile updated successfully.");
        } catch (RuntimeException ex) {
            if (ex.getMessage().contains("User not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
            }
        }
    }
}
