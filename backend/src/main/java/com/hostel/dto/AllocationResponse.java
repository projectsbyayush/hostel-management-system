package com.hostel.dto;

import java.time.LocalDate;

public record AllocationResponse(
        Long id,
        String studentName,
        String studentId,
        String roomNumber,
        String roomType,
        LocalDate allotmentDate,
        LocalDate checkoutDate,
        String status) {
}
