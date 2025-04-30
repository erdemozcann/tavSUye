package com.tavsuye.backend.service;

import com.tavsuye.backend.entity.Instructor;
import com.tavsuye.backend.repository.InstructorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InstructorService {

    private final InstructorRepository instructorRepository;

    public InstructorService(InstructorRepository instructorRepository) {
        this.instructorRepository = instructorRepository;
    }

    // Get all instructors' names and IDs
    public List<Object[]> getAllInstructors() {
        return instructorRepository.findAllInstructors();
    }

    // Get full details of an instructor by ID
    public Instructor getInstructorById(Integer id) {
        return instructorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Instructor not found with ID: " + id));
    }
}
