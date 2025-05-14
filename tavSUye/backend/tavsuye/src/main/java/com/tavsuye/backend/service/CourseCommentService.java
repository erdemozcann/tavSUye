package com.tavsuye.backend.service;

import com.tavsuye.backend.entity.Course;
import com.tavsuye.backend.entity.CourseComment;
import com.tavsuye.backend.repository.CourseCommentRepository;
import com.tavsuye.backend.repository.CourseRepository;
import com.tavsuye.backend.dto.CourseCommentResponseDto;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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

        // Set parent comment if parentCommentId exists
        Integer parentCommentId = comment.getParentCommentId();
        if (parentCommentId != null) {
            CourseComment parentComment = courseCommentRepository.findById(parentCommentId)
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            
            // Verify parent comment belongs to the same course
            if (!parentComment.getCourse().getCourseId().equals(courseId)) {
                throw new RuntimeException("Parent comment does not belong to the specified course");
            }
            
            // Set the actual parent comment entity, not just the ID reference
            comment.setParentComment(parentComment);
        }

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

    public List<CourseCommentResponseDto> getCommentsByCourseFiltered(Integer courseId, Integer requestUserId) {
        // Get all comments including deleted ones
        List<CourseComment> comments = courseCommentRepository.findByCourse_CourseId(courseId);
        return comments.stream()
                .map(comment -> CourseCommentResponseDto.fromEntity(comment, requestUserId))
                .collect(Collectors.toList());
    }
}