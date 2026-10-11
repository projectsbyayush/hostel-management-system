package com.hostel.dto;

import com.hostel.model.FeeStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record FeeResponse(
        Long id,
        String studentName,
        String studentId,
        BigDecimal amount,
        BigDecimal paid,
        BigDecimal balance,
        LocalDate dueDate,
        String period,
        FeeStatus status,
        LocalDateTime createdAt,
        List<PaymentResponse> payments) {
}
