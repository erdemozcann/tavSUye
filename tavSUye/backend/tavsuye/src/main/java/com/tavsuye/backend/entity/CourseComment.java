package com.tavsuye.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "CourseComment")
public class CourseComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Integer commentId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne
    @JoinColumn(name = "parent_comment_id")
    private CourseComment parentComment;

    @Column(name = "term_taken")
    private Integer termTaken;

    @Column(name = "grade_received", length = 10)
    private String gradeReceived;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "is_anonymous", nullable = false)
    private Boolean anonymous;

    @Column(name = "is_deleted", nullable = false)
    private Boolean deleted = false;

    // No-arg constructor
    public CourseComment() {
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

    public CourseComment getParentComment() {
        return parentComment;
    }

    public void setParentComment(CourseComment parentComment) {
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

    public Boolean getAnonymous() {
        return anonymous;
    }

    public void setAnonymous(Boolean anonymous) {
        this.anonymous = anonymous;
    }

    public Boolean getDeleted() {
        return deleted;
    }

    public void setDeleted(Boolean deleted) {
        this.deleted = deleted;
    }

    public Integer getParentCommentId() {
        return parentComment != null ? parentComment.getCommentId() : null;
    }
}
