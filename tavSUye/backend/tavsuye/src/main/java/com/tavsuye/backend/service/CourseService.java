package com.tavsuye.backend.service;

import com.tavsuye.backend.dto.CourseDetailsResponse;
import com.tavsuye.backend.dto.CommentResponse;
import com.tavsuye.backend.entity.Comment;
import com.tavsuye.backend.entity.Course;
import com.tavsuye.backend.repository.CommentRepository;
import com.tavsuye.backend.repository.CourseRepository;
import com.tavsuye.backend.repository.RatingRepository;
import com.tavsuye.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final CommentRepository commentRepository;
    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;

    public CourseService(CourseRepository courseRepository, CommentRepository commentRepository, 
                         RatingRepository ratingRepository, UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.commentRepository = commentRepository;
        this.ratingRepository = ratingRepository;
        this.userRepository = userRepository;
    }

    public CourseDetailsResponse getCourseDetails(String subject, String courseCode) {
        Course course = courseRepository.findBySubjectAndCourseCode(subject, courseCode)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        List<Comment> comments = commentRepository.findByCourse_CourseIdAndDeletedFalse(course.getCourseId());

        List<CommentResponse> commentResponses = comments.stream()
                .map(comment -> {
                    var user = comment.getUser();

                    return new CommentResponse(
                        comment.getCommentId(),
                        user.getUsername(),  
                        user.getName(),
                        user.getSurname(),
                        comment.getParentCommentId(),
                        comment.getTermTaken(),
                        comment.getGradeReceived(),
                        comment.getContent(),
                        comment.getCreatedAt(),
                        comment.getAnonymous(),
                        ratingRepository.countByCommentCommentIdAndLiked(comment.getCommentId(), true),
                        ratingRepository.countByCommentCommentIdAndLiked(comment.getCommentId(), false)
                    );
                }).collect(Collectors.toList());

        return new CourseDetailsResponse(course, commentResponses);
    }
}
