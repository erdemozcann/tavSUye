package com.tavsuye.backend.dto;

public class UserRatingResponse {
    private Integer commentId;
    private Boolean liked;

    public UserRatingResponse(Integer commentId, Boolean liked) {
        this.commentId = commentId;
        this.liked = liked;
    }

    public Integer getCommentId() {
        return commentId;
    }

    public void setCommentId(Integer commentId) {
        this.commentId = commentId;
    }

    public Boolean getLiked() {
        return liked;
    }

    public void setLiked(Boolean liked) {
        this.liked = liked;
    }
}