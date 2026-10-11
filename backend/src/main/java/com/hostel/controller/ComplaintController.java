package com.hostel.controller;

import com.hostel.dto.ComplaintRequest;
import com.hostel.dto.ComplaintResponse;
import com.hostel.dto.ComplaintStatusUpdate;
import com.hostel.service.ComplaintService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @GetMapping
    public List<ComplaintResponse> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status) {
        return complaintService.list(q, status);
    }

    @GetMapping("/{id}")
    public ComplaintResponse getById(@PathVariable Long id) {
        return complaintService.getById(id);
    }

    @PostMapping
    public ResponseEntity<ComplaintResponse> create(@Valid @RequestBody ComplaintRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(complaintService.create(request));
    }

    @PutMapping("/{id}")
    public ComplaintResponse update(@PathVariable Long id, @Valid @RequestBody ComplaintRequest request) {
        return complaintService.update(id, request);
    }

    @PatchMapping("/{id}/status")
    public ComplaintResponse updateStatus(@PathVariable Long id, @Valid @RequestBody ComplaintStatusUpdate request) {
        return complaintService.updateStatus(id, request.status());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        complaintService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
