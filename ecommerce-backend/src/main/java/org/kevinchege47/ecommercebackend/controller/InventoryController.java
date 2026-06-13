package org.kevinchege47.ecommercebackend.controller;


import lombok.RequiredArgsConstructor;
import org.kevinchege47.ecommercebackend.dto.Dtos;
import org.kevinchege47.ecommercebackend.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<Dtos.InventoryResponse>> getAllItems() {
        return ResponseEntity.ok(inventoryService.getAllItems());
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Dtos.InventoryResponse>> getLowStockItems() {
        return ResponseEntity.ok(inventoryService.getLowStockItems());
    }
}
