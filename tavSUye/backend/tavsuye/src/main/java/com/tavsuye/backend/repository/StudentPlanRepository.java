package com.tavsuye.backend.repository;

import com.tavsuye.backend.entity.StudentPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentPlanRepository extends JpaRepository<StudentPlan, Integer> {
    List<StudentPlan> findByUser_UserId(Integer userId);
}
