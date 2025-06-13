package com.tavsuye.backend.dto;

import com.tavsuye.backend.entity.InstructorComment;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class InstructorCommentDTO {
    private Integer commentId;
    private Integer userId;
    private String username;
    private Integer instructorId;
    private Integer parentCommentId;
    private String content;
    private LocalDateTime createdAt;
    private Boolean anonymous;
    private Boolean deleted;

    // Default constructor
    public InstructorCommentDTO() {
    }

    // Constructor from InstructorComment entity, with current user check and admin flag
    public InstructorCommentDTO(InstructorComment comment, Integer currentUserId, boolean isAdmin) {
        this.commentId = comment.getCommentId();
        
        // Handle deleted comments first
        if (comment.getDeleted()) {
            // For deleted comments, hide user info
            this.userId = null;
            this.username = null;
        } else if (comment.getAnonymous()) {
            // Handle anonymous comments
            // If the comment is by the current user or user is admin, show their info even if anonymous
            if ((currentUserId != null && comment.getUser() != null && 
                currentUserId.equals(comment.getUser().getUserId())) || isAdmin) {
                this.userId = comment.getUser().getUserId();
                this.username = comment.getUser().getUsername();
            } else {
                // Otherwise hide user info for anonymous comments
                this.userId = null;
                this.username = null;
            }
        } else {
            // For non-anonymous and non-deleted comments, show user info
            this.userId = comment.getUser().getUserId();
            this.username = comment.getUser().getUsername();
        }
        
        this.instructorId = comment.getInstructor().getInstructorId();
        this.parentCommentId = comment.getParentCommentId();
        
        // For deleted comments, replace content with a message
        if (comment.getDeleted()) {
            this.content = "[Deleted Comment]";
        } else {
            this.content = comment.getContent();
        }
        
        this.createdAt = comment.getCreatedAt();
        this.anonymous = comment.getAnonymous();
        this.deleted = comment.getDeleted();
    }
    
    // Constructor from InstructorComment entity, with current user check (backward compatibility)
    public InstructorCommentDTO(InstructorComment comment, Integer currentUserId) {
        this(comment, currentUserId, false);
    }
    
    // Constructor without current user ID (for backward compatibility)
    public InstructorCommentDTO(InstructorComment comment) {
        this(comment, null);
    }

    // Convert list of entities to list of DTOs with current user check and admin flag
    public static List<InstructorCommentDTO> fromEntities(List<InstructorComment> comments, Integer currentUserId, boolean isAdmin) {
        return comments.stream()
                .map(comment -> new InstructorCommentDTO(comment, currentUserId, isAdmin))
                .collect(Collectors.toList());
    }
    
    // Convert list of entities to list of DTOs with current user check (backward compatibility)
    public static List<InstructorCommentDTO> fromEntities(List<InstructorComment> comments, Integer currentUserId) {
        return fromEntities(comments, currentUserId, false);
    }
    
    // Convert list of entities to list of DTOs without current user check
    public static List<InstructorCommentDTO> fromEntities(List<InstructorComment> comments) {
        return fromEntities(comments, null, false);
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

    public Integer getInstructorId() {
        return instructorId;
    }

    public void setInstructorId(Integer instructorId) {
        this.instructorId = instructorId;
    }

    public Integer getParentCommentId() {
        return parentCommentId;
    }

    public void setParentCommentId(Integer parentCommentId) {
        this.parentCommentId = parentCommentId;
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