package br.com.guiarural.backend.courses.dto;

public record CourseCoordinationDTO (
    String coordinatorName,
    String viceCoordinatorName,
    String officeLocation,
    String officeHours,
    String attendanceMode,
    String phone,
    String extension,
    String email,
    String secondaryEmail
) {}
