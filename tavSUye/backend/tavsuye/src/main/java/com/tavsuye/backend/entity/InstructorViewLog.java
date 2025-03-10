package com.tavsuye.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/*
 * JPA entity representation of the "InstructorViewLog" table.
 * This class logs when a user views an instructor's profile, including metadata such as IP address and user agent.
 */

@Entity
@Table(name = "InstructorViewLog")
public class InstructorViewLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "view_id")
    private Integer viewId;

    // The user who viewed the instructor.
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // The instructor that was viewed.
    @ManyToOne
    @JoinColumn(name = "instructor_id", nullable = false)
    private Instructor instructor;

	// The timestamp of when the instructor was viewed.
    @Column(name = "viewed_at", nullable = false)
    private LocalDateTime viewedAt = LocalDateTime.now();

    // The IP address from which the instructor was viewed.
    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    // The user agent of the browser or device used to view the instructor.
    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    // JPA requires a no-argument constructor
    public InstructorViewLog() {
    }

    // --------------------- GETTERS AND SETTERS ---------------------

    public Integer getViewId() {
        return viewId;
    }

    public void setViewId(Integer viewId) {
        this.viewId = viewId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Instructor getInstructor() {
        return instructor;
    }

    public void setInstructor(Instructor instructor) {
        this.instructor = instructor;
    }

    public LocalDateTime getViewedAt() {
        return viewedAt;
    }

    public void setViewedAt(LocalDateTime viewedAt) {
        this.viewedAt = viewedAt;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }
}
