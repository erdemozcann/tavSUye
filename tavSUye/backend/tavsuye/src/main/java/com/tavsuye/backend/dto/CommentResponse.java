package com.tavsuye.backend.dto;

import java.time.LocalDateTime;

public class CommentResponse {
    private int commentId;
    private String username;
    private String name;
    private String surname;
    private Integer parentCommentId;
    private int termTaken;
    private String gradeReceived;
    private String content;
    private LocalDateTime createdAt;
    private boolean isAnonymous;
    private int likes;
    private int dislikes;

    public CommentResponse(int commentId, String username, String name, String surname, Integer parentCommentId, 
                           int termTaken, String gradeReceived, String content, LocalDateTime createdAt, 
                           boolean isAnonymous, int likes, int dislikes) {
        this.commentId = commentId;
        this.username = username;
        this.name = name;
        this.surname = surname;
        this.parentCommentId = parentCommentId;
        this.termTaken = termTaken;
        this.gradeReceived = gradeReceived;
        this.content = content;
        this.createdAt = createdAt;
        this.isAnonymous = isAnonymous;
        this.likes = likes;
        this.dislikes = dislikes;
    }

    public int getCommentId() { return commentId; }
    public String getUsername() { return username; }
    public String getName() { return name; }
    public String getSurname() { return surname; }
    public Integer getParentCommentId() { return parentCommentId; }
    public int getTermTaken() { return termTaken; }
    public String getGradeReceived() { return gradeReceived; }
    public String getContent() { return content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public boolean isAnonymous() { return isAnonymous; }
    public int getLikes() { return likes; }
    public int getDislikes() { return dislikes; }
}
