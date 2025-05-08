package com.tavsuye.backend.controller;

import com.tavsuye.backend.entity.StudentPlan;
import com.tavsuye.backend.service.StudentPlanService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.List;

@RestController
@RequestMapping("/api/student-plan")
public class StudentPlanController {

    private final StudentPlanService studentPlanService;

    public StudentPlanController(StudentPlanService studentPlanService) {
        this.studentPlanService = studentPlanService;
    }

    // 1. API: Save a student's plan
    @PostMapping("/save")
    public ResponseEntity<String> saveStudentPlan(
            @RequestParam Integer courseId,
            @RequestParam Integer term,
            HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("You must be logged in to save a plan.");
        }

        studentPlanService.saveStudentPlan(userId, courseId, term);
        return ResponseEntity.ok("Student plan saved successfully.");
    }

    // 2. API: Get all student plans for a user
    @GetMapping("/all")
    public ResponseEntity<List<StudentPlan>> getAllStudentPlans(HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        List<StudentPlan> plans = studentPlanService.getAllStudentPlans(userId);
        return ResponseEntity.ok(plans);
    }

    // 3. API: Delete all student plans for a user
    @DeleteMapping("/delete-all")
    public ResponseEntity<String> deleteAllStudentPlans(HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("You must be logged in to delete plans.");
        }

        studentPlanService.deleteAllStudentPlans(userId);
        return ResponseEntity.ok("All student plans deleted successfully.");
    }
}
