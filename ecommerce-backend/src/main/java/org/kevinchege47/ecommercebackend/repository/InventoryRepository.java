package org.kevinchege47.ecommercebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.kevinchege47.ecommercebackend.model.InventoryItem;

import java.util.List;

public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {

    @Query("SELECT i FROM InventoryItem i WHERE i.quantity < :threshold ORDER BY i.quantity ASC")
    List<InventoryItem> findLowStock(@Param("threshold") int threshold);
}
