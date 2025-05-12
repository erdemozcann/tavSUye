package com.tavsuye.backend.service;

import com.tavsuye.backend.dto.LoginRequest;
import com.tavsuye.backend.dto.UserRegistrationRequest;
import com.tavsuye.backend.entity.User;
import com.tavsuye.backend.repository.UserRepository;
import com.tavsuye.backend.utils.EmailService;
import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private static final int MAX_FAILED_ATTEMPTS = 5; // Maximum failed login attempts

    public AuthService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    // Register a new user (Handles email verification expiration)
    public String registerUser(UserRegistrationRequest request) {
        String email = request.getEmail().toLowerCase();

        // Allow only Sabancı University domains
        if (!email.endsWith("@sabanciuniv.edu") &&
            !email.endsWith("@alumni.sabanciuniv.edu") &&
            !email.endsWith("@emeritus.sabanciuniv.edu")) {
            return "Only Sabancı University email addresses are allowed.";
        }

        Optional<User> existingUserByEmail = userRepository.findByEmail(request.getEmail().toLowerCase());
        Optional<User> existingUserByUsername = userRepository.findByUsername(request.getUsername());

        // If email is in use and not pending, reject registration
        if (existingUserByEmail.isPresent() && existingUserByEmail.get().getAccountStatus() != User.AccountStatus.PENDING) {
            return "Email is already registered.";
        }

        // If username is in use and not pending, reject registration
        if (existingUserByUsername.isPresent() && existingUserByUsername.get().getAccountStatus() != User.AccountStatus.PENDING) {
            return "Username is already taken.";
        }

        // If the user exists in PENDING status, check email verification expiration
        if (existingUserByEmail.isPresent()) {
            User user = existingUserByEmail.get();

            if (user.getEmailVerificationExpires().isBefore(LocalDateTime.now())) {
                userRepository.delete(user); // Delete old pending user and allow re-registration
            } else {
                return "User already exists. Please verify your email.";
            }
        }

        // Proceed with user registration
        byte[] saltBytes = new byte[32];
        new SecureRandom().nextBytes(saltBytes);
        String salt = Base64.getEncoder().encodeToString(saltBytes);

        Argon2 argon2 = Argon2Factory.create();
        String hashedPassword = argon2.hash(2, 65536, 1, (salt + request.getPassword()).toCharArray());

        String verificationCode = generateVerificationCode();

        User user = new User();
        user.setName(request.getFirstName());
        user.setSurname(request.getLastName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail().toLowerCase()); // Store email in lowercase
        user.setHashedPassword(hashedPassword);
        user.setSalt(salt);
        user.setAccountStatus(User.AccountStatus.PENDING);
        user.setEmailVerificationCode(verificationCode);
        user.setEmailVerificationExpires(LocalDateTime.now().plusMinutes(3));
        user.setRole("USER");

        userRepository.save(user);

        emailService.sendVerificationEmail(user.getEmail(), verificationCode);

        return "User registered successfully. Please verify your email.";
    }

    // User login process (Handles password attempts and 2FA support)
    public Optional<User> login(LoginRequest request) {
        Optional<User> userOptional = userRepository.findByEmailOrUsername(
            request.getUsernameOrEmail().toLowerCase(), request.getUsernameOrEmail()
        );

        if (userOptional.isEmpty()) {
            return Optional.empty();
        }

        User user = userOptional.get();

        // If the account is BANNED, prevent login and do not increase failed attempts
        if (user.getAccountStatus() == User.AccountStatus.BANNED) {
            return Optional.of(user); // Return user object so the controller can send a proper response
        }

        // If the account is SUSPENDED, prevent login and force email verification
        if (user.getAccountStatus() == User.AccountStatus.SUSPENDED) {
            LocalDateTime now = LocalDateTime.now();

            // If verification expired, send a new code
            if (user.getEmailVerificationExpires().isBefore(now)) {
                String verificationCode = generateVerificationCode();
                user.setEmailVerificationCode(verificationCode);
                user.setEmailVerificationExpires(now.plusMinutes(3)); // Code valid for 3 minutes
                emailService.sendVerificationEmail(user.getEmail(), verificationCode);
                userRepository.save(user);
            }

            return Optional.of(user);
        }

        // If the account is not ACTIVE, deny login
        if (user.getAccountStatus() != User.AccountStatus.ACTIVE) {
            return Optional.empty();
        }

        // Verify password using Argon2
        Argon2 argon2 = Argon2Factory.create();
        if (!argon2.verify(user.getHashedPassword(), (user.getSalt() + request.getPassword()).toCharArray())) {
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);

            // If the user fails 5 times, suspend the account
            if (user.getFailedLoginAttempts() >= MAX_FAILED_ATTEMPTS &&
                user.getAccountStatus() != User.AccountStatus.SUSPENDED) {

                user.setAccountStatus(User.AccountStatus.SUSPENDED);
                String verificationCode = generateVerificationCode();
                user.setEmailVerificationCode(verificationCode);
                user.setEmailVerificationExpires(LocalDateTime.now().plusMinutes(3)); // Code valid for 3 minutes
                emailService.sendVerificationEmail(user.getEmail(), verificationCode);
                userRepository.save(user);
            }

            userRepository.save(user);
            return Optional.empty();
        }

        // Successful login -> Reset failed attempts and update last login time
        user.setFailedLoginAttempts(0);
        user.setLastLogin(LocalDateTime.now());

        // If 2FA is enabled, send a new verification code
        if (Boolean.TRUE.equals(user.getIs2faEnabled())) {
            String verificationCode = generateVerificationCode();
            user.setEmailVerificationCode(verificationCode);
            user.setEmailVerificationExpires(LocalDateTime.now().plusMinutes(3));
            userRepository.save(user);
            emailService.sendVerificationEmail(user.getEmail(), verificationCode);
            return Optional.empty();
        }

        userRepository.save(user);
        return Optional.of(user);
    }

    // Email verification process
    public boolean verifyEmail(String email, String verificationCode) {
        Optional<User> userOptional = userRepository.findByEmail(email.toLowerCase());

        if (userOptional.isEmpty()) {
            return false;
        }

        User user = userOptional.get();

        // Check if the code matches and is not expired
        if (user.getEmailVerificationCode().equals(verificationCode) &&
            user.getEmailVerificationExpires().isAfter(LocalDateTime.now())) {

            user.setEmailVerified(true);

            // Activate the account if it was suspended
            if (user.getAccountStatus() == User.AccountStatus.SUSPENDED) {
                user.setAccountStatus(User.AccountStatus.ACTIVE);
                user.setFailedLoginAttempts(0); // Reset failed attempts
            } else {
                user.setAccountStatus(User.AccountStatus.ACTIVE);
            }

            // Clear the verification code and expiration
            user.setEmailVerificationCode(null);
            user.setEmailVerificationExpires(null);
            userRepository.save(user);
            return true;
        }

        return false;
    }

    // Verify 2FA Code
    public boolean verify2FA(String email, String verificationCode) {
        Optional<User> userOptional = userRepository.findByEmail(email.toLowerCase());

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            // Check if the 2FA code matches and is not expired
            if (user.getEmailVerificationCode().equals(verificationCode) &&
                user.getEmailVerificationExpires().isAfter(LocalDateTime.now())) {

                // Clear the verification code and expiration
                user.setEmailVerificationCode(null);
                user.setEmailVerificationExpires(null);
                userRepository.save(user);
                return true;
            }
        }
        return false;
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase());
    }

    // Send password reset email
    public boolean sendPasswordResetEmail(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email.toLowerCase());
        if (userOptional.isEmpty()) {
            return false;
        }

        User user = userOptional.get();

        // Check if an existing code is still valid
        if (user.getPasswordResetExpires() != null && user.getPasswordResetExpires().isAfter(LocalDateTime.now())) {
            throw new RuntimeException("A password reset code has already been sent. Please wait until the current code expires.");
        }

        // Generate a 6-digit reset code
        String resetCode = generateVerificationCode();
        user.setPasswordResetToken(resetCode); // Store the 6-digit code as the token
        user.setPasswordResetExpires(LocalDateTime.now().plusMinutes(3)); // Code valid for 3 minutes
        userRepository.save(user);

        // Send email with reset code
        emailService.sendPasswordResetEmail(user.getEmail(), resetCode);
        return true;
    }

    // Reset password
    public boolean resetPassword(String code, String newPassword) {
        Optional<User> userOptional = userRepository.findByPasswordResetToken(code);
        if (userOptional.isEmpty()) {
            return false;
        }

        User user = userOptional.get();

        // Check if the code is expired
        if (user.getPasswordResetExpires().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("The password reset code has expired.");
        }

        // Update the password
        user.setHashedPassword(hashPassword(newPassword, user.getSalt()));
        user.setPasswordResetToken(null); // Invalidate the code
        user.setPasswordResetExpires(null);
        userRepository.save(user);
        return true;
    }

    private String hashPassword(String password, String salt) {
        // Hash the password using Argon2 or any other hashing algorithm
        return password + salt; // Simplified for demonstration
    }

    // Generates a 6-digit verification code
    private String generateVerificationCode() {
        return String.format("%06d", new Random().nextInt(999999));
    }
}
