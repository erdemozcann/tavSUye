package com.tavsuye.backend.controller;

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
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        List<Map<String, String>> uniqueProgramNames = programService.getUniqueProgramNames();
        return ResponseEntity.ok(uniqueProgramNames);
    }
}
