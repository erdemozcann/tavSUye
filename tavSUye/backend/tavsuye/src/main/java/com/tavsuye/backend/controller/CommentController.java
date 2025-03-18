package com.tavsuye.backend.controller;

import com.tavsuye.backend.dto.CommentRequest;
import com.tavsuye.backend.service.CommentService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    // 📌 API: Add Comment (Course or Reply)
    @PostMapping("/course/add")
    public ResponseEntity<String> addComment(@Valid @RequestBody CommentRequest request, HttpSession session) {
        // 🔒 Ensure user is authenticated
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated. Please log in again.");
        }

        // 🚀 Call the Service Layer to Handle Comment Creation
        return commentService.addComment(userId, request);
    }
    
    // 📌 API: Delete a Comment
    @DeleteMapping("/delete/{commentId}")
    public ResponseEntity<String> deleteComment(@PathVariable Integer commentId, HttpSession session) {
        // 🔒 Ensure user is authenticated
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
        }

        // 🚀 Call Service to Delete the Comment
        return commentService.deleteComment(userId, commentId);
    }

    // 📌 API: Modify a Comment
    @PutMapping("/modify/{commentId}")
    public ResponseEntity<String> modifyComment(@PathVariable Integer commentId, @Valid @RequestBody CommentRequest request, HttpSession session) {
        // 🔒 Ensure user is authenticated
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
        }

        // 🚀 Call Service to Modify the Comment
        return commentService.modifyComment(userId, commentId, request);
    }
}
