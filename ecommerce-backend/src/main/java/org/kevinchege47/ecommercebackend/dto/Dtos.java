package org.kevinchege47.ecommercebackend.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.kevinchege47.ecommercebackend.model.InventoryItem;
import org.kevinchege47.ecommercebackend.model.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Dtos {

    @Data
    public static class PlaceOrderRequest {
        @NotBlank(message = "customerName must not be blank")
        private String customerName;

        @NotBlank(message = "customerEmail must not be blank")
        @Email(message = "customerEmail must be a valid email address")
        private String customerEmail;

        @NotNull(message = "inventoryItemId is required")
        private Long inventoryItemId;

        @NotNull(message = "quantity is required")
        @Min(value = 1, message = "quantity must be at least 1")
        private Integer quantity;
    }


    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class OrderResponse {
        private Long id;
        private String customerName;
        private String customerEmail;
        private String itemName;
        private String itemSku;
        private Integer quantity;
        private BigDecimal totalPrice;
        private String status;
        private LocalDateTime createdAt;

        public static OrderResponse from(Order o) {
            return OrderResponse.builder()
                .id(o.getId())
                .customerName(o.getCustomerName())
                .customerEmail(o.getCustomerEmail())
                .itemName(o.getInventoryItem().getName())
                .itemSku(o.getInventoryItem().getSku())
                .quantity(o.getQuantity())
                .totalPrice(o.getTotalPrice())
                .status(o.getStatus().name())
                .createdAt(o.getCreatedAt())
                .build();
        }
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class InventoryResponse {
        private Long id;
        private String name;
        private String sku;
        private Integer quantity;
        private BigDecimal unitPrice;
        private String category;
        private boolean lowStock;

        public static InventoryResponse from(InventoryItem item, int threshold) {
            return InventoryResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .sku(item.getSku())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .category(item.getCategory())
                .lowStock(item.getQuantity() < threshold)
                .build();
        }
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class FareResponse {
        private double distanceKm;
        private double baseFare;
        private double distanceCharge;
        private double surgeMultiplier;
        private double calculatedFare;
        private double finalFare;
        private boolean minimumApplied;
        private String currency;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ErrorResponse {
        private int status;
        private String error;
        private Object details;
        private LocalDateTime timestamp;
    }
}
