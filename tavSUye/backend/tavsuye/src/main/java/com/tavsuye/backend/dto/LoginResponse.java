package com.tavsuye.backend.dto;

public class LoginResponse {
    private String message;
    private boolean twoFactorRequired;
    private String role;

    public LoginResponse(String message, boolean twoFactorRequired, String role) {
        this.message = message;
        this.twoFactorRequired = twoFactorRequired;
        this.role = role;
    }

    public String getMessage() {
        return message;
    }

    public boolean isTwoFactorRequired() {
        return twoFactorRequired;
    }

    public String getRole() {
        return role;
    }
}
