package com.tavsuye.backend.repository;

import com.tavsuye.backend.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Integer> {

    @Query("SELECT DISTINCT c.subject FROM Course c")
    List<String> findAllSubjects();

    @Query("SELECT c.courseCode FROM Course c WHERE c.subject = :subject")
    List<String> findCourseCodesBySubject(String subject);

    @Query("SELECT c FROM Course c WHERE c.subject = :subject AND c.courseCode = :courseCode")
    Optional<Course> findBySubjectAndCourseCode(String subject, String courseCode);
}