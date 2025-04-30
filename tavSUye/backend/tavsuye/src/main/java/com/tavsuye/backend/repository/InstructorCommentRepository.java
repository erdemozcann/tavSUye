package com.tavsuye.backend.repository;

import com.tavsuye.backend.entity.InstructorComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InstructorCommentRepository extends JpaRepository<InstructorComment, Integer> {

    List<InstructorComment> findByInstructor_InstructorIdAndDeletedFalse(Integer instructorId);
}
