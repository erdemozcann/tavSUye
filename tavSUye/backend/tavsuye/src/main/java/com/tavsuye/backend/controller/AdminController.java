package com.tavsuye.backend.controller;

import com.tavsuye.backend.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // API: Ban a user (Admin only)
    @PostMapping("/ban-user")
    public ResponseEntity<String> banUser(
            @RequestParam Integer userId,
            @RequestParam String reason,
            HttpSession session) {
        // Session control
        String role = (String) session.getAttribute("role");
        if (role == null || !role.equals("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not authorized to ban a user.");
        }

        try {
            // Ban the user
            adminService.banUser(userId, reason);
            return ResponseEntity.ok("User banned successfully.");
        } catch (RuntimeException ex) {
            if (ex.getMessage().contains("User not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
            }
        }
    }

    // API: Change course subject and code (Admin only)
    @PostMapping("/change-course")
    public ResponseEntity<String> changeCourse(
            @RequestParam Integer oldCourseId,
            @RequestParam Integer newCourseId,
            HttpSession session) {
        // Session control
        String role = (String) session.getAttribute("role");
        if (role == null || !role.equals("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not authorized to change a course.");
        }

        try {
            // Change the course
            adminService.changeCourse(oldCourseId, newCourseId);
            return ResponseEntity.ok("Course changed successfully.");
        } catch (RuntimeException ex) {
            if (ex.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
            }
        }
    }
}
