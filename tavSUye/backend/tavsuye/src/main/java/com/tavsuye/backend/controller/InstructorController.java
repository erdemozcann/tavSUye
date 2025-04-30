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
    public ResponseEntity<Instructor> getInstructorById(@PathVariable Integer id, HttpSession session) {
        // Check if the user is logged in
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        Instructor instructor = instructorService.getInstructorById(id);
        return ResponseEntity.ok(instructor);
    }
}
