package com.tavsuye.backend.controller;

import com.tavsuye.backend.entity.Instructor;
import com.tavsuye.backend.service.InstructorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<List<Map<String, Object>>> getAllInstructors() {
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
    public ResponseEntity<Instructor> getInstructorById(@PathVariable Integer id) {
        Instructor instructor = instructorService.getInstructorById(id);
        return ResponseEntity.ok(instructor);
    }
}
