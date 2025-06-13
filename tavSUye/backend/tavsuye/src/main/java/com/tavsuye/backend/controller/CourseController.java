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

    // API: Get all courses (bulk endpoint for performance)
    @GetMapping("/all")
    public ResponseEntity<List<Course>> getAllCourses(
            @RequestParam(defaultValue = "true") boolean activeOnly,
            HttpSession session) {
        // Session control
        if (session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null); // Unauthorized
        }

        List<Course> courses = courseService.getAllCourses(activeOnly);
        return ResponseEntity.ok(courses);
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
    public ResponseEntity<?> getCourseDetails(
            @PathVariable String subject,
            @PathVariable String courseCode,
            HttpSession session) {
        // Session control
        if (session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null); // Unauthorized
        }

        try {
            Course course = courseService.getCourseDetails(subject, courseCode);
            return ResponseEntity.ok(course);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Course not found");
        }
    }

    // API: Add a new course (Admin only)
    @PostMapping("/add")
    public ResponseEntity<String> addCourse(@RequestBody Course course, HttpSession session) {
        // Session control
        String role = (String) session.getAttribute("role");
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not authorized to add a course.");
        }

        // Set course_status to active (true) by default
        course.setCourseStatus(true);

        // Save the course
        courseService.addCourse(course);
        return ResponseEntity.ok("Course added successfully.");
    }

    // API: Update a course (Admin only)
    @PutMapping("/{courseId}")
    public ResponseEntity<String> updateCourse(
            @PathVariable Integer courseId,
            @RequestBody Course updatedCourse,
            HttpSession session) {
        // Session control
        String role = (String) session.getAttribute("role");
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not authorized to update a course.");
        }

        // Update the course
        try {
            courseService.updateCourse(courseId, updatedCourse);
            return ResponseEntity.ok("Course updated successfully.");
        } catch (RuntimeException ex) {
            // If the exception contains "not found" in the message, return 404
            if (ex.getMessage() != null && ex.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
            }
            // Otherwise, re-throw the exception to be handled as 500
            throw ex;
        }
    }
}
