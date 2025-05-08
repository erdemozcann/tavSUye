package com.tavsuye.backend.controller;

import com.tavsuye.backend.service.PrerequisiteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prerequisites")
public class PrerequisiteController {

    private final PrerequisiteService prerequisiteService;

    public PrerequisiteController(PrerequisiteService prerequisiteService) {
        this.prerequisiteService = prerequisiteService;
    }

    // API: Get prerequisites by course ID
    @GetMapping("/{courseId}")
    public ResponseEntity<List<Map<String, Object>>> getPrerequisitesByCourseId(
            @PathVariable Integer courseId,
            HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        List<Map<String, Object>> prerequisites = prerequisiteService.getPrerequisitesByCourseId(courseId);
        return ResponseEntity.ok(prerequisites);
    }
}
