package com.tavsuye.backend.controller;

import com.tavsuye.backend.entity.Program;
import com.tavsuye.backend.service.ProgramService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/programs")
public class ProgramController {

    private final ProgramService programService;

    public ProgramController(ProgramService programService) {
        this.programService = programService;
    }

    // API: Get all unique program names
    @GetMapping("/unique-names")
    public ResponseEntity<List<Map<String, String>>> getUniqueProgramNames(HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        try {
            List<Map<String, String>> uniqueProgramNames = programService.getUniqueProgramNames();
            return ResponseEntity.ok(uniqueProgramNames);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(null);
        }
    }

    // API: Get program details by name and term
    @GetMapping("/details")
    public ResponseEntity<?> getProgramDetails(
            @RequestParam String nameEn,
            @RequestParam Integer admissionTerm,
            HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("You must be logged in to access this resource.");
        }

        try {
            Program program = programService.getProgramDetails(nameEn, admissionTerm);
            return ResponseEntity.ok(program);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while fetching program details: " + e.getMessage());
            }
        }
    }

    // API: Get courses by program ID
    @GetMapping("/{programId}/courses")
    public ResponseEntity<?> getCoursesByProgramId(
            @PathVariable Integer programId,
            HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("You must be logged in to access this resource.");
        }

        try {
            List<Map<String, String>> courses = programService.getCoursesByProgramId(programId);
            return ResponseEntity.ok(courses);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Program not found with ID: " + programId);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while fetching program courses: " + e.getMessage());
            }
        }
    }
}
