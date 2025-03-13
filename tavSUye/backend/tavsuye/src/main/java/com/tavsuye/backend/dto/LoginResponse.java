package com.tavsuye.backend.dto;

public class LoginResponse {
    private String message;
    private boolean twoFactorRequired;

    public LoginResponse(String message, boolean twoFactorRequired) {
        this.message = message;
        this.twoFactorRequired = twoFactorRequired;
    }

    public String getMessage() {
        return message;
    }

    public boolean isTwoFactorRequired() {
        return twoFactorRequired;
    }
}
