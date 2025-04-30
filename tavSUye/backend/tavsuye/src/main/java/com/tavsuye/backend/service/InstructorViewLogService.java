package com.tavsuye.backend.service;

import com.tavsuye.backend.entity.Instructor;
import com.tavsuye.backend.entity.InstructorViewLog;
import com.tavsuye.backend.entity.User;
import com.tavsuye.backend.repository.InstructorRepository;
import com.tavsuye.backend.repository.InstructorViewLogRepository;
import com.tavsuye.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InstructorViewLogService {

    private final InstructorViewLogRepository instructorViewLogRepository;
    private final UserRepository userRepository;
    private final InstructorRepository instructorRepository;

    public InstructorViewLogService(InstructorViewLogRepository instructorViewLogRepository, UserRepository userRepository, InstructorRepository instructorRepository) {
        this.instructorViewLogRepository = instructorViewLogRepository;
        this.userRepository = userRepository;
        this.instructorRepository = instructorRepository;
    }

    public void logInstructorVisit(Integer userId, Integer instructorId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Instructor instructor = instructorRepository.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        InstructorViewLog log = new InstructorViewLog(user, instructor);
        instructorViewLogRepository.save(log);
    }

    public List<Object[]> getTopVisitedInstructors() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        return instructorViewLogRepository.findTopVisitedInstructors(thirtyDaysAgo);
    }
}
