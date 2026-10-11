package com.hostel.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public class DashboardRepository {

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Native query: total payments collected per month (format yyyy-MM),
     * for months on or after the given date.
     */
    @SuppressWarnings("unchecked")
    public List<Object[]> monthlyCollections(LocalDate since) {
        return entityManager
                .createNativeQuery(
                        "SELECT DATE_FORMAT(p.payment_date, '%Y-%m') AS month, SUM(p.amount) AS total " +
                        "FROM payments p " +
                        "WHERE p.payment_date >= :since " +
                        "GROUP BY DATE_FORMAT(p.payment_date, '%Y-%m') " +
                        "ORDER BY month")
                .setParameter("since", since)
                .getResultList();
    }
}
