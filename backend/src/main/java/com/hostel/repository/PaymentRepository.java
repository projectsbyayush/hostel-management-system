package com.hostel.repository;

import com.hostel.entity.Payment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByFeeIdOrderByPaymentDateDescIdDesc(Long feeId);

    List<Payment> findByReference(String reference);
}
