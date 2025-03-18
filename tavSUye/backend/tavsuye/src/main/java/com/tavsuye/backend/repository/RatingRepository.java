package com.tavsuye.backend.repository;

import com.tavsuye.backend.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Integer> {
    int countByCommentCommentIdAndLiked(int commentId, boolean liked);

    // Kullanıcının belirli bir kursa ait yorumlara yaptığı beğeni durumlarını getirir
    @Query("""
        SELECT r.comment.commentId, r.liked
        FROM Rating r
        WHERE r.user.userId = :userId AND r.comment.course.courseId = :courseId
    """)
    List<Object[]> findUserRatingsForCourse(Integer userId, Integer courseId);
}
