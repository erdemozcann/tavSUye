package com.tavsuye.backend.entity;

import jakarta.persistence.*;

/*
 * JPA entity representation of the "ProgramCourse" table.
 * This class maps to the structure of the ProgramCourse table in the database,
 * linking a Program with a Course, along with a course group.
 */
@Entity
@Table(name = "ProgramCourse")
public class ProgramCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "program_course_id")
    private Integer programCourseId;

    /**
     * References the Program to which this course belongs.
     */
    @ManyToOne
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;

    /**
     * References the specific Course in this program.
     */
    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    /**
     * The course group can represent categories such as "Core",
     * "Elective", "Area Elective", etc.
     */
    @Column(name = "course_group", nullable = false, length = 50)
    private String courseGroup;

    // JPA requires a no-argument constructor
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
