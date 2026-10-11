package com.hostel.controller;

import com.hostel.dto.AllocationRequest;
import com.hostel.dto.AllocationResponse;
import com.hostel.service.AllocationService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/allocations")
public class AllocationController {

    private final AllocationService allocationService;

    public AllocationController(AllocationService allocationService) {
        this.allocationService = allocationService;
    }

    @GetMapping
    public List<AllocationResponse> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status) {
        return allocationService.list(q, status);
    }

    @PostMapping
    public ResponseEntity<AllocationResponse> allot(@Valid @RequestBody AllocationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(allocationService.allot(request));
    }

    @PostMapping("/{id}/checkout")
    public AllocationResponse checkout(@PathVariable Long id) {
        return allocationService.checkout(id);
    }
}
