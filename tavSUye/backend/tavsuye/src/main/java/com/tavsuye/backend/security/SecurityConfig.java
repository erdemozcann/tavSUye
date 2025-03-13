package com.tavsuye.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.authentication.session.ChangeSessionIdAuthenticationStrategy;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF for API-based authentication (not needed for JWT or session-based auth)
            .csrf(csrf -> csrf.disable())

            // Enable CORS (default settings applied)
            .cors(cors -> {})

            // Session management configuration
            .sessionManagement(session -> session
                .sessionAuthenticationStrategy(sessionAuthenticationStrategy()) // Prevent session fixation
                .sessionFixation().migrateSession() // Ensure a new session ID is issued upon login
                .maximumSessions(1) // Allow only one active session per user
                .maxSessionsPreventsLogin(false) // Allow new logins to replace previous sessions
            )

            // Authorization rules for API endpoints
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/register", "/api/auth/login").permitAll() // Allow user registration & login
                .requestMatchers("/api/auth/verify-email").permitAll() // Email verification open to all
                .requestMatchers("/api/auth/verify-2fa", "/api/auth/logout").permitAll() // Require authentication for 2FA verification
                .anyRequest().authenticated() // Require authentication for all other requests
            );
            /*
            // Logout configuration
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout") // Custom logout endpoint
                .invalidateHttpSession(true) // Destroy session on logout
                .deleteCookies("JSESSIONID") // Remove session cookies
            );
        	*/
        return http.build();
    }

    // Prevents session fixation attacks by issuing a new session ID on login
    @Bean
    public SessionAuthenticationStrategy sessionAuthenticationStrategy() {
        return new ChangeSessionIdAuthenticationStrategy();
    }
}
