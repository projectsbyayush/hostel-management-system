package com.hostel.repository;

import com.hostel.entity.Complaint;
import com.hostel.model.ComplaintStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    Optional<Complaint> findByComplaintId(String complaintId);

    @Query("SELECT c FROM Complaint c JOIN FETCH c.student LEFT JOIN FETCH c.room ORDER BY c.submittedAt DESC")
    List<Complaint> findAllWithDetails();

    @Query("SELECT c FROM Complaint c JOIN FETCH c.student LEFT JOIN FETCH c.room WHERE c.status = :status ORDER BY c.submittedAt DESC")
    List<Complaint> findByStatus(@Param("status") ComplaintStatus status);

    @Query("SELECT c FROM Complaint c JOIN FETCH c.student LEFT JOIN FETCH c.room WHERE c.status <> 'RESOLVED' ORDER BY c.submittedAt DESC")
    List<Complaint> findPending();

    @Query("SELECT c FROM Complaint c JOIN FETCH c.student LEFT JOIN FETCH c.room WHERE " +
           "LOWER(c.complaintId) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(c.student.fullName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(c.category) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Complaint> search(@Param("q") String q);

    @Query("SELECT c FROM Complaint c JOIN FETCH c.student LEFT JOIN FETCH c.room WHERE c.status = :status AND (" +
           "LOWER(c.complaintId) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(c.student.fullName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(c.category) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Complaint> searchByStatus(@Param("q") String q, @Param("status") ComplaintStatus status);

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(c.complaintId, 10) AS int)), 0) FROM Complaint c WHERE c.complaintId LIKE 'CMP-2026-%'")
    int maxComplaintSequence();

    boolean existsByStudentId(Long studentId);
}
