package com.tavsuye.backend.dto;

public class UserSummaryDTO {
    private Integer userId;
    private String username;

    // No-args constructor
    public UserSummaryDTO() {
    }

    // Constructor with fields
    public UserSummaryDTO(Integer userId, String username) {
        this.userId = userId;
        this.username = username;
    }

    // Getters and Setters
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
} 