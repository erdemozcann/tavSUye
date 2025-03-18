package com.tavsuye.backend.controller;

import com.tavsuye.backend.service.CourseViewLogService;
import com.tavsuye.backend.service.CourseViewLogService.CourseViewLogResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/course-views")
public class CourseViewLogController {

    private final CourseViewLogService courseViewLogService;

    public CourseViewLogController(CourseViewLogService courseViewLogService) {
        this.courseViewLogService = courseViewLogService;
    }

    // ✅ API: Log Course View (Ensures Unique User-Course Entries)
    @PostMapping("/{subject}-{courseCode}")
    public ResponseEntity<String> logCourseView(@PathVariable String subject,
                                                @PathVariable String courseCode,
                                                HttpSession session,
                                                HttpServletRequest request) {
        // 🔒 Ensure user is authenticated
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User must be logged in to view a course.");
        }

        // 📌 Log the course view
        String result = courseViewLogService.logCourseView(subject, courseCode, userId, request);
        return ResponseEntity.ok(result);
    }

    // ✅ API: Get Top 10 Most Viewed Courses in the Last 30 Days
    @GetMapping("/most-viewed")
    public ResponseEntity<List<CourseViewLogResponse>> getMostViewedCourses() {
        List<CourseViewLogResponse> courses = courseViewLogService.getMostViewedCoursesLast30Days();
        return ResponseEntity.ok(courses);
    }
}
