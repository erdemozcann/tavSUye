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

    // Add a new instructor
    public void addInstructor(Instructor instructor) {
        instructorRepository.save(instructor);
    }

    // Update an instructor
    public void updateInstructor(Integer id, Instructor updatedInstructor) {
        Instructor existingInstructor = instructorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Instructor not found with ID: " + id));

        // Update fields
        if (updatedInstructor.getName() != null) {
            existingInstructor.setName(updatedInstructor.getName());
        }
        if (updatedInstructor.getSurname() != null) {
            existingInstructor.setSurname(updatedInstructor.getSurname());
        }
        if (updatedInstructor.getDepartment() != null) {
            existingInstructor.setDepartment(updatedInstructor.getDepartment());
        }
        if (updatedInstructor.getImageUrl() != null) {
            existingInstructor.setImageUrl(updatedInstructor.getImageUrl());
        }
        if (updatedInstructor.getAboutTr() != null) {
            existingInstructor.setAboutTr(updatedInstructor.getAboutTr());
        }
        if (updatedInstructor.getAboutEn() != null) {
            existingInstructor.setAboutEn(updatedInstructor.getAboutEn());
        }
        if (updatedInstructor.getLinkTr() != null) {
            existingInstructor.setLinkTr(updatedInstructor.getLinkTr());
        }
        if (updatedInstructor.getLinkEn() != null) {
            existingInstructor.setLinkEn(updatedInstructor.getLinkEn());
        }

        // Save the updated instructor
        instructorRepository.save(existingInstructor);
    }
}
