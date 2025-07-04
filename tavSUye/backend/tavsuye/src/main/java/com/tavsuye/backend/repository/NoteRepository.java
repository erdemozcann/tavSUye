package com.tavsuye.backend.repository;

import com.tavsuye.backend.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Integer> {

    List<Note> findByCourse_CourseId(Integer courseId);
}
