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

    @Column(name = "surname", nullable = false)
    private String surname;

    @Column(name = "department")
    private String department;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "about_tr", columnDefinition = "TEXT")
    private String aboutTr;

    @Column(name = "about_en", columnDefinition = "TEXT")
    private String aboutEn;

    @Column(name = "link_tr", columnDefinition = "TEXT")
    private String linkTr;

    @Column(name = "link_en", columnDefinition = "TEXT")
    private String linkEn;

    // No-arg constructor
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

    public String getSurname() {
        return surname;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getAboutTr() {
        return aboutTr;
    }

    public void setAboutTr(String aboutTr) {
        this.aboutTr = aboutTr;
    }

    public String getAboutEn() {
        return aboutEn;
    }

    public void setAboutEn(String aboutEn) {
        this.aboutEn = aboutEn;
    }

    public String getLinkTr() {
        return linkTr;
    }

    public void setLinkTr(String linkTr) {
        this.linkTr = linkTr;
    }

    public String getLinkEn() {
        return linkEn;
    }

    public void setLinkEn(String linkEn) {
        this.linkEn = linkEn;
    }
}
