package com.tavsuye.backend.repository;

import com.tavsuye.backend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Integer> {
	List<Comment> findByCourse_CourseIdAndIsDeletedFalse(Integer courseId);
	List<Comment> findByParentCommentAndIsDeletedFalse(Comment parentComment);
}
