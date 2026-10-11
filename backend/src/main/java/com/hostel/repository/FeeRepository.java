package com.hostel.repository;

import com.hostel.entity.Fee;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FeeRepository extends JpaRepository<Fee, Long> {

    @Query("SELECT f FROM Fee f JOIN FETCH f.student")
    List<Fee> findAllWithStudent();

    @Query("SELECT f FROM Fee f JOIN FETCH f.student WHERE f.id = :id")
    Optional<Fee> findByIdWithStudent(@Param("id") Long id);

    @Query("SELECT f FROM Fee f JOIN FETCH f.student WHERE " +
           "LOWER(f.student.fullName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(f.student.studentId) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Fee> search(@Param("q") String q);

    @Query("SELECT COALESCE(SUM(f.amount), 0) FROM Fee f")
    java.math.BigDecimal totalFeeAmount();

    boolean existsByStudentId(Long studentId);
}
