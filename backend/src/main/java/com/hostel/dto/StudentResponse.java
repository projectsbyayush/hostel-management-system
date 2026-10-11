package com.hostel.dto;

import com.hostel.model.StudentStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record StudentResponse(
        Long id,
        String studentId,
        String fullName,
        String email,
        String phone,
        String course,
        int yearOfStudy,
        String guardianName,
        String guardianContact,
        String address,
        LocalDate admissionDate,
        StudentStatus status,
        LocalDateTime createdAt) {
}
