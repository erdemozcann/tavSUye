package com.tavsuye.backend.service;

import com.tavsuye.backend.entity.Course;
import com.tavsuye.backend.entity.CourseViewLog;
import com.tavsuye.backend.entity.User;
import com.tavsuye.backend.repository.CourseRepository;
import com.tavsuye.backend.repository.CourseViewLogRepository;
import com.tavsuye.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CourseViewLogService {

    private final CourseViewLogRepository courseViewLogRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public CourseViewLogService(CourseViewLogRepository courseViewLogRepository, UserRepository userRepository, CourseRepository courseRepository) {
        this.courseViewLogRepository = courseViewLogRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
    }

    public void logCourseVisit(Integer userId, Integer courseId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        CourseViewLog log = new CourseViewLog(user, course);
        courseViewLogRepository.save(log);
    }

    public List<Object[]> getTopVisitedCourses() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        return courseViewLogRepository.findTopVisitedCourses(thirtyDaysAgo);
    }
}