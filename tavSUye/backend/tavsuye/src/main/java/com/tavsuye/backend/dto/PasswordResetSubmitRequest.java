package com.tavsuye.backend.dto;

public class PasswordResetSubmitRequest {
    private String code; 
    private String newPassword;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
