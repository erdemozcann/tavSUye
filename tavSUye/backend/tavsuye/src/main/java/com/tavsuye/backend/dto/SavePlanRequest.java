package com.tavsuye.backend.dto;

public class SavePlanRequest {
    private Integer courseId;
    private Integer term;

    public SavePlanRequest() {
    }

    public SavePlanRequest(Integer courseId, Integer term) {
        this.courseId = courseId;
        this.term = term;
    }

    public Integer getCourseId() {
        return courseId;
    }

    public void setCourseId(Integer courseId) {
        this.courseId = courseId;
    }

    public Integer getTerm() {
        return term;
    }

    public void setTerm(Integer term) {
        this.term = term;
    }
} 