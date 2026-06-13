package org.kevinchege47.ecommercebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.kevinchege47.ecommercebackend.model.Order;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("""
        SELECT o FROM Order o
        WHERE (:status IS NULL OR o.status = :status)
          AND (:from IS NULL OR o.createdAt >= :from)
          AND (:to IS NULL OR o.createdAt <= :to)
        ORDER BY o.createdAt DESC
    """)
    List<Order> findFiltered(
        @Param("status") Order.OrderStatus status,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to
    );
}
