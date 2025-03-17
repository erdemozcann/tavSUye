package com.tavsuye.backend.repository;

import com.tavsuye.backend.entity.Course;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Integer> {
    Optional<Course> findBySubjectAndCourseCode(String subject, String courseCode);
}
