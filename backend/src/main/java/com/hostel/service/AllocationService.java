package com.hostel.service;

import com.hostel.dto.AllocationRequest;
import com.hostel.dto.AllocationResponse;
import com.hostel.entity.Allocation;
import com.hostel.entity.Room;
import com.hostel.entity.Student;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.ConflictException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.model.AllocationStatus;
import com.hostel.model.RoomStatus;
import com.hostel.repository.AllocationRepository;
import com.hostel.repository.RoomRepository;
import com.hostel.repository.StudentRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AllocationService {

    private final AllocationRepository allocationRepository;
    private final StudentRepository studentRepository;
    private final RoomRepository roomRepository;

    public AllocationService(AllocationRepository allocationRepository,
                            StudentRepository studentRepository,
                            RoomRepository roomRepository) {
        this.allocationRepository = allocationRepository;
        this.studentRepository = studentRepository;
        this.roomRepository = roomRepository;
    }

    @Transactional(readOnly = true)
    public List<AllocationResponse> list(String q, String status) {
        List<Allocation> allocations;
        if (q != null && !q.isBlank() && status != null && !status.isBlank()) {
            allocations = allocationRepository.searchByStatus(q, AllocationStatus.valueOf(status));
        } else if (q != null && !q.isBlank()) {
            allocations = allocationRepository.search(q);
        } else if (status != null && !status.isBlank()) {
            allocations = allocationRepository.findByStatus(AllocationStatus.valueOf(status));
        } else {
            allocations = allocationRepository.findAllWithDetails();
        }
        return allocations.stream()
                .sorted((a, b) -> {
                    int byStatus = b.getStatus().compareTo(a.getStatus());
                    return byStatus != 0 ? byStatus : b.getAllotmentDate().compareTo(a.getAllotmentDate());
                })
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public AllocationResponse allot(AllocationRequest request) {
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Room room = roomRepository.findById(request.roomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        if (allocationRepository.existsByStudentIdAndStatus(student.getId(), AllocationStatus.ACTIVE)) {
            throw new ConflictException(
                    student.getFullName() + " already has an active room allocation.");
        }

        if (room.getStatus() == RoomStatus.MAINTENANCE) {
            throw new ConflictException("Room " + room.getRoomNumber() + " is under maintenance.");
        }

        int occupied = allocationRepository.countActiveByRoomId(room.getId());
        if (occupied >= room.getCapacity()) {
            throw new ConflictException("Room " + room.getRoomNumber() + " is already full.");
        }

        Allocation allocation = new Allocation();
        allocation.setStudent(student);
        allocation.setRoom(room);
        allocation.setAllotmentDate(request.allotmentDate());
        allocation.setStatus(AllocationStatus.ACTIVE);

        allocationRepository.save(allocation);
        return toResponse(allocation);
    }

    public AllocationResponse checkout(Long id) {
        Allocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation not found"));

        if (allocation.getStatus() == AllocationStatus.CHECKED_OUT) {
            throw new BadRequestException("This student has already been checked out.");
        }

        allocation.setStatus(AllocationStatus.CHECKED_OUT);
        allocation.setCheckoutDate(LocalDate.now());
        allocationRepository.save(allocation);
        return toResponse(allocation);
    }

    private AllocationResponse toResponse(Allocation a) {
        return new AllocationResponse(
                a.getId(),
                a.getStudent().getFullName(),
                a.getStudent().getStudentId(),
                a.getRoom().getRoomNumber(),
                a.getRoom().getRoomType().name(),
                a.getAllotmentDate(),
                a.getCheckoutDate(),
                a.getStatus().name());
    }
}
