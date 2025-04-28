package com.tavsuye.backend.service;

import com.tavsuye.backend.entity.Course;
import com.tavsuye.backend.entity.CourseComment;
import com.tavsuye.backend.repository.CourseCommentRepository;
import com.tavsuye.backend.repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CourseCommentService {

    private final CourseCommentRepository courseCommentRepository;
    private final CourseRepository courseRepository;

    public CourseCommentService(CourseCommentRepository courseCommentRepository, CourseRepository courseRepository) {
        this.courseCommentRepository = courseCommentRepository;
        this.courseRepository = courseRepository;
    }

    public List<CourseComment> getCommentsByCourse(Integer courseId) {
        return courseCommentRepository.findByCourse_CourseIdAndDeletedFalse(courseId);
    }

    public void addCommentToCourse(Integer courseId, CourseComment comment) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        comment.setCourse(course);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setDeleted(false);
        courseCommentRepository.save(comment);
    }

    public void editComment(Integer commentId, CourseComment updatedComment, Integer userId) {
        CourseComment existingComment = courseCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!existingComment.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("You are not authorized to edit this comment.");
        }

        existingComment.setContent(updatedComment.getContent());
        existingComment.setAnonymous(updatedComment.getAnonymous());
        courseCommentRepository.save(existingComment);
    }

    public void deleteComment(Integer commentId, Integer userId, boolean isAdmin) {
        CourseComment comment = courseCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!isAdmin && !comment.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("You are not authorized to delete this comment.");
        }

        comment.setDeleted(true); // Soft delete
        courseCommentRepository.save(comment);
    }
}