package com.tavsuye.backend.repository;

import com.tavsuye.backend.entity.CourseComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseCommentRepository extends JpaRepository<CourseComment, Integer> {

    List<CourseComment> findByCourse_CourseIdAndDeletedFalse(Integer courseId);

    // Find all comments for a course, including deleted ones
    List<CourseComment> findByCourse_CourseId(Integer courseId);
}