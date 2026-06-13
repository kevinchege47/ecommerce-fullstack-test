package org.kevinchege47.ecommercebackend.service;


import lombok.RequiredArgsConstructor;
import org.kevinchege47.ecommercebackend.dto.Dtos;
import org.kevinchege47.ecommercebackend.exception.ResourceNotFoundException;
import org.kevinchege47.ecommercebackend.model.InventoryItem;
import org.kevinchege47.ecommercebackend.model.Order;
import org.kevinchege47.ecommercebackend.repository.InventoryRepository;
import org.kevinchege47.ecommercebackend.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryService inventoryService;

    @Transactional
    public Dtos.OrderResponse placeOrder(Dtos.PlaceOrderRequest req) {
        InventoryItem item = inventoryService.getItemById(req.getInventoryItemId());

        item.deductStock(req.getQuantity());
        inventoryRepository.save(item);

        Order order = new Order();
        order.setCustomerName(req.getCustomerName());
        order.setCustomerEmail(req.getCustomerEmail());
        order.setInventoryItem(item);
        order.setQuantity(req.getQuantity());
        order.setTotalPrice(item.getUnitPrice().multiply(BigDecimal.valueOf(req.getQuantity())));
        order.setStatus(Order.OrderStatus.PROCESSING);
         order.setCreatedAt(LocalDateTime.now());

         return Dtos.OrderResponse.from(orderRepository.save(order));
     }

    @Transactional
    public Dtos.OrderResponse cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Order not found with id: " + orderId));

        if (order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new IllegalStateException("Order " + orderId + " is already cancelled");
        }
        if (order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new IllegalStateException("Delivered orders cannot be cancelled");
        }

        InventoryItem item = order.getInventoryItem();
        item.restoreStock(order.getQuantity());
        inventoryRepository.save(item);

        order.setStatus(Order.OrderStatus.CANCELLED);
        return Dtos.OrderResponse.from(orderRepository.save(order));
    }

    public List<Dtos.OrderResponse> getOrders(String status, LocalDateTime from, LocalDateTime to) {
        Order.OrderStatus parsedStatus = null;
        if (status != null && !status.isBlank()) {
            try {
                parsedStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException(
                    "Invalid status '%s'. Accepted values: PROCESSING, DELIVERED, CANCELLED"
                        .formatted(status));
            }
        }
        return orderRepository.findFiltered(parsedStatus, from, to).stream()
            .map(Dtos.OrderResponse::from)
            .toList();
    }
}
