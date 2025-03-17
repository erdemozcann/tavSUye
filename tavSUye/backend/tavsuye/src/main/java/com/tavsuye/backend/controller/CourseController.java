package com.tavsuye.backend.controller;

import com.tavsuye.backend.dto.CourseDetailsResponse;
import com.tavsuye.backend.service.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    // Fetch course details with comments and ratings using subject and course code
    @GetMapping("/{subject}-{courseCode}")
    public ResponseEntity<CourseDetailsResponse> getCourseDetails(
            @PathVariable String subject, 
            @PathVariable String courseCode) {
        
        return ResponseEntity.ok(courseService.getCourseDetails(subject, courseCode));
    }
}
