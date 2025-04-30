package com.tavsuye.backend.controller;

import com.tavsuye.backend.entity.InstructorComment;
import com.tavsuye.backend.entity.User;
import com.tavsuye.backend.service.InstructorCommentService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.List;

@RestController
@RequestMapping("/api/instructor-comments")
public class InstructorCommentController {

    private final InstructorCommentService instructorCommentService;

    public InstructorCommentController(InstructorCommentService instructorCommentService) {
        this.instructorCommentService = instructorCommentService;
    }

    // API: Get all comments for an instructor
    @GetMapping("/{instructorId}")
    public ResponseEntity<List<InstructorComment>> getCommentsByInstructor(
            @PathVariable Integer instructorId,
            HttpSession session) {
        // Session control
        if (session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null); // Unauthorized
        }

        List<InstructorComment> comments = instructorCommentService.getCommentsByInstructor(instructorId);
        return ResponseEntity.ok(comments);
    }

    // API: Add a comment to an instructor
    @PostMapping("/{instructorId}")
    public ResponseEntity<String> addCommentToInstructor(
            @PathVariable Integer instructorId,
            @RequestBody InstructorComment comment,
            HttpSession session) {
        // Session control
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("You must be logged in to add a comment.");
        }

        User user = new User();
        user.setUserId(userId); // Associate only with userId
        comment.setUser(user);

        instructorCommentService.addCommentToInstructor(instructorId, comment);
        return ResponseEntity.ok("Comment added successfully.");
    }

    // API: Edit a comment
    @PutMapping("/{commentId}")
    public ResponseEntity<String> editComment(
            @PathVariable Integer commentId,
            @RequestBody InstructorComment updatedComment,
            HttpSession session) {
        // Session control
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("You must be logged in to edit a comment.");
        }

        instructorCommentService.editComment(commentId, updatedComment, userId);
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
        instructorCommentService.deleteComment(commentId, userId, isAdmin != null && isAdmin);
        return ResponseEntity.ok("Comment deleted successfully.");
    }
}
