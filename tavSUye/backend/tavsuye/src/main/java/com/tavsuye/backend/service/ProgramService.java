package com.tavsuye.backend.service;

import com.tavsuye.backend.entity.Program;
import com.tavsuye.backend.repository.ProgramRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProgramService {

    private final ProgramRepository programRepository;

    public ProgramService(ProgramRepository programRepository) {
        this.programRepository = programRepository;
    }

    // Get all unique program names
    public List<Map<String, String>> getUniqueProgramNames() {
        List<Program> programs = programRepository.findAll();

        // Filter unique name_en values and map them to name_tr
        Map<String, String> uniquePrograms = programs.stream()
                .collect(Collectors.toMap(
                        Program::getNameEn,
                        Program::getNameTr,
                        (existing, replacement) -> existing // Keep the first occurrence
                ));

        // Convert to a list of maps
        return uniquePrograms.entrySet().stream()
                .map(entry -> Map.of("name_en", entry.getKey(), "name_tr", entry.getValue()))
                .collect(Collectors.toList());
    }

    // Get program details by name and term
    public Program getProgramDetails(String nameEn, Integer admissionTerm) {
        return programRepository.findByNameEnAndAdmissionTerm(nameEn, admissionTerm)
                .orElseThrow(() -> new RuntimeException("Program not found with name: " + nameEn + " and admission term: " + admissionTerm));
    }
}
