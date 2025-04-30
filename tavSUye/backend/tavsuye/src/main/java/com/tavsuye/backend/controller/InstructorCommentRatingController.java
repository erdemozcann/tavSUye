package com.tavsuye.backend.controller;

import com.tavsuye.backend.service.InstructorCommentRatingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.Map;

@RestController
@RequestMapping("/api/instructor-comment-ratings")
public class InstructorCommentRatingController {

    private final InstructorCommentRatingService ratingService;

    public InstructorCommentRatingController(InstructorCommentRatingService ratingService) {
        this.ratingService = ratingService;
    }

    // API: Like or dislike a comment
    @PostMapping("/{commentId}/rate")
    public ResponseEntity<String> rateComment(
            @PathVariable Integer commentId,
            @RequestParam Boolean isLike,
            HttpSession session) {
        // Session control
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("You must be logged in to rate a comment.");
        }

        ratingService.rateComment(commentId, userId, isLike);
        return ResponseEntity.ok("Comment rated successfully.");
    }

    // API: Remove like or dislike from a comment
    @DeleteMapping("/{commentId}/rate")
    public ResponseEntity<String> removeRating(
            @PathVariable Integer commentId,
            HttpSession session) {
        // Session control
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("You must be logged in to remove a rating.");
        }

        ratingService.removeRating(commentId, userId);
        return ResponseEntity.ok("Rating removed successfully.");
    }

    // API: Get total likes and dislikes for a comment
    @GetMapping("/{commentId}/stats")
    public ResponseEntity<Map<String, Integer>> getCommentStats(@PathVariable Integer commentId) {
        Map<String, Integer> stats = ratingService.getCommentStats(commentId);
        return ResponseEntity.ok(stats);
    }

    // API: Check if the user liked or disliked a comment
    @GetMapping("/{commentId}/user-rating")
    public ResponseEntity<Boolean> getUserRating(
            @PathVariable Integer commentId,
            HttpSession session) {
        // Session control
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        Boolean isLiked = ratingService.getUserRating(commentId, userId);
        return ResponseEntity.ok(isLiked);
    }
}
