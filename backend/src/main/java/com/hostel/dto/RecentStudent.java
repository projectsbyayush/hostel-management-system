package com.hostel.dto;

import java.time.LocalDate;

public record RecentStudent(
        Long id,
        String studentId,
        String fullName,
        String course,
        int yearOfStudy,
        String phone,
        LocalDate admissionDate) {
}
