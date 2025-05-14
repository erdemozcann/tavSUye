package com.tavsuye.backend.dto;

import com.tavsuye.backend.entity.StudentPlan;
import java.util.List;
import java.util.stream.Collectors;

public class StudentPlanDTO {
    private Integer planId;
    private Integer courseId;
    private String subject;
    private String courseCode;
    private Integer term;

    public StudentPlanDTO() {
    }

    public StudentPlanDTO(StudentPlan plan) {
        this.planId = plan.getPlanId();
        this.courseId = plan.getCourse().getCourseId();
        this.subject = plan.getCourse().getSubject();
        this.courseCode = plan.getCourse().getCourseCode();
        this.term = plan.getTerm();
    }

    public static List<StudentPlanDTO> fromEntities(List<StudentPlan> plans) {
        return plans.stream()
                .map(StudentPlanDTO::new)
                .collect(Collectors.toList());
    }

    // Getters and setters

    public Integer getPlanId() {
        return planId;
    }

    public void setPlanId(Integer planId) {
        this.planId = planId;
    }

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

    public Integer getTerm() {
        return term;
    }

    public void setTerm(Integer term) {
        this.term = term;
    }
} 