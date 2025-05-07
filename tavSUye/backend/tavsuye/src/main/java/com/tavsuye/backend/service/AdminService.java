package com.tavsuye.backend.service;

import com.tavsuye.backend.entity.Course;
import com.tavsuye.backend.entity.CourseComment;
import com.tavsuye.backend.entity.User;
import com.tavsuye.backend.repository.CourseCommentRepository;
import com.tavsuye.backend.repository.CourseRepository;
import com.tavsuye.backend.repository.UserRepository;
import com.tavsuye.backend.utils.EmailService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final CourseRepository courseRepository;
    private final CourseCommentRepository courseCommentRepository;

    public AdminService(UserRepository userRepository, EmailService emailService,
                        CourseRepository courseRepository, CourseCommentRepository courseCommentRepository) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.courseRepository = courseRepository;
        this.courseCommentRepository = courseCommentRepository;
    }

    // Ban a user
    public void banUser(Integer userId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Update user status to BANNED
        user.setAccountStatus(User.AccountStatus.BANNED);
        userRepository.save(user);

        // Send ban notification email
        emailService.sendBanNotificationEmail(user.getEmail(), reason);
    }

    // Change course subject and code
    public void changeCourse(Integer oldCourseId, Integer newCourseId) {
        Course oldCourse = courseRepository.findById(oldCourseId)
                .orElseThrow(() -> new RuntimeException("Old course not found with ID: " + oldCourseId));
        Course newCourse = courseRepository.findById(newCourseId)
                .orElseThrow(() -> new RuntimeException("New course not found with ID: " + newCourseId));

        // Fetch all comments from the old course
        List<CourseComment> oldComments = courseCommentRepository.findByCourse_CourseIdAndDeletedFalse(oldCourseId);

        // Copy comments to the new course
        for (CourseComment comment : oldComments) {
            CourseComment newComment = new CourseComment();
            newComment.setCourse(newCourse);
            newComment.setUser(comment.getUser());
            newComment.setContent("From " + oldCourse.getSubject() + " " + oldCourse.getCourseCode() + ": " + comment.getContent());
            newComment.setCreatedAt(comment.getCreatedAt());
            newComment.setDeleted(false);
            newComment.setAnonymous(comment.getAnonymous());
            newComment.setTermTaken(comment.getTermTaken());
            newComment.setGradeReceived(comment.getGradeReceived());
            courseCommentRepository.save(newComment);
        }

        // Set old course status to inactive
        oldCourse.setCourseStatus(false);
        courseRepository.save(oldCourse);
    }
}
