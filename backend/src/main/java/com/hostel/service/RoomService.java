package com.hostel.service;

import com.hostel.dto.RoomRequest;
import com.hostel.dto.RoomResponse;
import com.hostel.entity.Room;
import com.hostel.exception.ConflictException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.model.RoomStatus;
import com.hostel.repository.AllocationRepository;
import com.hostel.repository.RoomRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class RoomService {

    private final RoomRepository roomRepository;
    private final AllocationRepository allocationRepository;

    public RoomService(RoomRepository roomRepository, AllocationRepository allocationRepository) {
        this.roomRepository = roomRepository;
        this.allocationRepository = allocationRepository;
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> list(String q, String status, String type) {
        List<Room> rooms;
        if (q != null && !q.isBlank()) {
            rooms = roomRepository.search(q);
        } else {
            rooms = roomRepository.findAll();
        }

        return rooms.stream()
                .filter(r -> (type == null || type.isBlank()) || r.getRoomType().name().equals(type))
                .sorted((a, b) -> a.getRoomNumber().compareTo(b.getRoomNumber()))
                .map(this::toResponse)
                .filter(r -> matchesStatus(r, status))
                .collect(Collectors.toList());
    }

    private boolean matchesStatus(RoomResponse room, String status) {
        if (status == null || status.isBlank()) {
            return true;
        }
        switch (status) {
            case "AVAILABLE":
                return room.status() == RoomStatus.AVAILABLE;
            case "MAINTENANCE":
                return room.status() == RoomStatus.MAINTENANCE;
            case "FULL":
                return room.status() != RoomStatus.MAINTENANCE
                        && room.occupied() >= room.capacity();
            case "PARTIAL":
                return room.status() != RoomStatus.MAINTENANCE
                        && room.occupied() > 0 && room.occupied() < room.capacity();
            default:
                return false;
        }
    }

    @Transactional(readOnly = true)
    public RoomResponse getById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        return toResponse(room);
    }

    public RoomResponse create(RoomRequest request) {
        if (roomRepository.existsByRoomNumber(request.roomNumber())) {
            throw new ConflictException("Room number already exists: " + request.roomNumber());
        }

        Room room = new Room();
        room.setRoomNumber(request.roomNumber());
        room.setFloorNo(request.floorNo());
        room.setRoomType(request.roomType());
        room.setCapacity(request.capacity());
        room.setMonthlyFee(request.monthlyFee());
        room.setStatus(request.status());

        roomRepository.save(room);
        return toResponse(room);
    }

    public RoomResponse update(Long id, RoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        if (!room.getRoomNumber().equals(request.roomNumber())
                && roomRepository.existsByRoomNumber(request.roomNumber())) {
            throw new ConflictException("Room number already exists: " + request.roomNumber());
        }

        int occupied = allocationRepository.countActiveByRoomId(room.getId());
        if (request.capacity() < occupied) {
            throw new ConflictException(
                    "Capacity cannot be reduced below the number of currently allocated students (" + occupied + ")");
        }

        room.setRoomNumber(request.roomNumber());
        room.setFloorNo(request.floorNo());
        room.setRoomType(request.roomType());
        room.setCapacity(request.capacity());
        room.setMonthlyFee(request.monthlyFee());
        room.setStatus(request.status());

        roomRepository.save(room);
        return toResponse(room);
    }

    public void delete(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        long allocations = allocationRepository.countByRoomId(room.getId());
        if (allocations > 0) {
            throw new ConflictException(
                    "Cannot delete room " + room.getRoomNumber() + ": it has existing allocation records.");
        }
        roomRepository.delete(room);
    }

    private RoomResponse toResponse(Room room) {
        int occupied = allocationRepository.countActiveByRoomId(room.getId());
        return new RoomResponse(
                room.getId(),
                room.getRoomNumber(),
                room.getFloorNo(),
                room.getRoomType(),
                room.getCapacity(),
                occupied,
                room.getCapacity() - occupied,
                room.getMonthlyFee(),
                room.getStatus());
    }
}
