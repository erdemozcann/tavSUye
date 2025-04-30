package com.tavsuye.backend.controller;

import com.tavsuye.backend.entity.Note;
import com.tavsuye.backend.entity.User;
import com.tavsuye.backend.service.NoteService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    // 1. API: Get all notes for a course
    @GetMapping("/{courseId}")
    public ResponseEntity<List<Note>> getNotesByCourse(@PathVariable Integer courseId, HttpSession session) {
        // Session control
        if (session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null); // Unauthorized
        }

        List<Note> notes = noteService.getNotesByCourse(courseId);
        return ResponseEntity.ok(notes);
    }

    // 2. API: Add a note
    @PostMapping("/{courseId}")
    public ResponseEntity<String> addNote(
            @PathVariable Integer courseId,
            @RequestBody Note note,
            HttpSession session) {
        // Session control
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("You must be logged in to add a note.");
        }

        User user = new User();
        user.setUserId(userId); // Associate only with userId
        note.setUser(user);

        noteService.addNote(courseId, note);
        return ResponseEntity.ok("Note added successfully.");
    }

    // 3. API: Edit a note
    @PutMapping("/{noteId}")
    public ResponseEntity<String> editNote(
            @PathVariable Integer noteId,
            @RequestBody Note updatedNote,
            HttpSession session) {
        // Session control
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("You must be logged in to edit a note.");
        }

        noteService.editNote(noteId, updatedNote, userId);
        return ResponseEntity.ok("Note updated successfully.");
    }

    // 4. API: Delete a note
    @DeleteMapping("/{noteId}")
    public ResponseEntity<String> deleteNote(
            @PathVariable Integer noteId,
            HttpSession session) {
        // Session control
        Integer userId = (Integer) session.getAttribute("userId");
        Boolean isAdmin = (Boolean) session.getAttribute("isAdmin");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("You must be logged in to delete a note.");
        }

        // Admin control or user authorization
        noteService.deleteNote(noteId, userId, isAdmin != null && isAdmin);
        return ResponseEntity.ok("Note deleted successfully.");
    }
}
