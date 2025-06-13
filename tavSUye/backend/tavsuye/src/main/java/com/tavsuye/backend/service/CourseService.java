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

    // Get all courses (bulk endpoint for performance)
    public List<Course> getAllCourses(boolean activeOnly) {
        if (activeOnly) {
            return courseRepository.findByCourseStatusTrue();
        } else {
            return courseRepository.findAll();
        }
    }

    public Course getCourseDetails(String subject, String courseCode) {
        return courseRepository.findBySubjectAndCourseCode(subject, courseCode)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    // Add a new course
    public void addCourse(Course course) {
        courseRepository.save(course);
    }

    // Update a course
    public void updateCourse(Integer courseId, Course updatedCourse) {
        Course existingCourse = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with ID: " + courseId));

        // Update fields
        if (updatedCourse.getSubject() != null) {
            existingCourse.setSubject(updatedCourse.getSubject());
        }
        if (updatedCourse.getCourseCode() != null) {
            existingCourse.setCourseCode(updatedCourse.getCourseCode());
        }
        if (updatedCourse.getCourseNameEn() != null) {
            existingCourse.setCourseNameEn(updatedCourse.getCourseNameEn());
        }
        if (updatedCourse.getCourseNameTr() != null) {
            existingCourse.setCourseNameTr(updatedCourse.getCourseNameTr());
        }
        if (updatedCourse.getSuCredit() != null) {
            existingCourse.setSuCredit(updatedCourse.getSuCredit());
        }
        if (updatedCourse.getEctsCredit() != null) {
            existingCourse.setEctsCredit(updatedCourse.getEctsCredit());
        }
        if (updatedCourse.getEngineeringEcts() != null) {
            existingCourse.setEngineeringEcts(updatedCourse.getEngineeringEcts());
        }
        if (updatedCourse.getBasicScienceEcts() != null) {
            existingCourse.setBasicScienceEcts(updatedCourse.getBasicScienceEcts());
        }
        if (updatedCourse.getContentEn() != null) {
            existingCourse.setContentEn(updatedCourse.getContentEn());
        }
        if (updatedCourse.getContentTr() != null) {
            existingCourse.setContentTr(updatedCourse.getContentTr());
        }
        if (updatedCourse.getLinkEn() != null) {
            existingCourse.setLinkEn(updatedCourse.getLinkEn());
        }
        if (updatedCourse.getLinkTr() != null) {
            existingCourse.setLinkTr(updatedCourse.getLinkTr());
        }
        if (updatedCourse.getFaculty() != null) {
            existingCourse.setFaculty(updatedCourse.getFaculty());
        }
        if (updatedCourse.getCourseStatus() != null) {
            existingCourse.setCourseStatus(updatedCourse.getCourseStatus());
        }

        // Save the updated course
        courseRepository.save(existingCourse);
    }
}
