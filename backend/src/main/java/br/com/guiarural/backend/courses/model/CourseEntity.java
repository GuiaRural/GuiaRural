package br.com.guiarural.backend.courses.model;

import jakarta.persistence.*;

@Entity
@Table(name = "courses")
public class CourseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long departmentId;
    private String code;
    private String name;
    @Enumerated(EnumType.STRING)
    private CourseLevel level;
    @Enumerated(EnumType.STRING)
    private CourseType type;
    private String modality;
    private String shift;
    private Short durationSemesters;
    private Short totalWorkloadHours;
    private Short mecGrade;
    private Short capesGrade;
    private String description;
    private Boolean active;
    private String coordinatorName;
    private String viceCoordinatorName;
    private String officeLocation;
    private String officeHours;
    private String attendanceMode;
    private String phone;
    private String extension;
    private String email;
    private String secondaryEmail;

    public CourseEntity() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
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

    public CourseLevel getLevel() {
        return level;
    }

    public void setLevel(CourseLevel level) {
        this.level = level;
    }

    public CourseType getType() {
        return type;
    }

    public void setType(CourseType type) {
        this.type = type;
    }

    public String getModality() {
        return modality;
    }

    public void setModality(String modality) {
        this.modality = modality;
    }

    public String getShift() {
        return shift;
    }

    public void setShift(String shift) {
        this.shift = shift;
    }

    public Short getDurationSemesters() {
        return durationSemesters;
    }

    public void setDurationSemesters(Short durationSemesters) {
        this.durationSemesters = durationSemesters;
    }

    public Short getTotalWorkloadHours() {
        return totalWorkloadHours;
    }

    public void setTotalWorkloadHours(Short totalWorkloadHours) {
        this.totalWorkloadHours = totalWorkloadHours;
    }

    public Short getMecGrade() {
        return mecGrade;
    }

    public void setMecGrade(Short mecGrade) {
        this.mecGrade = mecGrade;
    }

    public Short getCapesGrade() {
        return capesGrade;
    }

    public void setCapesGrade(Short capesGrade) {
        this.capesGrade = capesGrade;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getCoordinatorName() {
        return coordinatorName;
    }

    public void setCoordinatorName(String coordinatorName) {
        this.coordinatorName = coordinatorName;
    }

    public String getViceCoordinatorName() {
        return viceCoordinatorName;
    }

    public void setViceCoordinatorName(String viceCoordinatorName) {
        this.viceCoordinatorName = viceCoordinatorName;
    }

    public String getOfficeLocation() {
        return officeLocation;
    }

    public void setOfficeLocation(String officeLocation) {
        this.officeLocation = officeLocation;
    }

    public String getOfficeHours() {
        return officeHours;
    }

    public void setOfficeHours(String officeHours) {
        this.officeHours = officeHours;
    }

    public String getAttendanceMode() {
        return attendanceMode;
    }

    public void setAttendanceMode(String attendanceMode) {
        this.attendanceMode = attendanceMode;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getExtension() {
        return extension;
    }

    public void setExtension(String extension) {
        this.extension = extension;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSecondaryEmail() {
        return secondaryEmail;
    }

    public void setSecondaryEmail(String secondaryEmail) {
        this.secondaryEmail = secondaryEmail;
    }
}
