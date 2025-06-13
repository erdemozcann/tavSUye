package com.tavsuye.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Program")
public class Program {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "program_id")
    private Integer programId;

    @Column(name = "name_en", nullable = false)
    private String nameEn;

    @Column(name = "name_tr", nullable = false)
    private String nameTr;

    @Column(name = "admission_term", nullable = false)
    private Integer admissionTerm;

    @Column(name = "university_credits")
    private Integer universityCredits;

    @Column(name = "university_min_courses")
    private Integer universityMinCourses;

    @Column(name = "required_credits")
    private Integer requiredCredits;

    @Column(name = "required_min_courses")
    private Integer requiredMinCourses;

    @Column(name = "core_credits")
    private Integer coreCredits;

    @Column(name = "core_min_courses")
    private Integer coreMinCourses;

    @Column(name = "core_elective_credits_i")
    private Integer coreElectiveCreditsI;

    @Column(name = "core_elective_min_courses_i")
    private Integer coreElectiveMinCoursesI;

    @Column(name = "core_elective_credits_ii")
    private Integer coreElectiveCreditsII;

    @Column(name = "core_elective_min_courses_ii")
    private Integer coreElectiveMinCoursesII;

    @Column(name = "area_credits")
    private Integer areaCredits;

    @Column(name = "area_min_courses")
    private Integer areaMinCourses;

    @Column(name = "free_elective_credits")
    private Integer freeElectiveCredits;

    @Column(name = "free_elective_min_courses")
    private Integer freeElectiveMinCourses;

    @Column(name = "faculty_credits")
    private Integer facultyCredits;

    @Column(name = "faculty_min_courses")
    private Integer facultyMinCourses;

    @Column(name = "math_required_credits")
    private Integer mathRequiredCredits;

    @Column(name = "math_min_courses")
    private Integer mathMinCourses;

    @Column(name = "philosophy_required_credits")
    private Integer philosophyRequiredCredits;

    @Column(name = "philosophy_min_courses")
    private Integer philosophyMinCourses;

    @Column(name = "engineering_ects")
    private Integer engineeringEcts;

    @Column(name = "basic_science_ects")
    private Integer basicScienceEcts;

    @Column(name = "total_min_ects")
    private Integer totalMinEcts;

    @Column(name = "total_min_credits")
    private Integer totalMinCredits;

    // No-arg constructor
    public Program() {
    }

    // --------------------- GETTERS AND SETTERS ---------------------

    public Integer getProgramId() {
        return programId;
    }

    public void setProgramId(Integer programId) {
        this.programId = programId;
    }

    public String getNameEn() {
        return nameEn;
    }

    public void setNameEn(String nameEn) {
        this.nameEn = nameEn;
    }

    public String getNameTr() {
        return nameTr;
    }

    public void setNameTr(String nameTr) {
        this.nameTr = nameTr;
    }

    public Integer getAdmissionTerm() {
        return admissionTerm;
    }

    public void setAdmissionTerm(Integer admissionTerm) {
        this.admissionTerm = admissionTerm;
    }

    public Integer getUniversityCredits() {
        return universityCredits;
    }

    public void setUniversityCredits(Integer universityCredits) {
        this.universityCredits = universityCredits;
    }

    public Integer getUniversityMinCourses() {
        return universityMinCourses;
    }

    public void setUniversityMinCourses(Integer universityMinCourses) {
        this.universityMinCourses = universityMinCourses;
    }

    public Integer getRequiredCredits() {
        return requiredCredits;
    }

    public void setRequiredCredits(Integer requiredCredits) {
        this.requiredCredits = requiredCredits;
    }

    public Integer getRequiredMinCourses() {
        return requiredMinCourses;
    }

    public void setRequiredMinCourses(Integer requiredMinCourses) {
        this.requiredMinCourses = requiredMinCourses;
    }

    public Integer getCoreCredits() {
        return coreCredits;
    }

    public void setCoreCredits(Integer coreCredits) {
        this.coreCredits = coreCredits;
    }

    public Integer getCoreMinCourses() {
        return coreMinCourses;
    }

    public void setCoreMinCourses(Integer coreMinCourses) {
        this.coreMinCourses = coreMinCourses;
    }

    public Integer getCoreElectiveCreditsI() {
        return coreElectiveCreditsI;
    }

    public void setCoreElectiveCreditsI(Integer coreElectiveCreditsI) {
        this.coreElectiveCreditsI = coreElectiveCreditsI;
    }

    public Integer getCoreElectiveMinCoursesI() {
        return coreElectiveMinCoursesI;
    }

    public void setCoreElectiveMinCoursesI(Integer coreElectiveMinCoursesI) {
        this.coreElectiveMinCoursesI = coreElectiveMinCoursesI;
    }

    public Integer getCoreElectiveCreditsII() {
        return coreElectiveCreditsII;
    }

    public void setCoreElectiveCreditsII(Integer coreElectiveCreditsII) {
        this.coreElectiveCreditsII = coreElectiveCreditsII;
    }

    public Integer getCoreElectiveMinCoursesII() {
        return coreElectiveMinCoursesII;
    }

    public void setCoreElectiveMinCoursesII(Integer coreElectiveMinCoursesII) {
        this.coreElectiveMinCoursesII = coreElectiveMinCoursesII;
    }

    public Integer getAreaCredits() {
        return areaCredits;
    }

    public void setAreaCredits(Integer areaCredits) {
        this.areaCredits = areaCredits;
    }

    public Integer getAreaMinCourses() {
        return areaMinCourses;
    }

    public void setAreaMinCourses(Integer areaMinCourses) {
        this.areaMinCourses = areaMinCourses;
    }

    public Integer getFreeElectiveCredits() {
        return freeElectiveCredits;
    }

    public void setFreeElectiveCredits(Integer freeElectiveCredits) {
        this.freeElectiveCredits = freeElectiveCredits;
    }

    public Integer getFreeElectiveMinCourses() {
        return freeElectiveMinCourses;
    }

    public void setFreeElectiveMinCourses(Integer freeElectiveMinCourses) {
        this.freeElectiveMinCourses = freeElectiveMinCourses;
    }

    public Integer getFacultyCredits() {
        return facultyCredits;
    }

    public void setFacultyCredits(Integer facultyCredits) {
        this.facultyCredits = facultyCredits;
    }

    public Integer getFacultyMinCourses() {
        return facultyMinCourses;
    }

    public void setFacultyMinCourses(Integer facultyMinCourses) {
        this.facultyMinCourses = facultyMinCourses;
    }

    public Integer getMathRequiredCredits() {
        return mathRequiredCredits;
    }

    public void setMathRequiredCredits(Integer mathRequiredCredits) {
        this.mathRequiredCredits = mathRequiredCredits;
    }

    public Integer getMathMinCourses() {
        return mathMinCourses;
    }

    public void setMathMinCourses(Integer mathMinCourses) {
        this.mathMinCourses = mathMinCourses;
    }

    public Integer getPhilosophyRequiredCredits() {
        return philosophyRequiredCredits;
    }

    public void setPhilosophyRequiredCredits(Integer philosophyRequiredCredits) {
        this.philosophyRequiredCredits = philosophyRequiredCredits;
    }

    public Integer getPhilosophyMinCourses() {
        return philosophyMinCourses;
    }

    public void setPhilosophyMinCourses(Integer philosophyMinCourses) {
        this.philosophyMinCourses = philosophyMinCourses;
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

    public Integer getTotalMinEcts() {
        return totalMinEcts;
    }

    public void setTotalMinEcts(Integer totalMinEcts) {
        this.totalMinEcts = totalMinEcts;
    }

    public Integer getTotalMinCredits() {
        return totalMinCredits;
    }

    public void setTotalMinCredits(Integer totalMinCredits) {
        this.totalMinCredits = totalMinCredits;
    }
}
