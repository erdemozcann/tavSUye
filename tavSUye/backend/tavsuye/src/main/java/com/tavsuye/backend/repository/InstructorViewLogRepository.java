package com.tavsuye.backend.repository;

import com.tavsuye.backend.entity.InstructorViewLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InstructorViewLogRepository extends JpaRepository<InstructorViewLog, Integer> {

    @Query(value = """
        SELECT i.instructorId, i.name, i.surname, i.department, COUNT(DISTINCT ivl.user.userId) AS uniqueVisitCount
        FROM InstructorViewLog ivl
        JOIN ivl.instructor i
        WHERE ivl.viewedAt >= :thirtyDaysAgo
        GROUP BY i.instructorId, i.name, i.surname, i.department
        ORDER BY uniqueVisitCount DESC
        """, 
        countQuery = "SELECT COUNT(*) FROM InstructorViewLog",
        nativeQuery = false)
    List<Object[]> findTopVisitedInstructors(LocalDateTime thirtyDaysAgo);
}
