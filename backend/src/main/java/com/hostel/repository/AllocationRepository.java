package com.hostel.repository;

import com.hostel.entity.Allocation;
import com.hostel.model.AllocationStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AllocationRepository extends JpaRepository<Allocation, Long> {

    @Query("SELECT COUNT(a) FROM Allocation a WHERE a.room.id = :roomId AND a.status = 'ACTIVE'")
    int countActiveByRoomId(@Param("roomId") Long roomId);

    boolean existsByStudentIdAndStatus(Long studentId, AllocationStatus status);

    boolean existsByStudentId(Long studentId);

    int countByRoomId(Long roomId);

    Optional<Allocation> findByStudentIdAndStatus(Long studentId, AllocationStatus status);

    @Query("SELECT a FROM Allocation a JOIN FETCH a.student JOIN FETCH a.room WHERE a.status = :status")
    List<Allocation> findByStatus(@Param("status") AllocationStatus status);

    @Query("SELECT a FROM Allocation a JOIN FETCH a.student JOIN FETCH a.room")
    List<Allocation> findAllWithDetails();

    @Query("SELECT a FROM Allocation a JOIN FETCH a.student JOIN FETCH a.room WHERE " +
           "LOWER(a.student.fullName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(a.student.studentId) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(a.room.roomNumber) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Allocation> search(@Param("q") String q);

    @Query("SELECT a FROM Allocation a JOIN FETCH a.student JOIN FETCH a.room WHERE a.status = :status AND (" +
           "LOWER(a.student.fullName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(a.student.studentId) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(a.room.roomNumber) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Allocation> searchByStatus(@Param("q") String q, @Param("status") AllocationStatus status);
}
