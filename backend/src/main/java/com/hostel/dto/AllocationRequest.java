package com.hostel.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record AllocationRequest(
        @NotNull(message = "Student is required") Long studentId,

        @NotNull(message = "Room is required") Long roomId,

        @NotNull(message = "Allotment date is required")
        @FutureOrPresent(message = "Allotment date cannot be in the past") LocalDate allotmentDate) {
}
