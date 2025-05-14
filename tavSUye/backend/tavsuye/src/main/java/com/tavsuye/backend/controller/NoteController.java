package com.tavsuye.backend.controller;

import com.tavsuye.backend.dto.NoteDTO;
import com.tavsuye.backend.entity.Note;
import com.tavsuye.backend.entity.User;
import com.tavsuye.backend.mapper.NoteMapper;
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
    public ResponseEntity<List<NoteDTO>> getNotesByCourse(@PathVariable Integer courseId, HttpSession session) {
        // Session control
        if (session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null); // Forbidden
        }

        List<Note> notes = noteService.getNotesByCourse(courseId);
        List<NoteDTO> noteDTOs = NoteMapper.toDTOList(notes);
        return ResponseEntity.ok(noteDTOs);
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
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You must be logged in to add a note.");
        }

        User user = new User();
        user.setUserId(userId); // Associate only with userId
        note.setUser(user);

        try {
            noteService.addNote(courseId, note);
            return ResponseEntity.ok("Note added successfully.");
        } catch (RuntimeException ex) {
            if (ex.getMessage().contains("Course not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Course not found.");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
            }
        }
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
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You must be logged in to edit a note.");
        }

        try {
            noteService.editNote(noteId, updatedNote, userId);
            return ResponseEntity.ok("Note updated successfully.");
        } catch (RuntimeException ex) {
            if (ex.getMessage().contains("Note not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Note not found.");
            } else if (ex.getMessage().contains("not authorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not authorized to edit this note.");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
            }
        }
    }

    // 4. API: Delete a note
    @DeleteMapping("/{noteId}")
    public ResponseEntity<String> deleteNote(
            @PathVariable Integer noteId,
            HttpSession session) {
        // Session control
        Integer userId = (Integer) session.getAttribute("userId");
        String role = (String) session.getAttribute("role");
        boolean isAdmin = role != null && role.equals("ADMIN");
        
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You must be logged in to delete a note.");
        }

        try {
            // Admin control or user authorization
            noteService.deleteNote(noteId, userId, isAdmin);
            return ResponseEntity.ok("Note deleted successfully.");
        } catch (RuntimeException ex) {
            if (ex.getMessage().contains("Note not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Note not found.");
            } else if (ex.getMessage().contains("not authorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not authorized to delete this note.");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
            }
        }
    }
}
