package com.tavsuye.backend.repository;

import com.tavsuye.backend.entity.CourseCommentRating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CourseCommentRatingRepository extends JpaRepository<CourseCommentRating, Integer> {
    // Find a rating by comment ID and user ID
    Optional<CourseCommentRating> findByComment_CommentIdAndUser_UserId(Integer commentId, Integer userId);

    // Count likes or dislikes for a specific comment
    int countByComment_CommentIdAndLiked(Integer commentId, Boolean liked);
}
