package com.tavsuye.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "CourseChange")
public class CourseChange {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "change_id")
    private Integer changeId;

    @ManyToOne
    @JoinColumn(name = "old_course_id", nullable = false)
    private Course oldCourse;

    @ManyToOne
    @JoinColumn(name = "new_course_id", nullable = false)
    private Course newCourse;

    @Column(name = "change_term", nullable = false)
    private Integer changeTerm;

    // No-arg constructor
    public CourseChange() {
    }

    // --------------------- GETTERS AND SETTERS ---------------------

    public Integer getChangeId() {
        return changeId;
    }

    public void setChangeId(Integer changeId) {
        this.changeId = changeId;
    }

    public Course getOldCourse() {
        return oldCourse;
    }

    public void setOldCourse(Course oldCourse) {
        this.oldCourse = oldCourse;
    }

    public Course getNewCourse() {
        return newCourse;
    }

    public void setNewCourse(Course newCourse) {
        this.newCourse = newCourse;
    }

    public Integer getChangeTerm() {
        return changeTerm;
    }

    public void setChangeTerm(Integer changeTerm) {
        this.changeTerm = changeTerm;
    }
}
