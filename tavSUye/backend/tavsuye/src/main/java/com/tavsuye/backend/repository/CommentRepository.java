package com.tavsuye.backend.repository;

import com.tavsuye.backend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Integer> {
    List<Comment> findByCourse_CourseIdAndDeletedFalse(Integer courseId);
    List<Comment> findByParentCommentAndDeletedFalse(Comment parentComment);
}
