package com.hostel.service;

import com.hostel.dto.ComplaintResponse;
import com.hostel.dto.ComplaintRequest;
import com.hostel.dto.ComplaintStatusUpdate;
import com.hostel.entity.Complaint;
import com.hostel.entity.Room;
import com.hostel.entity.Student;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.ConflictException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.model.ComplaintStatus;
import com.hostel.repository.ComplaintRepository;
import com.hostel.repository.RoomRepository;
import com.hostel.repository.StudentRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final StudentRepository studentRepository;
    private final RoomRepository roomRepository;

    public ComplaintService(ComplaintRepository complaintRepository,
                          StudentRepository studentRepository,
                          RoomRepository roomRepository) {
        this.complaintRepository = complaintRepository;
        this.studentRepository = studentRepository;
        this.roomRepository = roomRepository;
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> list(String q, String status) {
        if (q != null && !q.isBlank() && status != null && !status.isBlank()) {
            return complaintRepository.searchByStatus(q, ComplaintStatus.valueOf(status)).stream()
                    .map(this::toResponse).collect(Collectors.toList());
        }
        if (q != null && !q.isBlank()) {
            return complaintRepository.search(q).stream().map(this::toResponse).collect(Collectors.toList());
        }
        if (status != null && !status.isBlank()) {
            return complaintRepository.findByStatus(ComplaintStatus.valueOf(status)).stream()
                    .map(this::toResponse).collect(Collectors.toList());
        }
        return complaintRepository.findAllWithDetails().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ComplaintResponse getById(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
        return toResponse(complaint);
    }

    public ComplaintResponse create(ComplaintRequest request) {
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Room room = null;
        if (request.roomId() != null) {
            room = roomRepository.findById(request.roomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        }

        Complaint complaint = new Complaint();
        complaint.setComplaintId(generateComplaintId());
        complaint.setStudent(student);
        complaint.setRoom(room);
        complaint.setCategory(request.category());
        complaint.setDescription(request.description());
        complaint.setPriority(request.priority());
        complaint.setStatus(ComplaintStatus.OPEN);

        complaintRepository.save(complaint);
        return toResponse(complaint);
    }

    public ComplaintResponse update(Long id, ComplaintRequest request) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Room room = null;
        if (request.roomId() != null) {
            room = roomRepository.findById(request.roomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        }

        complaint.setStudent(student);
        complaint.setRoom(room);
        complaint.setCategory(request.category());
        complaint.setDescription(request.description());
        complaint.setPriority(request.priority());

        complaintRepository.save(complaint);
        return toResponse(complaint);
    }

    public ComplaintResponse updateStatus(Long id, ComplaintStatus newStatus) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
        complaint.setStatus(newStatus);
        complaintRepository.save(complaint);
        return toResponse(complaint);
    }

    public void delete(Long id) {
        if (!complaintRepository.existsById(id)) {
            throw new ResourceNotFoundException("Complaint not found");
        }
        complaintRepository.deleteById(id);
    }

    private String generateComplaintId() {
        int next = complaintRepository.maxComplaintSequence() + 1;
        return String.format("CMP-2026-%03d", next);
    }

    private ComplaintResponse toResponse(Complaint c) {
        return new ComplaintResponse(
                c.getId(),
                c.getComplaintId(),
                c.getStudent().getFullName(),
                c.getStudent().getStudentId(),
                c.getStudent().getId(),
                c.getRoom() != null ? c.getRoom().getRoomNumber() : null,
                c.getRoom() != null ? c.getRoom().getId() : null,
                c.getCategory(),
                c.getDescription(),
                c.getPriority(),
                c.getStatus(),
                c.getSubmittedAt(),
                c.getUpdatedAt());
    }
}
