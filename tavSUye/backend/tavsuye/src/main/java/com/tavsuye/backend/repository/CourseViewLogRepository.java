package com.tavsuye.backend.repository;

import com.tavsuye.backend.entity.CourseViewLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CourseViewLogRepository extends JpaRepository<CourseViewLog, Integer> {

    @Query("""
        SELECT c.courseId, COUNT(DISTINCT cvl.user.userId) AS uniqueVisitCount
        FROM CourseViewLog cvl
        JOIN cvl.course c
        WHERE cvl.viewedAt >= :thirtyDaysAgo
        GROUP BY c.courseId
        ORDER BY uniqueVisitCount DESC
    """)
    List<Object[]> findTopVisitedCourses(LocalDateTime thirtyDaysAgo);
}