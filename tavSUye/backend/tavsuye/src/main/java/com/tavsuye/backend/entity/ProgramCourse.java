package com.tavsuye.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "programcourse")
public class ProgramCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "program_course_id")
    private Integer programCourseId;

    @ManyToOne
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "course_group", nullable = false, length = 50)
    private String courseGroup;

    // No-arg constructor
    public ProgramCourse() {
    }

    // --------------------- GETTERS AND SETTERS ---------------------

    public Integer getProgramCourseId() {
        return programCourseId;
    }

    public void setProgramCourseId(Integer programCourseId) {
        this.programCourseId = programCourseId;
    }

    public Program getProgram() {
        return program;
    }

    public void setProgram(Program program) {
        this.program = program;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public String getCourseGroup() {
        return courseGroup;
    }

    public void setCourseGroup(String courseGroup) {
        this.courseGroup = courseGroup;
    }
}
