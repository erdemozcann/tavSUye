package com.tavsuye.backend.controller;

import com.tavsuye.backend.entity.Course;
import com.tavsuye.backend.service.CourseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    // API: Get all subjects
    @GetMapping("/subjects")
    public ResponseEntity<List<String>> getAllSubjects(HttpSession session) {
        // Session control
        if (session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null); // Unauthorized
        }

        List<String> subjects = courseService.getAllSubjects();
        return ResponseEntity.ok(subjects);
    }

    // API: Get all course codes by subject
    @GetMapping("/{subject}/codes")
    public ResponseEntity<List<String>> getCourseCodesBySubject(
            @PathVariable String subject,
            HttpSession session) {
        // Session control
        if (session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null); // Unauthorized
        }

        List<String> courseCodes = courseService.getCourseCodesBySubject(subject);
        return ResponseEntity.ok(courseCodes);
    }

    // API: Get course details by subject and course code
    @GetMapping("/{subject}-{courseCode}")
    public ResponseEntity<Course> getCourseDetails(
            @PathVariable String subject,
            @PathVariable String courseCode,
            HttpSession session) {
        // Session control
        if (session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null); // Unauthorized
        }

        Course course = courseService.getCourseDetails(subject, courseCode);
        return ResponseEntity.ok(course);
    }
}