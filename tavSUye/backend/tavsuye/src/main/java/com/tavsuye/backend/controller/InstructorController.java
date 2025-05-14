package com.tavsuye.backend.controller;

import com.tavsuye.backend.entity.Instructor;
import com.tavsuye.backend.service.InstructorService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/instructors")
public class InstructorController {

    private final InstructorService instructorService;

    public InstructorController(InstructorService instructorService) {
        this.instructorService = instructorService;
    }

    // 1. API: Get all instructors' names and IDs
    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllInstructors(HttpSession session) {
        // Check if the user is logged in
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        List<Map<String, Object>> instructors = instructorService.getAllInstructors().stream()
                .map(obj -> Map.of(
                        "id", obj[0],
                        "name", obj[1],
                        "surname", obj[2]
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(instructors);
    }

    // 2. API: Get full details of an instructor by ID
    @GetMapping("/{id}")
    public ResponseEntity<Object> getInstructorById(@PathVariable Integer id, HttpSession session) {
        // Check if the user is logged in
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        try {
            Instructor instructor = instructorService.getInstructorById(id);
            return ResponseEntity.ok(instructor);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Instructor not found.");
        }
    }

    // API: Add a new instructor (Admin only)
    @PostMapping("/add")
    public ResponseEntity<String> addInstructor(@RequestBody Instructor instructor, HttpSession session) {
        // Session control
        String role = (String) session.getAttribute("role");
        if (role == null || !role.equals("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not authorized to add an instructor.");
        }

        // Save the instructor
        instructorService.addInstructor(instructor);
        return ResponseEntity.ok("Instructor added successfully.");
    }

    // API: Update an instructor (Admin only)
    @PutMapping("/{id}")
    public ResponseEntity<String> updateInstructor(
            @PathVariable Integer id,
            @RequestBody Instructor updatedInstructor,
            HttpSession session) {
        // Session control
        String role = (String) session.getAttribute("role");
        if (role == null || !role.equals("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not authorized to update an instructor.");
        }

        // Update the instructor
        try {
            instructorService.updateInstructor(id, updatedInstructor);
            return ResponseEntity.ok("Instructor updated successfully.");
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Instructor not found.");
        }
    }
}
