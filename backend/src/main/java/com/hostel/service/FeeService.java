package com.hostel.service;

import com.hostel.dto.FeeRequest;
import com.hostel.dto.FeeResponse;
import com.hostel.dto.PaymentRequest;
import com.hostel.dto.PaymentResponse;
import com.hostel.entity.Fee;
import com.hostel.entity.Payment;
import com.hostel.entity.Student;
import com.hostel.exception.ConflictException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.model.FeeStatus;
import com.hostel.repository.FeeRepository;
import com.hostel.repository.PaymentRepository;
import com.hostel.repository.StudentRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class FeeService {

    private final FeeRepository feeRepository;
    private final PaymentRepository paymentRepository;
    private final StudentRepository studentRepository;

    public FeeService(FeeRepository feeRepository,
                    PaymentRepository paymentRepository,
                    StudentRepository studentRepository) {
        this.feeRepository = feeRepository;
        this.paymentRepository = paymentRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional(readOnly = true)
    public List<FeeResponse> list(String q, String status) {
        List<Fee> fees;
        if (q != null && !q.isBlank()) {
            fees = feeRepository.search(q);
        } else {
            fees = feeRepository.findAllWithStudent();
        }

        return fees.stream()
                .sorted((a, b) -> b.getDueDate().compareTo(a.getDueDate()))
                .map(this::toResponse)
                .filter(r -> status == null || status.isBlank() || r.status().name().equals(status))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FeeResponse getById(Long id) {
        Fee fee = feeRepository.findByIdWithStudent(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee record not found"));
        return toResponse(fee);
    }

    public FeeResponse create(FeeRequest request) {
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Fee fee = new Fee();
        fee.setStudent(student);
        fee.setAmount(request.amount().setScale(2, RoundingMode.HALF_UP));
        fee.setDueDate(request.dueDate());
        fee.setPeriod(request.period());

        feeRepository.save(fee);
        return toResponse(fee);
    }

    public PaymentResponse addPayment(Long feeId, PaymentRequest request) {
        Fee fee = feeRepository.findByIdWithStudent(feeId)
                .orElseThrow(() -> new ResourceNotFoundException("Fee record not found"));

        BigDecimal amount = request.amount().setScale(2, RoundingMode.HALF_UP);
        BigDecimal balance = balanceOf(fee);

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ConflictException("Payment amount must be greater than zero.");
        }
        if (amount.compareTo(balance) > 0) {
            throw new ConflictException(
                    "Payment amount (" + amount + ") exceeds the outstanding balance (" + balance + ").");
        }
        if (request.reference() != null && !request.reference().isBlank()
                && !paymentRepository.findByReference(request.reference()).isEmpty()) {
            throw new ConflictException("Payment reference already used: " + request.reference());
        }

        Payment payment = new Payment();
        payment.setFee(fee);
        payment.setAmount(amount);
        payment.setPaymentDate(request.paymentDate() != null ? request.paymentDate() : java.time.LocalDate.now());
        payment.setMethod(request.method());
        payment.setReference(request.reference());
        payment.setNote(request.note());

        paymentRepository.save(payment);
        return toPaymentResponse(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> paymentHistory(Long feeId) {
        return paymentRepository.findByFeeIdOrderByPaymentDateDescIdDesc(feeId).stream()
                .map(this::toPaymentResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BigDecimal balance(Long feeId) {
        Fee fee = feeRepository.findByIdWithStudent(feeId)
                .orElseThrow(() -> new ResourceNotFoundException("Fee record not found"));
        return balanceOf(fee);
    }

    private BigDecimal balanceOf(Fee fee) {
        BigDecimal paid = paymentRepository.findByFeeIdOrderByPaymentDateDescIdDesc(fee.getId()).stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return fee.getAmount().subtract(paid).max(BigDecimal.ZERO);
    }

    private FeeResponse toResponse(Fee fee) {
        List<Payment> payments = paymentRepository.findByFeeIdOrderByPaymentDateDescIdDesc(fee.getId());
        BigDecimal paid = payments.stream().map(Payment::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal balance = fee.getAmount().subtract(paid).max(BigDecimal.ZERO);

        FeeStatus status;
        if (balance.compareTo(BigDecimal.ZERO) == 0) {
            status = FeeStatus.PAID;
        } else if (paid.compareTo(BigDecimal.ZERO) > 0) {
            status = FeeStatus.PARTIALLY_PAID;
        } else {
            status = FeeStatus.PENDING;
        }

        return new FeeResponse(
                fee.getId(),
                fee.getStudent().getFullName(),
                fee.getStudent().getStudentId(),
                fee.getAmount().setScale(2, RoundingMode.HALF_UP),
                paid.setScale(2, RoundingMode.HALF_UP),
                balance.setScale(2, RoundingMode.HALF_UP),
                fee.getDueDate(),
                fee.getPeriod(),
                status,
                fee.getCreatedAt(),
                payments.stream().map(this::toPaymentResponse).collect(Collectors.toList()));
    }

    private PaymentResponse toPaymentResponse(Payment p) {
        return new PaymentResponse(
                p.getId(),
                p.getAmount().setScale(2, RoundingMode.HALF_UP),
                p.getPaymentDate(),
                p.getMethod(),
                p.getReference(),
                p.getNote(),
                p.getCreatedAt());
    }
}
