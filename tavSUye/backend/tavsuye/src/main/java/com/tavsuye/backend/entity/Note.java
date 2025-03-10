package com.tavsuye.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * JPA entity representation of the "Note" table.
 * This class maps to the structure of the Note table in the database,
 * allowing users to upload and share notes related to a course.
 */
@Entity
@Table(name = "Note")
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "note_id")
    private Integer noteId;

    /**
     * The user who uploaded this note.
     */
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * The course for which this note is relevant.
     */
    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    /**
     * The term when this note is relevant, for example 202401 or 202402.
     */
    @Column(name = "term_taken")
    private Integer termTaken;

    /**
     * The instructor who taught the course when the note was taken,
     * if applicable.
     */
    @Column(name = "instructor_taken")
    private String instructorTaken;

    /**
     * The timestamp of when the note was created.
     * Defaults to the current timestamp in the database.
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * A link to the note stored in a cloud storage system (e.g., Google Drive).
     */
    @Column(name = "cloud_link", nullable = false, columnDefinition = "TEXT")
    private String cloudLink;

    // JPA requires a no-argument constructor
    public Note() {
    }

    // --------------------- GETTERS AND SETTERS ---------------------

    public Integer getNoteId() {
        return noteId;
    }

    public void setNoteId(Integer noteId) {
        this.noteId = noteId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
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
