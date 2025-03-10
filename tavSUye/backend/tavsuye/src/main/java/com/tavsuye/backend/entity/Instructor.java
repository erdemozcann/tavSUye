package com.tavsuye.backend.entity;

import jakarta.persistence.*;


@Entity
@Table(name = "Instructor")
public class Instructor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "instructor_id")
    private Integer instructorId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "department")
    private String department;

    // JPA requires a no-argument constructor
    public Instructor() {
    }

    // --------------------- GETTERS AND SETTERS ---------------------

    public Integer getInstructorId() {
        return instructorId;
    }

    public void setInstructorId(Integer instructorId) {
        this.instructorId = instructorId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }
}
