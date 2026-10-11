package com.hostel.dto;

import com.hostel.model.RoomStatus;
import com.hostel.model.RoomType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record RoomRequest(
        @NotBlank(message = "Room number is required")
        @Size(max = 10, message = "Room number must be at most 10 characters") String roomNumber,

        @NotNull(message = "Floor is required")
        @Min(value = 0, message = "Floor cannot be negative") Integer floorNo,

        @NotNull(message = "Room type is required") RoomType roomType,

        @NotNull(message = "Capacity is required")
        @Min(value = 1, message = "Capacity must be at least 1") Integer capacity,

        @NotNull(message = "Monthly fee is required")
        @PositiveOrZero(message = "Monthly fee cannot be negative") BigDecimal monthlyFee,

        @NotNull(message = "Status is required") RoomStatus status) {
}
