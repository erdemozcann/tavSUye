package com.tavsuye.backend.service;

import com.tavsuye.backend.entity.Course;
import com.tavsuye.backend.entity.CourseViewLog;
import com.tavsuye.backend.entity.User;
import com.tavsuye.backend.repository.CourseRepository;
import com.tavsuye.backend.repository.CourseViewLogRepository;
import com.tavsuye.backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CourseViewLogService {

    private final CourseViewLogRepository courseViewLogRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public CourseViewLogService(CourseViewLogRepository courseViewLogRepository, CourseRepository courseRepository, UserRepository userRepository) {
        this.courseViewLogRepository = courseViewLogRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    // ✅ Log a Course View (Ensures unique user-course entries)
    @Transactional
    public String logCourseView(String subject, String courseCode, Integer userId, HttpServletRequest request) {
        // 🔎 Validate User
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return "User not found";
        }
        User user = userOptional.get();

        // 🔎 Validate Course
        Optional<Course> courseOptional = courseRepository.findBySubjectAndCourseCode(subject, courseCode);
        if (courseOptional.isEmpty()) {
            return "Course not found";
        }
        Course course = courseOptional.get();

        // 🔍 Check if the user has already viewed this course
        Optional<CourseViewLog> existingLog = courseViewLogRepository.findByUser_UserIdAndCourse_CourseId(userId, course.getCourseId());

        if (existingLog.isPresent()) {
            // 🔄 Update the existing log timestamp
            CourseViewLog log = existingLog.get();
            log.setViewedAt(LocalDateTime.now());
            log.setIpAddress(request.getRemoteAddr());
            log.setUserAgent(request.getHeader("User-Agent"));
            courseViewLogRepository.save(log);
        } else {
            // 🆕 Create a new log entry
            CourseViewLog newLog = new CourseViewLog();
            newLog.setUser(user);
            newLog.setCourse(course);
            newLog.setViewedAt(LocalDateTime.now());
            newLog.setIpAddress(request.getRemoteAddr());
            newLog.setUserAgent(request.getHeader("User-Agent"));
            courseViewLogRepository.save(newLog);
        }

        // 🗑️ Cleanup old duplicate views to keep only the latest one per user-course pair
        courseViewLogRepository.removeDuplicateViews();

        return "Course view logged successfully";
    }

    // ✅ Get Top 10 Most Viewed Courses in the Last 30 Days (By Unique Users)
    public List<Integer> getMostViewedCoursesLast30Days() {
        LocalDateTime since = LocalDateTime.now().minusDays(30);
        List<Object[]> results = courseViewLogRepository.findMostViewedCoursesSince(since);

        return results.stream()
                      .map(row -> (Integer) row[0]) // Extract course IDs
                      .collect(Collectors.toList());
    }
}
