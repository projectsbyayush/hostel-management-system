package com.hostel.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public record FeeRequest(
        @NotNull(message = "Student is required") Long studentId,

        @NotNull(message = "Amount is required")
        @Positive(message = "Amount must be greater than zero") BigDecimal amount,

        @NotNull(message = "Due date is required")
        @FutureOrPresent(message = "Due date cannot be in the past") LocalDate dueDate,

        @NotBlank(message = "Period is required") String period) {
}
