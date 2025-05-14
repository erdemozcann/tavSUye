package com.tavsuye.backend.dto;

public class CourseSummaryDTO {
    private Integer courseId;
    private String subject;
    private String courseCode;

    // No-args constructor
    public CourseSummaryDTO() {
    }

    // Constructor with fields
    public CourseSummaryDTO(Integer courseId, String subject, String courseCode) {
        this.courseId = courseId;
        this.subject = subject;
        this.courseCode = courseCode;
    }

    // Getters and Setters
    public Integer getCourseId() {
        return courseId;
    }

    public void setCourseId(Integer courseId) {
        this.courseId = courseId;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }
} 