package com.tavsuye.backend.service;

import com.tavsuye.backend.entity.CourseComment;
import com.tavsuye.backend.entity.CourseCommentRating;
import com.tavsuye.backend.entity.User;
import com.tavsuye.backend.repository.CourseCommentRatingRepository;
import com.tavsuye.backend.repository.CourseCommentRepository;
import com.tavsuye.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class CourseCommentRatingService {

    private final CourseCommentRatingRepository ratingRepository;
    private final CourseCommentRepository commentRepository;
    private final UserRepository userRepository; // Add UserRepository

    public CourseCommentRatingService(
            CourseCommentRatingRepository ratingRepository,
            CourseCommentRepository commentRepository,
            UserRepository userRepository) { // Inject UserRepository
        this.ratingRepository = ratingRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
    }

    // Rate a comment (like or dislike)
    public void rateComment(Integer commentId, Integer userId, Boolean isLike) {
        Optional<CourseCommentRating> existingRating = ratingRepository.findByCommentIdAndUserId(commentId, userId);

        if (existingRating.isPresent()) {
            // Update the existing rating
            CourseCommentRating rating = existingRating.get();
            rating.setLiked(isLike);
            ratingRepository.save(rating);
        } else {
            // Create a new rating
            CourseComment comment = commentRepository.findById(commentId)
                    .orElseThrow(() -> new RuntimeException("Comment not found"));

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            CourseCommentRating rating = new CourseCommentRating();
            rating.setComment(comment);
            rating.setUser(user); // Associate the existing User object
            rating.setLiked(isLike);
            ratingRepository.save(rating);
        }
    }

    // Remove a rating from a comment
    public void removeRating(Integer commentId, Integer userId) {
        Optional<CourseCommentRating> existingRating = ratingRepository.findByCommentIdAndUserId(commentId, userId);

        if (existingRating.isPresent()) {
            ratingRepository.delete(existingRating.get());
        } else {
            throw new RuntimeException("Rating not found.");
        }
    }

    // Get total likes and dislikes for a comment
    public Map<String, Integer> getCommentStats(Integer commentId) {
        int likes = ratingRepository.countByCommentIdAndLiked(commentId, true);
        int dislikes = ratingRepository.countByCommentIdAndLiked(commentId, false);

        Map<String, Integer> stats = new HashMap<>();
        stats.put("likes", likes);
        stats.put("dislikes", dislikes);

        return stats;
    }

    // Check if the user liked or disliked a comment
    public Boolean getUserRating(Integer commentId, Integer userId) {
        Optional<CourseCommentRating> rating = ratingRepository.findByCommentIdAndUserId(commentId, userId);
        return rating.map(CourseCommentRating::getLiked).orElse(null);
    }
}
