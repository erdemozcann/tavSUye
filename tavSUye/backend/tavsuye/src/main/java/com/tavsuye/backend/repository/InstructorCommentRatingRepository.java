package com.tavsuye.backend.repository;

import com.tavsuye.backend.entity.InstructorCommentRating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InstructorCommentRatingRepository extends JpaRepository<InstructorCommentRating, Integer> {
    // Find a rating by comment ID and user ID
    Optional<InstructorCommentRating> findByComment_CommentIdAndUser_UserId(Integer commentId, Integer userId);

    // Count likes or dislikes for a specific comment
    int countByComment_CommentIdAndLiked(Integer commentId, Boolean liked);
}
