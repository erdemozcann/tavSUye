package com.tavsuye.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Prerequisite")
public class Prerequisite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "prerequisite_id")
    private Integer prerequisiteId;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne
    @JoinColumn(name = "prerequisite_course_id", nullable = false)
    private Course prerequisiteCourse;

    @Column(name = "is_and", nullable = false)
    private Boolean isAnd;

    // No-arg constructor
    public Prerequisite() {
    }

    // --------------------- GETTERS AND SETTERS ---------------------

    public Integer getPrerequisiteId() {
        return prerequisiteId;
    }

    public void setPrerequisiteId(Integer prerequisiteId) {
        this.prerequisiteId = prerequisiteId;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public Course getPrerequisiteCourse() {
        return prerequisiteCourse;
    }

    public void setPrerequisiteCourse(Course prerequisiteCourse) {
        this.prerequisiteCourse = prerequisiteCourse;
    }

    public Boolean getIsAnd() {
        return isAnd;
    }

    public void setIsAnd(Boolean isAnd) {
        this.isAnd = isAnd;
    }
}
