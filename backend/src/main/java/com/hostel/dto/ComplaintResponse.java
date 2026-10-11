package com.hostel.dto;

import com.hostel.model.ComplaintPriority;
import com.hostel.model.ComplaintStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record ComplaintResponse(
        Long id,
        String complaintId,
        String studentName,
        String studentId,
        Long studentDbId,
        String roomNumber,
        Long roomDbId,
        String category,
        String description,
        ComplaintPriority priority,
        ComplaintStatus status,
        LocalDateTime submittedAt,
        LocalDateTime updatedAt) {
}
