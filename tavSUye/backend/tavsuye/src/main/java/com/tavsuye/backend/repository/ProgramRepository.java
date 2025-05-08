package com.tavsuye.backend.repository;

import com.tavsuye.backend.entity.Program;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProgramRepository extends JpaRepository<Program, Integer> {
    Optional<Program> findByNameEnAndAdmissionTerm(String nameEn, Integer admissionTerm);
}
