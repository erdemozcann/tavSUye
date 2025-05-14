package com.tavsuye.backend.mapper;

import com.tavsuye.backend.dto.CourseSummaryDTO;
import com.tavsuye.backend.dto.NoteDTO;
import com.tavsuye.backend.dto.UserSummaryDTO;
import com.tavsuye.backend.entity.Note;

import java.util.List;
import java.util.stream.Collectors;

public class NoteMapper {

    /**
     * Convert a Note entity to NoteDTO with limited user and course info
     */
    public static NoteDTO toDTO(Note note) {
        if (note == null) {
            return null;
        }

        NoteDTO dto = new NoteDTO();
        dto.setNoteId(note.getNoteId());
        
        // Set limited user info
        if (note.getUser() != null) {
            UserSummaryDTO userDto = new UserSummaryDTO(
                note.getUser().getUserId(),
                note.getUser().getUsername()
            );
            dto.setUser(userDto);
        }
        
        // Set limited course info
        if (note.getCourse() != null) {
            CourseSummaryDTO courseDto = new CourseSummaryDTO(
                note.getCourse().getCourseId(),
                note.getCourse().getSubject(),
                note.getCourse().getCourseCode()
            );
            dto.setCourse(courseDto);
        }
        
        dto.setTermTaken(note.getTermTaken());
        dto.setInstructorTaken(note.getInstructorTaken());
        dto.setDescription(note.getDescription());
        dto.setCreatedAt(note.getCreatedAt());
        dto.setCloudLink(note.getCloudLink());
        
        return dto;
    }

    /**
     * Convert a list of Note entities to NoteDTO list
     */
    public static List<NoteDTO> toDTOList(List<Note> notes) {
        return notes.stream()
                .map(NoteMapper::toDTO)
                .collect(Collectors.toList());
    }
} 