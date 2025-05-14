package com.tavsuye.backend.controller;

import com.tavsuye.backend.service.CourseViewLogService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.List;

@RestController
@RequestMapping("/api/course-view-log")
public class CourseViewLogController {

    private final CourseViewLogService courseViewLogService;

    public CourseViewLogController(CourseViewLogService courseViewLogService) {
        this.courseViewLogService = courseViewLogService;
    }

    // API: Log a course visit
    @PostMapping("/log")
    public ResponseEntity<String> logCourseVisit(@RequestParam Integer courseId, HttpSession session) {
        // Session control
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You must be logged in to log a course visit.");
        }

        try {
            // Log user and course information
            courseViewLogService.logCourseVisit(userId, courseId);
            return ResponseEntity.ok("Course visit logged successfully.");
        } catch (RuntimeException ex) {
            if (ex.getMessage().contains("Course not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Course not found");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
            }
        }
    }

    // API: Get top visited courses in the last 30 days
    @GetMapping("/top-visited")
    public ResponseEntity<List<Object[]>> getTopVisitedCourses(HttpSession session) {
        // Session control
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null); // Unauthorized
        }

        List<Object[]> topCourses = courseViewLogService.getTopVisitedCourses();
        return ResponseEntity.ok(topCourses);
    }
}
