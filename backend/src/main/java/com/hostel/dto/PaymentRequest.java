package com.hostel.dto;

import com.hostel.model.PaymentMethod;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record PaymentRequest(
        @NotNull(message = "Amount is required")
        @Positive(message = "Amount must be greater than zero") BigDecimal amount,

        @FutureOrPresent(message = "Payment date cannot be in the future") LocalDate paymentDate,

        @NotNull(message = "Payment method is required") PaymentMethod method,

        @Size(max = 60, message = "Reference must be at most 60 characters") String reference,

        @Size(max = 300, message = "Note must be at most 300 characters") String note) {
}
