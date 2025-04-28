package com.tavsuye.backend.controller;

import com.tavsuye.backend.entity.CourseComment;
import com.tavsuye.backend.entity.User;
import com.tavsuye.backend.service.CourseCommentService;

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
    public ResponseEntity<List<CourseComment>> getCommentsByCourse(
            @PathVariable Integer courseId,
            HttpSession session) {
        // Session control
        if (session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null); // Unauthorized
        }

        List<CourseComment> comments = courseCommentService.getCommentsByCourse(courseId);
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

        courseCommentService.addCommentToCourse(courseId, comment);
        return ResponseEntity.ok("Comment added successfully.");
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

        courseCommentService.editComment(commentId, updatedComment, userId);
        return ResponseEntity.ok("Comment updated successfully.");
    }

    // API: Delete a comment
    @DeleteMapping("/{commentId}")
    public ResponseEntity<String> deleteComment(
            @PathVariable Integer commentId,
            HttpSession session) {
        // Session control
        Integer userId = (Integer) session.getAttribute("userId");
        Boolean isAdmin = (Boolean) session.getAttribute("isAdmin");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("You must be logged in to delete a comment.");
        }

        // Admin control or user authorization
        courseCommentService.deleteComment(commentId, userId, isAdmin != null && isAdmin);
        return ResponseEntity.ok("Comment deleted successfully.");
    }
}
