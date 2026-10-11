package com.hostel.service;

import com.hostel.dto.StudentRequest;
import com.hostel.dto.StudentResponse;
import com.hostel.entity.Student;
import com.hostel.exception.ConflictException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.repository.AllocationRepository;
import com.hostel.repository.ComplaintRepository;
import com.hostel.repository.FeeRepository;
import com.hostel.repository.StudentRepository;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class StudentService {

    private final StudentRepository studentRepository;
    private final AllocationRepository allocationRepository;
    private final FeeRepository feeRepository;
    private final ComplaintRepository complaintRepository;

    public StudentService(StudentRepository studentRepository,
                          AllocationRepository allocationRepository,
                          FeeRepository feeRepository,
                          ComplaintRepository complaintRepository) {
        this.studentRepository = studentRepository;
        this.allocationRepository = allocationRepository;
        this.feeRepository = feeRepository;
        this.complaintRepository = complaintRepository;
    }

    @Transactional(readOnly = true)
    public List<StudentResponse> list(String q, String status) {
        List<Student> students;
        if (q != null && !q.isBlank() && status != null && !status.isBlank()) {
            students = studentRepository.search(q).stream()
                    .filter(s -> s.getStatus().name().equals(status))
                    .collect(Collectors.toList());
        } else if (q != null && !q.isBlank()) {
            students = studentRepository.search(q);
        } else if (status != null && !status.isBlank()) {
            students = studentRepository.findByStatus(com.hostel.model.StudentStatus.valueOf(status));
        } else {
            students = studentRepository.findAll();
        }
        return students.stream()
                .sorted(Comparator.comparing(Student::getAdmissionDate).reversed())
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StudentResponse getById(Long id) {
        return toResponse(studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found")));
    }

    public StudentResponse create(StudentRequest request) {
        if (studentRepository.existsByStudentId(request.studentId())) {
            throw new ConflictException("Student ID already exists: " + request.studentId());
        }
        if (studentRepository.existsByEmail(request.email())) {
            throw new ConflictException("A student with this email already exists");
        }

        Student student = new Student();
        student.setStudentId(request.studentId());
        student.setFullName(request.fullName());
        student.setEmail(request.email());
        student.setPhone(request.phone());
        student.setCourse(request.course());
        student.setYearOfStudy(request.yearOfStudy());
        student.setGuardianName(request.guardianName());
        student.setGuardianContact(request.guardianContact());
        student.setAddress(request.address());
        student.setAdmissionDate(request.admissionDate());
        student.setStatus(request.status());

        studentRepository.save(student);
        return toResponse(student);
    }

    public StudentResponse update(Long id, StudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (!student.getStudentId().equals(request.studentId())
                && studentRepository.existsByStudentId(request.studentId())) {
            throw new ConflictException("Student ID already exists: " + request.studentId());
        }
        if (!student.getEmail().equals(request.email())
                && studentRepository.existsByEmail(request.email())) {
            throw new ConflictException("A student with this email already exists");
        }

        student.setStudentId(request.studentId());
        student.setFullName(request.fullName());
        student.setEmail(request.email());
        student.setPhone(request.phone());
        student.setCourse(request.course());
        student.setYearOfStudy(request.yearOfStudy());
        student.setGuardianName(request.guardianName());
        student.setGuardianContact(request.guardianContact());
        student.setAddress(request.address());
        student.setAdmissionDate(request.admissionDate());
        student.setStatus(request.status());

        studentRepository.save(student);
        return toResponse(student);
    }

    public void delete(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (allocationRepository.existsByStudentId(student.getId())) {
            throw new ConflictException(
                    "Cannot delete " + student.getFullName() + ": student has room allocation records.");
        }
        if (feeRepository.existsByStudentId(student.getId())) {
            throw new ConflictException(
                    "Cannot delete " + student.getFullName() + ": student has fee records.");
        }
        if (complaintRepository.existsByStudentId(student.getId())) {
            throw new ConflictException(
                    "Cannot delete " + student.getFullName() + ": student has complaint records.");
        }
        studentRepository.delete(student);
    }

    private StudentResponse toResponse(Student s) {
        return new StudentResponse(
                s.getId(),
                s.getStudentId(),
                s.getFullName(),
                s.getEmail(),
                s.getPhone(),
                s.getCourse(),
                s.getYearOfStudy(),
                s.getGuardianName(),
                s.getGuardianContact(),
                s.getAddress(),
                s.getAdmissionDate(),
                s.getStatus(),
                s.getCreatedAt());
    }
}
