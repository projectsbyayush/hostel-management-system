package com.hostel.repository;

import com.hostel.entity.Room;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RoomRepository extends JpaRepository<Room, Long> {

    Optional<Room> findByRoomNumber(String roomNumber);

    boolean existsByRoomNumber(String roomNumber);

    @Query("SELECT r FROM Room r WHERE LOWER(r.roomNumber) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Room> search(@Param("q") String q);

    @Query("SELECT COALESCE(SUM(r.capacity), 0) FROM Room r WHERE r.status <> 'MAINTENANCE'")
    int totalBookableBeds();
}
