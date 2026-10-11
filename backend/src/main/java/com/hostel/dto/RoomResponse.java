package com.hostel.dto;

import com.hostel.model.RoomStatus;
import com.hostel.model.RoomType;
import java.math.BigDecimal;

public record RoomResponse(
        Long id,
        String roomNumber,
        int floorNo,
        RoomType roomType,
        int capacity,
        int occupied,
        int available,
        BigDecimal monthlyFee,
        RoomStatus status) {
}
