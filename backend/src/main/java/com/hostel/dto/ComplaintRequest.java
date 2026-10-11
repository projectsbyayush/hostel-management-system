package com.hostel.dto;

import com.hostel.model.ComplaintPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ComplaintRequest(
        @NotNull(message = "Student is required") Long studentId,

        Long roomId,

        @NotBlank(message = "Category is required")
        @Size(max = 40, message = "Category must be at most 40 characters") String category,

        @NotBlank(message = "Description is required")
        @Size(max = 1000, message = "Description must be at most 1000 characters") String description,

        @NotNull(message = "Priority is required") ComplaintPriority priority) {
}
