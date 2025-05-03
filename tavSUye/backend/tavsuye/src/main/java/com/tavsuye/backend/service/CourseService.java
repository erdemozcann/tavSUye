package com.tavsuye.backend.service;

import com.tavsuye.backend.entity.Course;
import com.tavsuye.backend.repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public List<String> getAllSubjects() {
        return courseRepository.findAllSubjects();
    }

    public List<String> getCourseCodesBySubject(String subject) {
        return courseRepository.findCourseCodesBySubject(subject);
    }

    public Course getCourseDetails(String subject, String courseCode) {
        return courseRepository.findBySubjectAndCourseCode(subject, courseCode)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    // Add a new course
    public void addCourse(Course course) {
        courseRepository.save(course);
    }
}
