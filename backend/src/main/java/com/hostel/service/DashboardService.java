package com.hostel.service;

import com.hostel.dto.DashboardStats;
import com.hostel.dto.ComplaintSummary;
import com.hostel.dto.MonthlyCollection;
import com.hostel.dto.RecentStudent;
import com.hostel.dto.RoomOccupancy;
import com.hostel.entity.Allocation;
import com.hostel.entity.Fee;
import com.hostel.entity.Payment;
import com.hostel.entity.Room;
import com.hostel.repository.AllocationRepository;
import com.hostel.repository.ComplaintRepository;
import com.hostel.repository.DashboardRepository;
import com.hostel.repository.FeeRepository;
import com.hostel.repository.PaymentRepository;
import com.hostel.repository.RoomRepository;
import com.hostel.repository.StudentRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final StudentRepository studentRepository;
    private final RoomRepository roomRepository;
    private final AllocationRepository allocationRepository;
    private final FeeRepository feeRepository;
    private final PaymentRepository paymentRepository;
    private final ComplaintRepository complaintRepository;
    private final DashboardRepository dashboardRepository;

    public DashboardService(StudentRepository studentRepository,
                            RoomRepository roomRepository,
                            AllocationRepository allocationRepository,
                            FeeRepository feeRepository,
                            PaymentRepository paymentRepository,
                            ComplaintRepository complaintRepository,
                            DashboardRepository dashboardRepository) {
        this.studentRepository = studentRepository;
        this.roomRepository = roomRepository;
        this.allocationRepository = allocationRepository;
        this.feeRepository = feeRepository;
        this.paymentRepository = paymentRepository;
        this.complaintRepository = complaintRepository;
        this.dashboardRepository = dashboardRepository;
    }

    public DashboardStats getStats() {
        long totalStudents = studentRepository.count();
        long totalRooms = roomRepository.count();

        int bookableBeds = roomRepository.totalBookableBeds();
        long activeAllocations = allocationRepository.findByStatus(com.hostel.model.AllocationStatus.ACTIVE).size();
        int availableBeds = Math.max(bookableBeds - (int) activeAllocations, 0);

        BigDecimal pendingFeeBalance = BigDecimal.ZERO;
        for (Fee fee : feeRepository.findAllWithStudent()) {
            BigDecimal paid = paidAmount(fee.getId());
            pendingFeeBalance = pendingFeeBalance.add(fee.getAmount().subtract(paid).max(BigDecimal.ZERO));
        }

        long openComplaints = complaintRepository.findPending().size();

        return new DashboardStats(totalStudents, totalRooms, availableBeds, pendingFeeBalance, openComplaints);
    }

    public List<RoomOccupancy> getRoomOccupancy() {
        return roomRepository.findAll().stream()
                .map(this::toOccupancy)
                .collect(Collectors.toList());
    }

    public List<MonthlyCollection> getMonthlyCollections() {
        LocalDate since = LocalDate.now().minusMonths(5).withDayOfMonth(1);
        Map<String, BigDecimal> collected = new LinkedHashMap<>();
        for (Object[] row : dashboardRepository.monthlyCollections(since)) {
            collected.put((String) row[0], (BigDecimal) row[1]);
        }

        List<MonthlyCollection> result = new ArrayList<>();
        LocalDate month = since;
        LocalDate now = LocalDate.now();
        while (!month.isAfter(now)) {
            String key = month.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            result.add(new MonthlyCollection(
                    month.format(DateTimeFormatter.ofPattern("MMM yyyy")),
                    collected.getOrDefault(key, BigDecimal.ZERO)));
            month = month.plusMonths(1);
        }
        return result;
    }

    public List<RecentStudent> getRecentStudents() {
        return studentRepository.findAll().stream()
                .sorted((a, b) -> b.getAdmissionDate().compareTo(a.getAdmissionDate()))
                .limit(5)
                .map(s -> new RecentStudent(
                        s.getId(),
                        s.getStudentId(),
                        s.getFullName(),
                        s.getCourse(),
                        s.getYearOfStudy(),
                        s.getPhone(),
                        s.getAdmissionDate()))
                .collect(Collectors.toList());
    }

    public List<ComplaintSummary> getPendingComplaints() {
        return complaintRepository.findPending().stream()
                .limit(5)
                .map(c -> new ComplaintSummary(
                        c.getId(),
                        c.getComplaintId(),
                        c.getStudent().getFullName(),
                        c.getStudent().getStudentId(),
                        c.getCategory(),
                        c.getPriority().name(),
                        c.getStatus().name(),
                        c.getSubmittedAt()))
                .collect(Collectors.toList());
    }

    private RoomOccupancy toOccupancy(Room room) {
        int occupied = allocationRepository.countActiveByRoomId(room.getId());
        return new RoomOccupancy(
                room.getRoomNumber(),
                room.getRoomType().name(),
                room.getCapacity(),
                occupied,
                room.getCapacity() - occupied);
    }

    private BigDecimal paidAmount(Long feeId) {
        return paymentRepository.findByFeeIdOrderByPaymentDateDescIdDesc(feeId).stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
