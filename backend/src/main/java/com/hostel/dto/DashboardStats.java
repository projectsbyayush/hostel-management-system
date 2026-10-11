package com.hostel.dto;

import java.math.BigDecimal;

public record DashboardStats(
        long totalStudents,
        long totalRooms,
        int availableBeds,
        BigDecimal pendingFeeBalance,
        long openComplaints) {
}
