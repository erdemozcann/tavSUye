package com.tavsuye.backend.entity;

import jakarta.persistence.*;


@Entity
@Table(name = "Course")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "course_id")
    private Integer courseId;

    @Column(name = "subject", nullable = false, length = 10)
    private String subject;

    @Column(name = "course_code", nullable = false, length = 10)
    private String courseCode;

    @Column(name = "course_name_en", nullable = false, length = 255)
    private String courseNameEn;

    @Column(name = "course_name_tr", nullable = false, length = 255)
    private String courseNameTr;

    @Column(name = "su_credit", nullable = false)
    private Integer suCredit;

    @Column(name = "ects_credit", nullable = false)
    private Integer ectsCredit;

    @Column(name = "engineering_ects")
    private Integer engineeringEcts;

    @Column(name = "basic_science_ects")
    private Integer basicScienceEcts;

    @Column(name = "content_en", columnDefinition = "TEXT")
    private String contentEn;

    @Column(name = "content_tr", columnDefinition = "TEXT")
    private String contentTr;

    @Column(name = "link_en", columnDefinition = "TEXT")
    private String linkEn;

    @Column(name = "link_tr", columnDefinition = "TEXT")
    private String linkTr;

    @Enumerated(EnumType.STRING)
    @Column(name = "faculty")
    private Faculty faculty;

    @Column(name = "course_status", nullable = false)
    private Boolean courseStatus = true;

    // No-arg constructor
    public Course() {
    }

    // --------------------- GETTERS AND SETTERS ---------------------

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

    public String getCourseNameEn() {
        return courseNameEn;
    }

    public void setCourseNameEn(String courseNameEn) {
        this.courseNameEn = courseNameEn;
    }

    public String getCourseNameTr() {
        return courseNameTr;
    }

    public void setCourseNameTr(String courseNameTr) {
        this.courseNameTr = courseNameTr;
    }

    public Integer getSuCredit() {
        return suCredit;
    }

    public void setSuCredit(Integer suCredit) {
        this.suCredit = suCredit;
    }

    public Integer getEctsCredit() {
        return ectsCredit;
    }

    public void setEctsCredit(Integer ectsCredit) {
        this.ectsCredit = ectsCredit;
    }

    public Integer getEngineeringEcts() {
        return engineeringEcts;
    }

    public void setEngineeringEcts(Integer engineeringEcts) {
        this.engineeringEcts = engineeringEcts;
    }

    public Integer getBasicScienceEcts() {
        return basicScienceEcts;
    }

    public void setBasicScienceEcts(Integer basicScienceEcts) {
        this.basicScienceEcts = basicScienceEcts;
    }

    public String getContentEn() {
        return contentEn;
    }

    public void setContentEn(String contentEn) {
        this.contentEn = contentEn;
    }

    public String getContentTr() {
        return contentTr;
    }

    public void setContentTr(String contentTr) {
        this.contentTr = contentTr;
    }

    public String getLinkEn() {
        return linkEn;
    }

    public void setLinkEn(String linkEn) {
        this.linkEn = linkEn;
    }

    public String getLinkTr() {
        return linkTr;
    }

    public void setLinkTr(String linkTr) {
        this.linkTr = linkTr;
    }

    public Faculty getFaculty() {
        return faculty;
    }

    public void setFaculty(Faculty faculty) {
        this.faculty = faculty;
    }
    
    public Boolean getCourseStatus() {
        return courseStatus;
    }
    
    public void setCourseStatus(Boolean courseStatus) {
        this.courseStatus = courseStatus;
    }

 // --------------------- NESTED ENUM FOR FACULTY ---------------------
    public enum Faculty {
        FASS,
        FENS,
        FMAN,
        SL
    }
}
