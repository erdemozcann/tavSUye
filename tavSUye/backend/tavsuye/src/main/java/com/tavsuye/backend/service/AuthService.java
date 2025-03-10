package com.tavsuye.backend.service;

import com.tavsuye.backend.dto.LoginRequest;
import com.tavsuye.backend.dto.UserRegistrationRequest;
import com.tavsuye.backend.dto.VerificationRequest;
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

    public AuthService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    /**
     * Register a new user
     */
    public String registerUser(UserRegistrationRequest request) {
        // Generate a 32-byte salt
        byte[] saltBytes = new byte[32];
        new SecureRandom().nextBytes(saltBytes);
        String salt = Base64.getEncoder().encodeToString(saltBytes);

        // Hash password using Argon2
        Argon2 argon2 = Argon2Factory.create();
        String hashedPassword = argon2.hash(2, 65536, 1, (salt + request.getPassword()).toCharArray());

        // Generate 6-digit email verification code
        String verificationCode = String.format("%06d", new Random().nextInt(999999));

        User user = new User();
        user.setName(request.getFirstName());
        user.setSurname(request.getLastName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setHashedPassword(hashedPassword);
        user.setSalt(salt);
        user.setAccountStatus(User.AccountStatus.PENDING);
        user.setEmailVerificationCode(verificationCode);
        user.setEmailVerificationExpires(LocalDateTime.now().plusMinutes(3));
        user.setRole("USER");
        
        userRepository.save(user);

        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), verificationCode);

        return "User registered successfully. Please verify your email.";
    }

    /**
     * Login user with email/username and password
     */
    public String login(LoginRequest request) {
        Optional<User> userOptional = userRepository.findByEmailOrUsername(request.getUsernameOrEmail(), request.getUsernameOrEmail());

        if (userOptional.isEmpty()) {
            return "Invalid username or email";
        }

        User user = userOptional.get();

        // Verify password with stored salt
        Argon2 argon2 = Argon2Factory.create();
        if (!argon2.verify(user.getHashedPassword(), (user.getSalt() + request.getPassword()).toCharArray())) {
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
            userRepository.save(user);
            return "Incorrect password";
        }

        // Reset failed login attempts
        user.setFailedLoginAttempts(0);
        user.setLastLogin(LocalDateTime.now());

        // If 2FA is enabled, send verification code
        if (Boolean.TRUE.equals(user.getIs2faEnabled())) {
            String verificationCode = String.format("%06d", new Random().nextInt(999999));
            user.setEmailVerificationCode(verificationCode);
            user.setEmailVerificationExpires(LocalDateTime.now().plusMinutes(3));
            userRepository.save(user);
            emailService.sendVerificationEmail(user.getEmail(), verificationCode);
            return "2FA verification code sent";
        }

        userRepository.save(user);
        return "Login successful";
    }

    /**
     * Verify email with the provided verification code
     */
    public boolean verifyEmail(String email, String verificationCode) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        
        if (userOptional.isEmpty()) {
            return false;
        }

        User user = userOptional.get();

        // Check if the verification code matches and is not expired
        if (user.getEmailVerificationCode().equals(verificationCode) && 
            user.getEmailVerificationExpires().isAfter(LocalDateTime.now())) {
            
            user.setEmailVerified(true);
            user.setAccountStatus(User.AccountStatus.ACTIVE);
            userRepository.save(user);
            return true;
        }

        return false;
    }
}
