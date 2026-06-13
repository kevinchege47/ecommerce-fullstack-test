package org.kevinchege47.ecommercebackend.service;


import lombok.RequiredArgsConstructor;
import org.kevinchege47.ecommercebackend.dto.Dtos;
import org.kevinchege47.ecommercebackend.exception.ResourceNotFoundException;
import org.kevinchege47.ecommercebackend.model.InventoryItem;
import org.kevinchege47.ecommercebackend.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    @Value("${inventory.low-stock-threshold:10}")
    private int lowStockThreshold;

    public List<Dtos.InventoryResponse> getAllItems() {
        return inventoryRepository.findAll().stream()
            .map(item -> Dtos.InventoryResponse.from(item, lowStockThreshold))
            .toList();
    }

    public List<Dtos.InventoryResponse> getLowStockItems() {
        return inventoryRepository.findLowStock(lowStockThreshold).stream()
            .map(item -> Dtos.InventoryResponse.from(item, lowStockThreshold))
            .toList();
    }

    public InventoryItem getItemById(Long id) {
        return inventoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Inventory item not found with id: " + id));
    }
}
