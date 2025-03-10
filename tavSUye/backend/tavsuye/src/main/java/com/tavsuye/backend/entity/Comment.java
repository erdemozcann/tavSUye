package com.tavsuye.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * JPA entity representation of the "Comment" table.
 * This class allows users to post comments, optionally about a course or an instructor.
 * A comment can also be a reply to another comment.
 */
@Entity
@Table(name = "Comment")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Integer commentId;

    /**
     * The user who posted this comment.
     */
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * The course that this comment references (if any).
     * Can be null if the comment is about an instructor or not related to a course.
     */
    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

    /**
     * The instructor that this comment references (if any).
     * Can be null if the comment is about a course or not related to an instructor.
     */
    @ManyToOne
    @JoinColumn(name = "instructor_id")
    private Instructor instructor;

    /**
     * If this is a reply to another comment, the parent comment is stored here.
     * Otherwise, it can be null for a top-level comment.
     */
    @ManyToOne
    @JoinColumn(name = "parent_comment_id")
    private Comment parentComment;

    /**
     * The term when the course was taken, if this comment is about a specific course.
     * For example, 202401 or 202402. Can be null if not applicable.
     */
    @Column(name = "term_taken")
    private Integer termTaken;

    /**
     * The grade the user received for the course (e.g., A, B, C),
     * if this is a comment about a course. Can be null.
     */
    @Column(name = "grade_received", length = 10)
    private String gradeReceived;

    /**
     * The main text content of the comment.
     */
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    /**
     * Timestamp of when the comment was created.
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Whether this comment is posted anonymously.
     */
    @Column(name = "is_anonymous", nullable = false)
    private Boolean isAnonymous;

    /**
     * For soft deletion, indicating whether the comment is considered "deleted".
     */
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    // JPA requires a no-argument constructor
    public Comment() {
    }

    // --------------------- GETTERS AND SETTERS ---------------------

    public Integer getCommentId() {
        return commentId;
    }

    public void setCommentId(Integer commentId) {
        this.commentId = commentId;
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

    public Instructor getInstructor() {
        return instructor;
    }

    public void setInstructor(Instructor instructor) {
        this.instructor = instructor;
    }

    public Comment getParentComment() {
        return parentComment;
    }

    public void setParentComment(Comment parentComment) {
        this.parentComment = parentComment;
    }

    public Integer getTermTaken() {
        return termTaken;
    }

    public void setTermTaken(Integer termTaken) {
        this.termTaken = termTaken;
    }

    public String getGradeReceived() {
        return gradeReceived;
    }

    public void setGradeReceived(String gradeReceived) {
        this.gradeReceived = gradeReceived;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Boolean getIsAnonymous() {
        return isAnonymous;
    }

    public void setIsAnonymous(Boolean isAnonymous) {
        this.isAnonymous = isAnonymous;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }
}
