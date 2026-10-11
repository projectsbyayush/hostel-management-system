package com.hostel.controller;

import com.hostel.dto.DashboardStats;
import com.hostel.dto.ComplaintSummary;
import com.hostel.dto.MonthlyCollection;
import com.hostel.dto.RecentStudent;
import com.hostel.dto.RoomOccupancy;
import com.hostel.service.DashboardService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    public DashboardStats stats() {
        return dashboardService.getStats();
    }

    @GetMapping("/room-occupancy")
    public List<RoomOccupancy> roomOccupancy() {
        return dashboardService.getRoomOccupancy();
    }

    @GetMapping("/monthly-collections")
    public List<MonthlyCollection> monthlyCollections() {
        return dashboardService.getMonthlyCollections();
    }

    @GetMapping("/recent-students")
    public List<RecentStudent> recentStudents() {
        return dashboardService.getRecentStudents();
    }

    @GetMapping("/pending-complaints")
    public List<ComplaintSummary> pendingComplaints() {
        return dashboardService.getPendingComplaints();
    }
}
