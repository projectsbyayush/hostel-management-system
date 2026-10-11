package com.hostel.repository;

import com.hostel.entity.Student;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByStudentId(String studentId);

    Optional<Student> findByEmail(String email);

    boolean existsByStudentId(String studentId);

    boolean existsByEmail(String email);

    @Query("SELECT s FROM Student s WHERE " +
           "LOWER(s.fullName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(s.studentId) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "s.phone LIKE CONCAT('%', :q, '%')")
    List<Student> search(@Param("q") String q);

    @Query("SELECT s FROM Student s WHERE s.status = :status")
    List<Student> findByStatus(@Param("status") com.hostel.model.StudentStatus status);
}
