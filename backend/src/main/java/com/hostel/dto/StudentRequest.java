package com.hostel.dto;

import com.hostel.model.StudentStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record StudentRequest(
        @NotBlank(message = "Student ID is required")
        @Size(max = 20, message = "Student ID must be at most 20 characters") String studentId,

        @NotBlank(message = "Full name is required")
        @Size(max = 100, message = "Name must be at most 100 characters") String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid") String email,

        @NotBlank(message = "Phone number is required")
        @Size(min = 10, max = 15, message = "Phone number must be 10-15 digits") String phone,

        @NotBlank(message = "Course is required") String course,

        @NotNull(message = "Year of study is required")
        @Min(value = 1, message = "Year of study must be at least 1") Integer yearOfStudy,

        @NotBlank(message = "Guardian name is required") String guardianName,

        @NotBlank(message = "Guardian contact is required") String guardianContact,

        String address,

        @NotNull(message = "Admission date is required")
        @PastOrPresent(message = "Admission date cannot be in the future") LocalDate admissionDate,

        @NotNull(message = "Status is required") StudentStatus status) {
}
