package com.tavsuye.backend.service;

import com.tavsuye.backend.entity.InstructorComment;
import com.tavsuye.backend.entity.InstructorCommentRating;
import com.tavsuye.backend.entity.User;
import com.tavsuye.backend.repository.InstructorCommentRatingRepository;
import com.tavsuye.backend.repository.InstructorCommentRepository;
import com.tavsuye.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class InstructorCommentRatingService {

    private final InstructorCommentRatingRepository ratingRepository;
    private final InstructorCommentRepository commentRepository;
    private final UserRepository userRepository;

    public InstructorCommentRatingService(
            InstructorCommentRatingRepository ratingRepository,
            InstructorCommentRepository commentRepository,
            UserRepository userRepository) {
        this.ratingRepository = ratingRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
    }

    // Rate a comment (like or dislike)
    public void rateComment(Integer commentId, Integer userId, Boolean isLike) {
        Optional<InstructorCommentRating> existingRating = ratingRepository.findByComment_CommentIdAndUser_UserId(commentId, userId);

        if (existingRating.isPresent()) {
            // Update the existing rating
            InstructorCommentRating rating = existingRating.get();
            rating.setLiked(isLike);
            rating.setCreatedAt(java.time.LocalDateTime.now());
            ratingRepository.save(rating);
        } else {
            // Create a new rating
            InstructorComment comment = commentRepository.findById(commentId)
                    .orElseThrow(() -> new RuntimeException("Comment not found"));

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            InstructorCommentRating rating = new InstructorCommentRating();
            rating.setComment(comment);
            rating.setUser(user);
            rating.setLiked(isLike);
            ratingRepository.save(rating);
        }
    }

    // Remove a rating from a comment
    public void removeRating(Integer commentId, Integer userId) {
        Optional<InstructorCommentRating> existingRating = ratingRepository.findByComment_CommentIdAndUser_UserId(commentId, userId);

        if (existingRating.isPresent()) {
            ratingRepository.delete(existingRating.get());
        } else {
            throw new RuntimeException("Rating not found.");
        }
    }

    // Get total likes and dislikes for a comment
    public Map<String, Integer> getCommentStats(Integer commentId) {
        int likes = ratingRepository.countByComment_CommentIdAndLiked(commentId, true);
        int dislikes = ratingRepository.countByComment_CommentIdAndLiked(commentId, false);

        Map<String, Integer> stats = new HashMap<>();
        stats.put("likes", likes);
        stats.put("dislikes", dislikes);

        return stats;
    }

    // Check if the user liked or disliked a comment
    public Boolean getUserRating(Integer commentId, Integer userId) {
        Optional<InstructorCommentRating> rating = ratingRepository.findByComment_CommentIdAndUser_UserId(commentId, userId);
        return rating.map(InstructorCommentRating::getLiked).orElse(null);
    }
}
