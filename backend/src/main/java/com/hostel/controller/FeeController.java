package com.hostel.controller;

import com.hostel.dto.FeeRequest;
import com.hostel.dto.FeeResponse;
import com.hostel.dto.PaymentRequest;
import com.hostel.dto.PaymentResponse;
import com.hostel.service.FeeService;
import jakarta.validation.Valid;
import java.math.BigDecimal;
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
@RequestMapping("/api/fees")
public class FeeController {

    private final FeeService feeService;

    public FeeController(FeeService feeService) {
        this.feeService = feeService;
    }

    @GetMapping
    public List<FeeResponse> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status) {
        return feeService.list(q, status);
    }

    @GetMapping("/{id}")
    public FeeResponse getById(@PathVariable Long id) {
        return feeService.getById(id);
    }

    @PostMapping
    public ResponseEntity<FeeResponse> create(@Valid @RequestBody FeeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(feeService.create(request));
    }

    @PostMapping("/{id}/payments")
    public ResponseEntity<PaymentResponse> addPayment(
            @PathVariable Long id,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(feeService.addPayment(id, request));
    }

    @GetMapping("/{id}/payments")
    public List<PaymentResponse> paymentHistory(@PathVariable Long id) {
        return feeService.paymentHistory(id);
    }

    @GetMapping("/{id}/balance")
    public Balance balance(@PathVariable Long id) {
        return new Balance(feeService.balance(id));
    }

    public record Balance(BigDecimal balance) {
    }
}
