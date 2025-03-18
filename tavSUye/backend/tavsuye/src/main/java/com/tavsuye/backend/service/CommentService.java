package com.tavsuye.backend.service;

import com.tavsuye.backend.dto.CommentRequest;
import com.tavsuye.backend.dto.UserRatingResponse;
import com.tavsuye.backend.entity.Comment;
import com.tavsuye.backend.entity.Course;
import com.tavsuye.backend.entity.Rating;
import com.tavsuye.backend.entity.User;
import com.tavsuye.backend.repository.CommentRepository;
import com.tavsuye.backend.repository.CourseRepository;
import com.tavsuye.backend.repository.RatingRepository;
import com.tavsuye.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final RatingRepository ratingRepository;

    public CommentService(CommentRepository commentRepository, CourseRepository courseRepository, UserRepository userRepository, RatingRepository ratingRepository) {
        this.commentRepository = commentRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.ratingRepository = ratingRepository;
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
        comment.setAnonymous(request.getIsAnonymous() != null ? request.getIsAnonymous() : false);
        comment.setTermTaken(request.getTermTaken());
        comment.setGradeReceived(request.getGradeReceived());
        comment.setCreatedAt(LocalDateTime.now());
        comment.setDeleted(false);

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
        List<Comment> childComments = commentRepository.findByParentCommentAndDeletedFalse(comment);
        if (!childComments.isEmpty()) {
            for (Comment child : childComments) {
                // ⏭ Move replies up to the grandparent (or set to null if no grandparent)
                child.setParentComment(comment.getParentComment());
                commentRepository.save(child);
            }
        }

        // ❌ Soft delete the comment (mark as deleted)
        comment.setDeleted(true);
        commentRepository.save(comment);

        return ResponseEntity.ok("Comment deleted successfully.");
    }

    // 🎯 Handles Modifying a Comment
    public ResponseEntity<String> modifyComment(Integer userId, Integer commentId, CommentRequest request) {
        // ✅ Find the Comment
        Optional<Comment> commentOptional = commentRepository.findById(commentId);
        if (commentOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Comment not found.");
        }
        Comment comment = commentOptional.get();

        // 🔒 Ensure the user is the owner of the comment
        if (!comment.getUser().getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not allowed to modify this comment.");
        }

        // ❌ Prevent empty or whitespace-only comments
        if (request.getContent().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Comment content cannot be empty or only spaces.");
        }

        // 🔄 Update the comment content and other fields
        comment.setContent(request.getContent().trim());
        comment.setAnonymous(request.getIsAnonymous() != null ? request.getIsAnonymous() : comment.getAnonymous());
        comment.setTermTaken(request.getTermTaken());
        comment.setGradeReceived(request.getGradeReceived());

        commentRepository.save(comment);

        return ResponseEntity.ok("Comment modified successfully.");
    }

    // 🎯 Handles Modifying a Course Comment
    public ResponseEntity<String> modifyCourseComment(Integer userId, Integer commentId, CommentRequest request) {
        // ✅ Find the Comment
        Optional<Comment> commentOptional = commentRepository.findById(commentId);
        if (commentOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Comment not found.");
        }
        Comment comment = commentOptional.get();

        // 🔒 Ensure the user is the owner of the comment
        if (!comment.getUser().getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not allowed to modify this comment.");
        }

        // ❌ Prevent empty or whitespace-only comments
        if (request.getContent().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Comment content cannot be empty or only spaces.");
        }

        // 🔄 Update the comment content and course-specific fields
        comment.setContent(request.getContent().trim());
        comment.setAnonymous(request.getIsAnonymous() != null ? request.getIsAnonymous() : comment.getAnonymous());

        // Only update course-specific fields if they are provided
        if (request.getTermTaken() != null) {
            comment.setTermTaken(request.getTermTaken());
        }
        if (request.getGradeReceived() != null) {
            comment.setGradeReceived(request.getGradeReceived());
        }

        commentRepository.save(comment);

        return ResponseEntity.ok("Course comment modified successfully.");
    }

    // 🎯 Handles Liking a Comment
    public ResponseEntity<String> likeComment(Integer userId, Integer commentId) {
        // ✅ Validate User
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        User user = userOptional.get();

        // ✅ Validate Comment
        Optional<Comment> commentOptional = commentRepository.findById(commentId);
        if (commentOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Comment not found");
        }
        Comment comment = commentOptional.get();

        // 🔥 Create and Save the Like Rating
        Rating rating = new Rating();
        rating.setUser(user);
        rating.setComment(comment);
        rating.setLiked(true);
        rating.setCreatedAt(LocalDateTime.now());

        ratingRepository.save(rating);

        return ResponseEntity.ok("Comment liked successfully.");
    }

    // 🎯 Handles Disliking a Comment
    public ResponseEntity<String> dislikeComment(Integer userId, Integer commentId) {
        // ✅ Validate User
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        User user = userOptional.get();

        // ✅ Validate Comment
        Optional<Comment> commentOptional = commentRepository.findById(commentId);
        if (commentOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Comment not found");
        }
        Comment comment = commentOptional.get();

        // 🔥 Create and Save the Dislike Rating
        Rating rating = new Rating();
        rating.setUser(user);
        rating.setComment(comment);
        rating.setLiked(false);
        rating.setCreatedAt(LocalDateTime.now());

        ratingRepository.save(rating);

        return ResponseEntity.ok("Comment disliked successfully.");
    }

    // 🎯 Get user's ratings for a specific course
    public ResponseEntity<List<UserRatingResponse>> getUserRatingsForCourse(Integer userId, Integer courseId) {
        List<Object[]> ratings = ratingRepository.findUserRatingsForCourse(userId, courseId);

        List<UserRatingResponse> response = ratings.stream()
                .map(rating -> new UserRatingResponse((Integer) rating[0], (Boolean) rating[1]))
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}
