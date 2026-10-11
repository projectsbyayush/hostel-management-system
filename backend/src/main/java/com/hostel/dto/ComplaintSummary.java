package com.hostel.dto;

import java.time.LocalDateTime;

public record ComplaintSummary(
        Long id,
        String complaintId,
        String studentName,
        String studentId,
        String category,
        String priority,
        String status,
        LocalDateTime submittedAt) {
}
