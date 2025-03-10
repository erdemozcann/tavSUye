package com.tavsuye.backend.entity;

import jakarta.persistence.*;

/**
 * JPA entity representation of the "StudentPlan" table.
 * This class indicates which course a user plans to take in a given term.
 */
@Entity
@Table(name = "StudentPlan")
public class StudentPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_id")
    private Integer planId;

    /**
     * The user (student) who created this plan.
     */
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * The course the student intends to take.
     */
    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    /**
     * The term during which the student plans to take the course (e.g., 202503).
     */
    @Column(name = "term", nullable = false)
    private Integer term;

    // JPA requires a no-argument constructor
    public StudentPlan() {
    }

    // --------------------- GETTERS AND SETTERS ---------------------

    public Integer getPlanId() {
        return planId;
    }

    public void setPlanId(Integer planId) {
        this.planId = planId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public Integer getTerm() {
        return term;
    }

    public void setTerm(Integer term) {
        this.term = term;
    }
}
