package com.tavsuye.backend.dto;

import com.tavsuye.backend.entity.Course;
import java.util.List;

public class CourseDetailsResponse {
    private Course course;
    private List<CommentResponse> comments;

    public CourseDetailsResponse(Course course, List<CommentResponse> comments) {
        this.course = course;
        this.comments = comments;
    }

    public Course getCourse() {
        return course;
    }

    public List<CommentResponse> getComments() {
        return comments;
    }
}
