package com.tavsuye.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * JPA entity representation of the "UserLog" table.
 * This class tracks actions performed by a user, including details such as IP address and user agent.
 */
@Entity
@Table(name = "UserLog")
public class UserLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Integer logId;

    /**
     * The user who performed the action.
     */
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * The general type of action (e.g., LOGIN, PASSWORD_RESET, COMMENT_ADDED).
     */
    @Column(name = "action", nullable = false)
    private String action;

    /**
     * Additional details about the action (e.g., comment ID, ban reason, role change).
     */
    @Column(name = "action_details", columnDefinition = "TEXT")
    private String actionDetails;

    /**
     * The IP address from which the action was performed.
     */
    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    /**
     * The user agent of the browser or device used to perform the action.
     */
    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    /**
     * The timestamp of when the action occurred.
     */
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    // JPA requires a no-argument constructor
    public UserLog() {
    }

    // --------------------- GETTERS AND SETTERS ---------------------

    public Integer getLogId() {
        return logId;
    }

    public void setLogId(Integer logId) {
        this.logId = logId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getActionDetails() {
        return actionDetails;
    }

    public void setActionDetails(String actionDetails) {
        this.actionDetails = actionDetails;
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

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
