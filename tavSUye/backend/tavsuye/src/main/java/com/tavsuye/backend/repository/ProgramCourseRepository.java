package com.tavsuye.backend.repository;

import com.tavsuye.backend.entity.ProgramCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgramCourseRepository extends JpaRepository<ProgramCourse, Integer> {
    List<ProgramCourse> findByProgram_ProgramId(Integer programId);
}
