package com.tavsuye.backend.entity;

import jakarta.persistence.*;


@Entity
@Table(name = "Prerequisite")
public class Prerequisite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "prerequisite_id")
    private Integer prerequisiteId;

    /**
     * The course that has a prerequisite.
     * This is mapped with a foreign key referencing the Course table.
     */
    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    /**
     * The prerequisite course itself.
     * Also references the Course table.
     */
    @ManyToOne
    @JoinColumn(name = "prerequisite_course_id", nullable = false)
    private Course prerequisiteCourse;

    /**
     * Indicates whether this prerequisite is an "AND" condition.
     * If true, this prerequisite must be taken in conjunction with other courses.
     * If false, it represents an "OR" condition.
     */
    @Column(name = "is_and", nullable = false)
    private Boolean isAnd;

    // JPA requires a no-argument constructor
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
