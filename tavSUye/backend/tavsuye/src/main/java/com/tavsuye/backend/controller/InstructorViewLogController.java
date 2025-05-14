package com.tavsuye.backend.controller;

import com.tavsuye.backend.service.InstructorViewLogService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.List;

@RestController
@RequestMapping("/api/instructor-view-log")
public class InstructorViewLogController {

    private final InstructorViewLogService instructorViewLogService;

    public InstructorViewLogController(InstructorViewLogService instructorViewLogService) {
        this.instructorViewLogService = instructorViewLogService;
    }

    // API: Log an instructor visit
    @PostMapping("/log")
    public ResponseEntity<String> logInstructorVisit(@RequestParam Integer instructorId, HttpSession session) {
        // Session control
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You must be logged in to log an instructor visit.");
        }

        try {
            // Log user and instructor information
            instructorViewLogService.logInstructorVisit(userId, instructorId);
            return ResponseEntity.ok("Instructor visit logged successfully.");
        } catch (RuntimeException ex) {
            if (ex.getMessage().contains("Instructor not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Instructor not found");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
            }
        }
    }

    // API: Get top visited instructors in the last 30 days
    @GetMapping("/top-visited")
    public ResponseEntity<List<Object[]>> getTopVisitedInstructors(HttpSession session) {
        // Session control
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null); // Unauthorized
        }

        List<Object[]> topInstructors = instructorViewLogService.getTopVisitedInstructors();
        return ResponseEntity.ok(topInstructors);
    }
}
