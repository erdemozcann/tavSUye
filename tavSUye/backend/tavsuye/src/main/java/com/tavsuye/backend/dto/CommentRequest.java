package com.tavsuye.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CommentRequest {
    
    @NotNull(message = "Course ID cannot be null")
    private Integer courseId;

    private Integer parentCommentId; // If it's a reply, otherwise null

    @NotBlank(message = "Comment content cannot be empty")
    private String content;

    private Integer termTaken; // Optional field
    private String gradeReceived; // Optional field

    private Boolean isAnonymous; // User chooses whether to stay anonymous

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

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
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

    public Boolean getIsAnonymous() {
        return isAnonymous;
    }

    public void setIsAnonymous(Boolean isAnonymous) {
        this.isAnonymous = isAnonymous;
    }
}
