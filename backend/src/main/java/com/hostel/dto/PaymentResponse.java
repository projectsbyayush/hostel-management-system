package com.hostel.dto;

import com.hostel.model.PaymentMethod;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record PaymentResponse(
        Long id,
        BigDecimal amount,
        LocalDate paymentDate,
        PaymentMethod method,
        String reference,
        String note,
        LocalDateTime createdAt) {
}
