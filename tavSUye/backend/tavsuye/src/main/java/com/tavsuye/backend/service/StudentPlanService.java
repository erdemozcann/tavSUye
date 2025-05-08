package com.tavsuye.backend.service;

import com.tavsuye.backend.entity.Course;
import com.tavsuye.backend.entity.StudentPlan;
import com.tavsuye.backend.entity.User;
import com.tavsuye.backend.repository.CourseRepository;
import com.tavsuye.backend.repository.StudentPlanRepository;
import com.tavsuye.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentPlanService {

    private final StudentPlanRepository studentPlanRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public StudentPlanService(StudentPlanRepository studentPlanRepository, UserRepository userRepository, CourseRepository courseRepository) {
        this.studentPlanRepository = studentPlanRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
    }

    // Save a student's plan
    public void saveStudentPlan(Integer userId, Integer courseId, Integer term) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with ID: " + courseId));

        StudentPlan plan = new StudentPlan();
        plan.setUser(user);
        plan.setCourse(course);
        plan.setTerm(term);

        studentPlanRepository.save(plan);
    }

    // Get all student plans for a user
    public List<StudentPlan> getAllStudentPlans(Integer userId) {
        return studentPlanRepository.findByUser_UserId(userId);
    }

    // Delete all student plans for a user
    public void deleteAllStudentPlans(Integer userId) {
        List<StudentPlan> plans = studentPlanRepository.findByUser_UserId(userId);
        studentPlanRepository.deleteAll(plans);
    }
}
