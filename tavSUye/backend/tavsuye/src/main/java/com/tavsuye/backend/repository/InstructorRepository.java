package com.tavsuye.backend.repository;

import com.tavsuye.backend.entity.Instructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface InstructorRepository extends JpaRepository<Instructor, Integer> {

    @Query("SELECT i.instructorId, i.name, i.surname FROM Instructor i")
    List<Object[]> findAllInstructors();
}
