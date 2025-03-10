package com.tavsuye.backend.entity;

import jakarta.persistence.*;

/**
 * JPA entity representation of the "CourseChange" table.
 * This class indicates a course transition that occurred in a specific term,
 * mapping from an old course to a new course.
 */
@Entity
@Table(name = "CourseChange")
public class CourseChange {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "change_id")
    private Integer changeId;

    /**
     * Reference to the old course that was replaced.
     */
    @ManyToOne
    @JoinColumn(name = "old_course_id", nullable = false)
    private Course oldCourse;

    /**
     * Reference to the new course that replaces the old one.
     */
    @ManyToOne
    @JoinColumn(name = "new_course_id", nullable = false)
    private Course newCourse;

    /**
     * The term when this course change took place, e.g., 202401.
     */
    @Column(name = "change_term", nullable = false)
    private Integer changeTerm;

    // JPA requires a no-argument constructor
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
