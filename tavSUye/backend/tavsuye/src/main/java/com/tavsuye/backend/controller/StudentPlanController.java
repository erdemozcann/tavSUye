package com.tavsuye.backend.controller;

import com.tavsuye.backend.dto.StudentPlanDTO;
import com.tavsuye.backend.dto.SavePlanRequest;
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
            @RequestBody SavePlanRequest request,
            HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You must be logged in to save a plan.");
        }

        try {
            studentPlanService.saveStudentPlan(userId, request.getCourseId(), request.getTerm());
            return ResponseEntity.ok("Student plan saved successfully.");
        } catch (RuntimeException ex) {
            if (ex.getMessage().contains("User not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
            } else if (ex.getMessage().contains("Course not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
            }
        }
    }

    // 2. API: Get all student plans for a user
    @GetMapping("/all")
    public ResponseEntity<List<StudentPlanDTO>> getAllStudentPlans(HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        List<StudentPlan> plans = studentPlanService.getAllStudentPlans(userId);
        List<StudentPlanDTO> planDTOs = StudentPlanDTO.fromEntities(plans);
        return ResponseEntity.ok(planDTOs);
    }

    // 3. API: Delete all student plans for a user
    @DeleteMapping("/delete-all")
    public ResponseEntity<String> deleteAllStudentPlans(HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You must be logged in to delete plans.");
        }

        studentPlanService.deleteAllStudentPlans(userId);
        return ResponseEntity.ok("All student plans deleted successfully.");
    }
}
