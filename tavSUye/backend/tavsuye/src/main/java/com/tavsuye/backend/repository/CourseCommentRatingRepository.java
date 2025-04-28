package com.tavsuye.backend.repository;

import com.tavsuye.backend.entity.CourseCommentRating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CourseCommentRatingRepository extends JpaRepository<CourseCommentRating, Integer> {
    // Find a rating by comment ID and user ID
    Optional<CourseCommentRating> findByCommentIdAndUserId(Integer commentId, Integer userId);

    // Count likes or dislikes for a specific comment
    int countByCommentIdAndLiked(Integer commentId, Boolean liked);
}
