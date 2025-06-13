package com.tavsuye.backend.service;

import com.tavsuye.backend.entity.Instructor;
import com.tavsuye.backend.entity.InstructorComment;
import com.tavsuye.backend.repository.InstructorCommentRepository;
import com.tavsuye.backend.repository.InstructorRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InstructorCommentService {

    private final InstructorCommentRepository instructorCommentRepository;
    private final InstructorRepository instructorRepository;

    public InstructorCommentService(InstructorCommentRepository instructorCommentRepository, InstructorRepository instructorRepository) {
        this.instructorCommentRepository = instructorCommentRepository;
        this.instructorRepository = instructorRepository;
    }

    public List<InstructorComment> getCommentsByInstructor(Integer instructorId) {
        return instructorCommentRepository.findByInstructor_InstructorId(instructorId);
    }

    public void addCommentToInstructor(Integer instructorId, InstructorComment comment) {
        Instructor instructor = instructorRepository.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        // Check if parent comment exists if provided
        if (comment.getParentCommentId() != null) {
            InstructorComment parentComment = instructorCommentRepository.findById(comment.getParentCommentId())
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            
            // Ensure parent comment belongs to the same instructor
            if (!parentComment.getInstructor().getInstructorId().equals(instructorId)) {
                throw new RuntimeException("Parent comment does not belong to this instructor");
            }
            
            comment.setParentComment(parentComment);
        }

        comment.setInstructor(instructor);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setDeleted(false);
        instructorCommentRepository.save(comment);
    }

    public void editComment(Integer commentId, InstructorComment updatedComment, Integer userId) {
        InstructorComment existingComment = instructorCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!existingComment.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("You are not authorized to edit this comment.");
        }

        existingComment.setContent(updatedComment.getContent());
        existingComment.setAnonymous(updatedComment.getAnonymous());
        instructorCommentRepository.save(existingComment);
    }

    public void deleteComment(Integer commentId, Integer userId, boolean isAdmin) {
        InstructorComment comment = instructorCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!isAdmin && !comment.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("You are not authorized to delete this comment.");
        }

        comment.setDeleted(true); // Soft delete
        instructorCommentRepository.save(comment);
    }
}
