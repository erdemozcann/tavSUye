package com.tavsuye.backend.service;

import com.tavsuye.backend.entity.Course;
import com.tavsuye.backend.entity.Note;
import com.tavsuye.backend.repository.CourseRepository;
import com.tavsuye.backend.repository.NoteRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NoteService {

    private final NoteRepository noteRepository;
    private final CourseRepository courseRepository;

    public NoteService(NoteRepository noteRepository, CourseRepository courseRepository) {
        this.noteRepository = noteRepository;
        this.courseRepository = courseRepository;
    }

    public List<Note> getNotesByCourse(Integer courseId) {
        return noteRepository.findByCourse_CourseId(courseId);
    }

    public void addNote(Integer courseId, Note note) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        note.setCourse(course);
        note.setCreatedAt(LocalDateTime.now());
        noteRepository.save(note);
    }

    public void editNote(Integer noteId, Note updatedNote, Integer userId) {
        Note existingNote = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        if (!existingNote.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("You are not authorized to edit this note.");
        }

        existingNote.setDescription(updatedNote.getDescription());
        existingNote.setCloudLink(updatedNote.getCloudLink());
        noteRepository.save(existingNote);
    }

    public void deleteNote(Integer noteId, Integer userId, boolean isAdmin) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        if (!isAdmin && !note.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("You are not authorized to delete this note.");
        }

        noteRepository.delete(note);
    }
}
