package com.tavsuye.backend.service;

import com.tavsuye.backend.dto.CommentRequest;
import com.tavsuye.backend.entity.Comment;
import com.tavsuye.backend.entity.Course;
import com.tavsuye.backend.entity.User;
import com.tavsuye.backend.repository.CommentRepository;
import com.tavsuye.backend.repository.CourseRepository;
import com.tavsuye.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public CommentService(CommentRepository commentRepository, CourseRepository courseRepository, UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    // 🎯 Handles Adding a Comment
    public ResponseEntity<String> addComment(Integer userId, CommentRequest request) {
        // ✅ Validate User
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        User user = userOptional.get();

        // ❌ BANNED users cannot comment
        if (user.getAccountStatus() == User.AccountStatus.BANNED) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Your account is banned. You cannot comment.");
        }

        // ✅ Validate Course
        Optional<Course> courseOptional = courseRepository.findById(request.getCourseId());
        if (courseOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Course not found");
        }
        Course course = courseOptional.get();

        // ❌ Prevent empty or whitespace-only comments
        if (request.getContent().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Comment content cannot be empty or only spaces.");
        }

        // ✅ Validate Parent Comment (If Reply)
        Comment parentComment = null;
        if (request.getParentCommentId() != null) {
            Optional<Comment> parentOptional = commentRepository.findById(request.getParentCommentId());
            if (parentOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Parent comment not found");
            }
            parentComment = parentOptional.get();
        }

        // 🔥 Create and Save the New Comment
        Comment comment = new Comment();
        comment.setUser(user);
        comment.setCourse(course);
        comment.setParentComment(parentComment);
        comment.setContent(request.getContent().trim()); // Trim spaces
        comment.setIsAnonymous(request.getIsAnonymous() != null ? request.getIsAnonymous() : false);
        comment.setTermTaken(request.getTermTaken());
        comment.setGradeReceived(request.getGradeReceived());
        comment.setCreatedAt(LocalDateTime.now());
        comment.setIsDeleted(false);

        commentRepository.save(comment);

        return ResponseEntity.ok("Comment added successfully");
    }

    // 🎯 Handles Deleting a Comment
    public ResponseEntity<String> deleteComment(Integer userId, Integer commentId) {
        // ✅ Find the Comment
        Optional<Comment> commentOptional = commentRepository.findById(commentId);
        if (commentOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Comment not found.");
        }
        Comment comment = commentOptional.get();

        // 🔒 Ensure the user is the owner of the comment
        if (!comment.getUser().getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not allowed to delete this comment.");
        }

        // 🛠 Check if the comment has replies
        List<Comment> childComments = commentRepository.findByParentCommentAndIsDeletedFalse(comment);
        if (!childComments.isEmpty()) {
            for (Comment child : childComments) {
                // ⏭ Move replies up to the grandparent (or set to null if no grandparent)
                child.setParentComment(comment.getParentComment());
                commentRepository.save(child);
            }
        }

        // ❌ Soft delete the comment (mark as deleted)
        comment.setIsDeleted(true);
        commentRepository.save(comment);

        return ResponseEntity.ok("Comment deleted successfully.");
    }
}
