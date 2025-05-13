package com.tavsuye.backend.repository;

import com.tavsuye.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByEmailOrUsername(String email, String username);
    Optional<User> findByEmailAndAccountStatus(String email, User.AccountStatus status);
    Optional<User> findByPasswordResetToken(String token);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    Optional<User> findByEmailAndPasswordResetToken(String email, String token);
}
