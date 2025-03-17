package com.tavsuye.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * JPA entity representation of the "Rating" table.
 * This class maps to the structure of the Rating table in the database,
 * indicating whether a user has liked or disliked a particular comment.
 */
@Entity
@Table(name = "Rating")
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rating_id")
    private Integer ratingId;

    /**
     * The user who created this rating.
     */
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * The comment that this rating is associated with.
     */
    @ManyToOne
    @JoinColumn(name = "comment_id", nullable = false)
    private Comment comment;

    /**
     * Indicates whether this rating is a "like" (true) or not (false).
     */
    @Column(name = "is_like", nullable = false)
    private Boolean liked;

    /**
     * The timestamp when this rating was created.
     * Defaults to the current timestamp in the database.
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // JPA requires a no-argument constructor
    public Rating() {
    }

    // --------------------- GETTERS AND SETTERS ---------------------

    public Integer getRatingId() {
        return ratingId;
    }

    public void setRatingId(Integer ratingId) {
        this.ratingId = ratingId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Comment getComment() {
        return comment;
    }

    public void setComment(Comment comment) {
        this.comment = comment;
    }

    public Boolean getLiked() {
        return liked;
    }

    public void setLiked(Boolean liked) {
        this.liked = liked;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
