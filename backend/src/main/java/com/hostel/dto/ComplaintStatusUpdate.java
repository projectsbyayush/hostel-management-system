package com.hostel.dto;

import com.hostel.model.ComplaintStatus;
import jakarta.validation.constraints.NotNull;

public record ComplaintStatusUpdate(
        @NotNull(message = "Status is required") ComplaintStatus status) {
}
