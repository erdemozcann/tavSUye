package com.tavsuye.backend.controller;

import com.tavsuye.backend.dto.CommentRequest;
import com.tavsuye.backend.service.CommentService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.tavsuye.backend.dto.UserRatingResponse;

import java.util.List;

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

    // 📌 API: Modify a Course Comment
    @PutMapping("/course/modify/{commentId}")
    public ResponseEntity<String> modifyCourseComment(@PathVariable Integer commentId, @Valid @RequestBody CommentRequest request, HttpSession session) {
        // 🔒 Ensure user is authenticated
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
        }

        // 🚀 Call Service to Modify the Course Comment
        return commentService.modifyCourseComment(userId, commentId, request);
    }

    // 📌 API: Like a Comment
    @PostMapping("/like/{commentId}")
    public ResponseEntity<String> likeComment(@PathVariable Integer commentId, HttpSession session) {
        // 🔒 Ensure user is authenticated
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
        }

        // 🚀 Call Service to Like the Comment
        return commentService.likeComment(userId, commentId);
    }

    // 📌 API: Dislike a Comment
    @PostMapping("/dislike/{commentId}")
    public ResponseEntity<String> dislikeComment(@PathVariable Integer commentId, HttpSession session) {
        // 🔒 Ensure user is authenticated
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
        }

        // 🚀 Call Service to Dislike the Comment
        return commentService.dislikeComment(userId, commentId);
    }

    // 📌 API: Get user's ratings for a specific course
    @GetMapping("/course/{courseId}/ratings")
    public ResponseEntity<List<UserRatingResponse>> getUserRatingsForCourse(@PathVariable Integer courseId, HttpSession session) {
        // 🔒 Ensure user is authenticated
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 🚀 Call Service to Get User Ratings
        return commentService.getUserRatingsForCourse(userId, courseId);
    }
}
