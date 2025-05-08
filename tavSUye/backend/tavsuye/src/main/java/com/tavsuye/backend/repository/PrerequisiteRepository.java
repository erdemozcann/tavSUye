package com.tavsuye.backend.repository;

import com.tavsuye.backend.entity.Prerequisite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrerequisiteRepository extends JpaRepository<Prerequisite, Integer> {
    List<Prerequisite> findByCourse_CourseId(Integer courseId);
}
