package com.tavsuye.backend.repository;

import com.tavsuye.backend.entity.CourseViewLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CourseViewLogRepository extends JpaRepository<CourseViewLog, Integer> {
	
	// ✅ Find a user's latest view log for a specific course
    Optional<CourseViewLog> findByUser_UserIdAndCourse_CourseId(Integer userId, Integer courseId);
	
    /**
     * Find an existing course view log for a user based on subject and course code.
     * This replaces the previous version that used course_id.
     */
    @Query("""
        SELECT v FROM CourseViewLog v 
        WHERE v.user.userId = :userId 
        AND v.course.subject = :subject 
        AND v.course.courseCode = :courseCode
    """)
    Optional<CourseViewLog> findByUserAndCourse(Integer userId, String subject, String courseCode);

    /**
     * Retrieve the top 10 most viewed courses in the last 30 days.
     * This now uses subject and courseCode instead of course_id.
     */
    @Query("""
        SELECT v.course.subject, v.course.courseCode, COUNT(DISTINCT v.user) 
        FROM CourseViewLog v 
        WHERE v.viewedAt >= :since 
        GROUP BY v.course.subject, v.course.courseCode
        ORDER BY COUNT(DISTINCT v.user) DESC
        LIMIT 10
    """)
    List<Object[]> findMostViewedCoursesSince(LocalDateTime since);

    /**
     * Remove duplicate view logs, keeping only the latest entry per user-course.
     * Now works with subject and courseCode instead of course_id.
     */
    @Modifying
    @Transactional
    @Query("""
        DELETE FROM CourseViewLog v1 
        WHERE v1.viewId NOT IN (
            SELECT MAX(v2.viewId) 
            FROM CourseViewLog v2 
            GROUP BY v2.user, v2.course.subject, v2.course.courseCode
        )
    """)
    void removeDuplicateViews();
}
