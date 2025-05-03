package com.tavsuye.backend.service;

import com.tavsuye.backend.entity.User;
import com.tavsuye.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ProfileService {

    private final UserRepository userRepository;

    public ProfileService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Get user profile details
    public Map<String, Object> getUserProfile(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> profile = new HashMap<>();
        profile.put("name", user.getName());
        profile.put("surname", user.getSurname());
        profile.put("username", user.getUsername());
        profile.put("email", user.getEmail());
        profile.put("major", user.getMajor());
        profile.put("minor", user.getMinor());
        profile.put("second_major", user.getSecondMajor());
        profile.put("start_term", user.getStartTerm());
        profile.put("graduation_term", user.getGraduationTerm());
        profile.put("is_2fa_enabled", user.getIs2faEnabled());
        profile.put("last_failed_attempt", user.getLastFailedAttempt());
        profile.put("last_login", user.getLastLogin());

        return profile;
    }

    // Update 2FA setting
    public void updateTwoFactorAuth(Integer userId, Boolean is2faEnabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setIs2faEnabled(is2faEnabled);
        userRepository.save(user);
    }

    // Update user profile details
    public void updateUserProfile(Integer userId, Map<String, Object> updates) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.containsKey("name")) {
            user.setName((String) updates.get("name"));
        }
        if (updates.containsKey("surname")) {
            user.setSurname((String) updates.get("surname"));
        }
        if (updates.containsKey("major")) {
            user.setMajor((String) updates.get("major"));
        }
        if (updates.containsKey("minor")) {
            user.setMinor((String) updates.get("minor"));
        }
        if (updates.containsKey("second_major")) {
            user.setSecondMajor((String) updates.get("second_major"));
        }
        if (updates.containsKey("start_term")) {
            user.setStartTerm((Integer) updates.get("start_term"));
        }
        if (updates.containsKey("graduation_term")) {
            user.setGraduationTerm((Integer) updates.get("graduation_term"));
        }

        userRepository.save(user);
    }
}
