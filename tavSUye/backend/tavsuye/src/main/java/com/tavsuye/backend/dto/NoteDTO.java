package com.tavsuye.backend.dto;

import java.time.LocalDateTime;

public class NoteDTO {
    private Integer noteId;
    private UserSummaryDTO user;
    private CourseSummaryDTO course;
    private Integer termTaken;
    private String instructorTaken;
    private String description;
    private LocalDateTime createdAt;
    private String cloudLink;

    // No-args constructor
    public NoteDTO() {
    }

    // Getters and Setters
    public Integer getNoteId() {
        return noteId;
    }

    public void setNoteId(Integer noteId) {
        this.noteId = noteId;
    }

    public UserSummaryDTO getUser() {
        return user;
    }

    public void setUser(UserSummaryDTO user) {
        this.user = user;
    }

    public CourseSummaryDTO getCourse() {
        return course;
    }

    public void setCourse(CourseSummaryDTO course) {
        this.course = course;
    }

    public Integer getTermTaken() {
        return termTaken;
    }

    public void setTermTaken(Integer termTaken) {
        this.termTaken = termTaken;
    }

    public String getInstructorTaken() {
        return instructorTaken;
    }

    public void setInstructorTaken(String instructorTaken) {
        this.instructorTaken = instructorTaken;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getCloudLink() {
        return cloudLink;
    }

    public void setCloudLink(String cloudLink) {
        this.cloudLink = cloudLink;
    }
} 