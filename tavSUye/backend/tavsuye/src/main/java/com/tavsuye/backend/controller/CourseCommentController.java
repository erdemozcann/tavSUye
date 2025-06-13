package com.tavsuye.backend.controller;

import com.tavsuye.backend.entity.CourseComment;
import com.tavsuye.backend.entity.User;
import com.tavsuye.backend.service.CourseCommentService;
import com.tavsuye.backend.dto.CourseCommentResponseDto;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.List;

@RestController
@RequestMapping("/api/course-comments")
public class CourseCommentController {

    private final CourseCommentService courseCommentService;

    public CourseCommentController(CourseCommentService courseCommentService) {
        this.courseCommentService = courseCommentService;
    }

    // API: Get all comments for a course
    @GetMapping("/{courseId}")
    public ResponseEntity<?> getCommentsByCourse(
            @PathVariable Integer courseId,
            HttpSession session) {
        // Session control
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("You must be logged in to view comments.");
        }

        // Check if user is admin
        String role = (String) session.getAttribute("role");
        boolean isAdmin = "ADMIN".equals(role);

        List<CourseCommentResponseDto> comments = courseCommentService.getCommentsByCourseFiltered(courseId, userId, isAdmin);
        return ResponseEntity.ok(comments);
    }

    // API: Add a comment to a course
    @PostMapping("/{courseId}")
    public ResponseEntity<String> addCommentToCourse(
            @PathVariable Integer courseId,
            @RequestBody CourseComment comment,
            HttpSession session) {
        // Session control
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("You must be logged in to add a comment.");
        }

        User user = new User();
        user.setUserId(userId); // Associate only with userId
        comment.setUser(user);

        try {
            courseCommentService.addCommentToCourse(courseId, comment);
            return ResponseEntity.ok("Comment added successfully.");
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Course not found");
        }
    }

    // API: Edit a comment
    @PutMapping("/{commentId}")
    public ResponseEntity<String> editComment(
            @PathVariable Integer commentId,
            @RequestBody CourseComment updatedComment,
            HttpSession session) {
        // Session control
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("You must be logged in to edit a comment.");
        }

        try {
            courseCommentService.editComment(commentId, updatedComment, userId);
            return ResponseEntity.ok("Comment updated successfully.");
        } catch (RuntimeException ex) {
            if (ex.getMessage().contains("Comment not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Comment not found");
            } else if (ex.getMessage().contains("not authorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
            }
        }
    }

    // API: Delete a comment
    @DeleteMapping("/{commentId}")
    public ResponseEntity<String> deleteComment(
            @PathVariable Integer commentId,
            HttpSession session) {
        // Session control
        Integer userId = (Integer) session.getAttribute("userId");
        String role = (String) session.getAttribute("role");
        boolean isAdmin = "ADMIN".equals(role);
        
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("You must be logged in to delete a comment.");
        }

        try {
            // Admin control or user authorization
            courseCommentService.deleteComment(commentId, userId, isAdmin);
            return ResponseEntity.ok("Comment deleted successfully.");
        } catch (RuntimeException ex) {
            if (ex.getMessage().contains("Comment not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Comment not found");
            } else if (ex.getMessage().contains("not authorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
            }
        }
    }
}
