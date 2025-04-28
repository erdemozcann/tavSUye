package com.tavsuye.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "User")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "surname", nullable = false)
    private String surname;

    @Column(name = "username", unique = true, nullable = false)
    private String username;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "hashed_password", length = 128, nullable = false)
    private String hashedPassword;

    @Column(name = "salt", length = 64, nullable = false)
    private String salt;

    @Column(name = "role", nullable = false)
    private String role;

    @Column(name = "major")
    private String major;

    @Column(name = "minor")
    private String minor;

    @Column(name = "second_major")
    private String secondMajor;

    @Column(name = "start_term")
    private Integer startTerm;

    @Column(name = "graduation_term")
    private Integer graduationTerm;

    @Enumerated(EnumType.STRING)
    @Column(
        name = "account_status",
        nullable = false,
        columnDefinition = "ENUM('ACTIVE','INACTIVE','BANNED','PENDING','SUSPENDED','DELETED') DEFAULT 'PENDING'"
    )
    private AccountStatus accountStatus = AccountStatus.PENDING;

    @Column(name = "is_2fa_enabled")
    private Boolean is2faEnabled = false;

    @Column(name = "email_verification_code", length = 6)
    private String emailVerificationCode;

    @Column(name = "email_verification_expires")
    private LocalDateTime emailVerificationExpires;

    @Column(name = "email_verified")
    private Boolean emailVerified = false;

    @Column(name = "password_reset_token", length = 64)
    private String passwordResetToken;

    @Column(name = "password_reset_expires")
    private LocalDateTime passwordResetExpires;

    @Column(name = "password_reset_used")
    private Boolean passwordResetUsed = false;

    @Column(name = "failed_login_attempts")
    private Integer failedLoginAttempts = 0;

    @Column(name = "last_failed_attempt")
    private LocalDateTime lastFailedAttempt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    // No-arg constructor
    public User() {
    }

    // --------------------- GETTERS AND SETTERS ---------------------

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSurname() {
        return surname;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getHashedPassword() {
        return hashedPassword;
    }

    public void setHashedPassword(String hashedPassword) {
        this.hashedPassword = hashedPassword;
    }

    public String getSalt() {
        return salt;
    }

    public void setSalt(String salt) {
        this.salt = salt;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getMajor() {
        return major;
    }

    public void setMajor(String major) {
        this.major = major;
    }

    public String getMinor() {
        return minor;
    }

    public void setMinor(String minor) {
        this.minor = minor;
    }

    public String getSecondMajor() {
        return secondMajor;
    }

    public void setSecondMajor(String secondMajor) {
        this.secondMajor = secondMajor;
    }

    public Integer getStartTerm() {
        return startTerm;
    }

    public void setStartTerm(Integer startTerm) {
        this.startTerm = startTerm;
    }

    public Integer getGraduationTerm() {
        return graduationTerm;
    }

    public void setGraduationTerm(Integer graduationTerm) {
        this.graduationTerm = graduationTerm;
    }

    public AccountStatus getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(AccountStatus accountStatus) {
        this.accountStatus = accountStatus;
    }

    public Boolean getIs2faEnabled() {
        return is2faEnabled;
    }

    public void setIs2faEnabled(Boolean is2faEnabled) {
        this.is2faEnabled = is2faEnabled;
    }

    public String getEmailVerificationCode() {
        return emailVerificationCode;
    }

    public void setEmailVerificationCode(String emailVerificationCode) {
        this.emailVerificationCode = emailVerificationCode;
    }

    public LocalDateTime getEmailVerificationExpires() {
        return emailVerificationExpires;
    }

    public void setEmailVerificationExpires(LocalDateTime emailVerificationExpires) {
        this.emailVerificationExpires = emailVerificationExpires;
    }

    public Boolean getEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(Boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public String getPasswordResetToken() {
        return passwordResetToken;
    }

    public void setPasswordResetToken(String passwordResetToken) {
        this.passwordResetToken = passwordResetToken;
    }

    public LocalDateTime getPasswordResetExpires() {
        return passwordResetExpires;
    }

    public void setPasswordResetExpires(LocalDateTime passwordResetExpires) {
        this.passwordResetExpires = passwordResetExpires;
    }

    public Boolean getPasswordResetUsed() {
        return passwordResetUsed;
    }

    public void setPasswordResetUsed(Boolean passwordResetUsed) {
        this.passwordResetUsed = passwordResetUsed;
    }

    public Integer getFailedLoginAttempts() {
        return failedLoginAttempts;
    }

    public void setFailedLoginAttempts(Integer failedLoginAttempts) {
        this.failedLoginAttempts = failedLoginAttempts;
    }

    public LocalDateTime getLastFailedAttempt() {
        return lastFailedAttempt;
    }

    public void setLastFailedAttempt(LocalDateTime lastFailedAttempt) {
        this.lastFailedAttempt = lastFailedAttempt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    // --------------------- NESTED ENUM FOR ACCOUNT STATUS ---------------------

    public enum AccountStatus {
        ACTIVE,
        INACTIVE,
        BANNED,
        PENDING,
        SUSPENDED,
        DELETED
    }
}
