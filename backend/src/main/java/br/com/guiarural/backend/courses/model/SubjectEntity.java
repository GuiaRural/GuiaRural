package br.com.guiarural.backend.courses.model;

import jakarta.persistence.*;

@Entity
@Table(name = "curriculum_subjects")
public class SubjectEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long courseId;
    private Short period;
    private String code;
    private String name;
    private String syllabus;
    private Short workloadHours;
    private Short credits;
    @Enumerated(EnumType.STRING)
    private SubjectNature nature;
    private String prerequisites;

    public SubjectEntity() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public Short getPeriod() {
        return period;
    }

    public void setPeriod(Short period) {
        this.period = period;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSyllabus() {
        return syllabus;
    }

    public void setSyllabus(String syllabus) {
        this.syllabus = syllabus;
    }

    public Short getWorkloadHours() {
        return workloadHours;
    }

    public void setWorkloadHours(Short workloadHours) {
        this.workloadHours = workloadHours;
    }

    public Short getCredits() {
        return credits;
    }

    public void setCredits(Short credits) {
        this.credits = credits;
    }

    public SubjectNature getNature() {
        return nature;
    }

    public void setNature(SubjectNature nature) {
        this.nature = nature;
    }

    public String getPrerequisites() {
        return prerequisites;
    }

    public void setPrerequisites(String prerequisites) {
        this.prerequisites = prerequisites;
    }
}
