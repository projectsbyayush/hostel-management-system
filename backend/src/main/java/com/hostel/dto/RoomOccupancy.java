package com.hostel.dto;

public record RoomOccupancy(
        String roomNumber,
        String roomType,
        int capacity,
        int occupied,
        int available) {
}
