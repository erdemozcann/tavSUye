package com.tavsuye.backend.dto;

import com.tavsuye.backend.entity.CourseComment;
import java.time.LocalDateTime;

public class CourseCommentResponseDto {
    private Integer commentId;
    private Integer userId;
    private String username;
    private Integer courseId;
    private Integer parentCommentId;
    private Integer termTaken;
    private String gradeReceived;
    private String content;
    private LocalDateTime createdAt;
    private Boolean anonymous;
    private Boolean deleted;

    // Static factory method to create DTO from entity
    public static CourseCommentResponseDto fromEntity(CourseComment comment, Integer requestUserId) {
        CourseCommentResponseDto dto = new CourseCommentResponseDto();
        dto.setCommentId(comment.getCommentId());
        dto.setCourseId(comment.getCourse().getCourseId());
        dto.setParentCommentId(comment.getParentCommentId());
        dto.setDeleted(comment.getDeleted());
        
        // For deleted comments, only return minimal information
        if (comment.getDeleted()) {
            dto.setContent("[Deleted Comment]");
            dto.setCreatedAt(comment.getCreatedAt());
            dto.setAnonymous(false);
            
            // Never show user information for deleted comments
            dto.setUserId(null);
            dto.setUsername(null);
            
            return dto;
        }
        
        // For non-deleted comments, proceed as before
        dto.setTermTaken(comment.getTermTaken());
        dto.setGradeReceived(comment.getGradeReceived());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setAnonymous(comment.getAnonymous());
        
        // User info handling based on anonymity
        if (!comment.getAnonymous()) {
            // Not anonymous - return username and userId
            dto.setUserId(comment.getUser().getUserId());
            dto.setUsername(comment.getUser().getUsername());
        } else {
            // Anonymous - check if requester is the author
            if (requestUserId != null && requestUserId.equals(comment.getUser().getUserId())) {
                dto.setUserId(comment.getUser().getUserId());
                dto.setUsername(comment.getUser().getUsername());
            } else {
                // For other users viewing an anonymous comment
                dto.setUserId(null);
                dto.setUsername(null);
            }
        }
        
        return dto;
    }

    // Getters and setters
    public Integer getCommentId() {
        return commentId;
    }

    public void setCommentId(Integer commentId) {
        this.commentId = commentId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Integer getCourseId() {
        return courseId;
    }

    public void setCourseId(Integer courseId) {
        this.courseId = courseId;
    }

    public Integer getParentCommentId() {
        return parentCommentId;
    }

    public void setParentCommentId(Integer parentCommentId) {
        this.parentCommentId = parentCommentId;
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
} 