package org.kevinchege47.ecommercebackend.service;


import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kevinchege47.ecommercebackend.dto.Dtos;
import org.kevinchege47.ecommercebackend.exception.ResourceNotFoundException;
import org.kevinchege47.ecommercebackend.model.InventoryItem;
import org.kevinchege47.ecommercebackend.model.Order;
import org.kevinchege47.ecommercebackend.repository.InventoryRepository;
import org.kevinchege47.ecommercebackend.repository.OrderRepository;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("OrderService")
class OrderServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private InventoryRepository inventoryRepository;
    @Mock private InventoryService inventoryService;

    @InjectMocks
    private OrderService orderService;


    private InventoryItem makeItem(Long id, int quantity) {
        InventoryItem item = new InventoryItem();
        item.setId(id);
        item.setName("Test Item");
        item.setSku("SKU-001");
        item.setQuantity(quantity);
        item.setUnitPrice(new BigDecimal("500.00"));
        item.setCategory("Electronics");
        return item;
    }

    private Order makeOrder(Long id, Order.OrderStatus status, InventoryItem item, int qty) {
        Order order = new Order();
        order.setId(id);
        order.setCustomerName("Alice");
        order.setCustomerEmail("alice@example.com");
        order.setInventoryItem(item);
        order.setQuantity(qty);
        order.setTotalPrice(item.getUnitPrice().multiply(BigDecimal.valueOf(qty)));
        order.setStatus(status);
        order.setCreatedAt(LocalDateTime.now());
        return order;
    }

    private Dtos.PlaceOrderRequest makeRequest(Long itemId, int quantity) {
        Dtos.PlaceOrderRequest req = new Dtos.PlaceOrderRequest();
        req.setCustomerName("Alice");
        req.setCustomerEmail("alice@example.com");
        req.setInventoryItemId(itemId);
        req.setQuantity(quantity);
        return req;
    }


    @Nested
    @DisplayName("placeOrder()")
    class PlaceOrder {

        @Test
        @DisplayName("places order, deducts stock, and returns response")
        void placesOrderSuccessfully() {
            InventoryItem item = makeItem(1L, 20);
            when(inventoryService.getItemById(1L)).thenReturn(item);

            Order saved = makeOrder(10L, Order.OrderStatus.PROCESSING, item, 3);
            when(orderRepository.save(any(Order.class))).thenReturn(saved);

            Dtos.OrderResponse response = orderService.placeOrder(makeRequest(1L, 3));

            assertThat(response.getId()).isEqualTo(10L);
            assertThat(response.getStatus()).isEqualTo("PROCESSING");
            assertThat(item.getQuantity()).isEqualTo(17);
            verify(inventoryRepository).save(item);
            verify(orderRepository).save(any(Order.class));
        }

        @Test
        @DisplayName("total price is quantity × unit price")
        void calculatesTotalPriceCorrectly() {
            InventoryItem item = makeItem(1L, 10);
            when(inventoryService.getItemById(1L)).thenReturn(item);

            ArgumentCaptor<Order> captor = ArgumentCaptor.forClass(Order.class);
            Order saved = makeOrder(1L, Order.OrderStatus.PROCESSING, item, 4);
            when(orderRepository.save(captor.capture())).thenReturn(saved);

            orderService.placeOrder(makeRequest(1L, 4));

            assertThat(captor.getValue().getTotalPrice())
                    .isEqualByComparingTo(new BigDecimal("2000.00"));
        }

        @Test
        @DisplayName("throws IllegalStateException when stock is insufficient")
        void throwsWhenInsufficientStock() {
            InventoryItem item = makeItem(1L, 2); // only 2 in stock
            when(inventoryService.getItemById(1L)).thenReturn(item);

            assertThatThrownBy(() -> orderService.placeOrder(makeRequest(1L, 5)))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Insufficient stock");

            verify(inventoryRepository, never()).save(any());
            verify(orderRepository, never()).save(any());
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when item does not exist")
        void throwsWhenItemNotFound() {
            when(inventoryService.getItemById(99L))
                    .thenThrow(new ResourceNotFoundException("Inventory item not found with id: 99"));

            assertThatThrownBy(() -> orderService.placeOrder(makeRequest(99L, 1)))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("99");

            verify(orderRepository, never()).save(any());
        }

        @Test
        @DisplayName("order status defaults to PROCESSING")
        void orderStatusIsProcessing() {
            InventoryItem item = makeItem(1L, 10);
            when(inventoryService.getItemById(1L)).thenReturn(item);

            ArgumentCaptor<Order> captor = ArgumentCaptor.forClass(Order.class);
            Order saved = makeOrder(1L, Order.OrderStatus.PROCESSING, item, 1);
            when(orderRepository.save(captor.capture())).thenReturn(saved);

            orderService.placeOrder(makeRequest(1L, 1));

            assertThat(captor.getValue().getStatus()).isEqualTo(Order.OrderStatus.PROCESSING);
        }

        @Test
        @DisplayName("exact stock quantity — order succeeds and stock reaches zero")
        void exactStockQuantitySucceeds() {
            InventoryItem item = makeItem(1L, 5);
            when(inventoryService.getItemById(1L)).thenReturn(item);
            Order saved = makeOrder(1L, Order.OrderStatus.PROCESSING, item, 5);
            when(orderRepository.save(any())).thenReturn(saved);

            orderService.placeOrder(makeRequest(1L, 5));

            assertThat(item.getQuantity()).isZero();
        }
    }


    @Nested
    @DisplayName("cancelOrder()")
    class CancelOrder {

        @Test
        @DisplayName("cancels PROCESSING order and restores stock")
        void cancelsProcessingOrder() {
            InventoryItem item = makeItem(1L, 10);
            Order order = makeOrder(1L, Order.OrderStatus.PROCESSING, item, 3);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
            when(orderRepository.save(any())).thenReturn(order);

            Dtos.OrderResponse response = orderService.cancelOrder(1L);

            assertThat(response.getStatus()).isEqualTo("CANCELLED");
            assertThat(item.getQuantity()).isEqualTo(13);
            verify(inventoryRepository).save(item);
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when order does not exist")
        void throwsWhenOrderNotFound() {
            when(orderRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> orderService.cancelOrder(99L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("99");

            verify(inventoryRepository, never()).save(any());
        }

        @Test
        @DisplayName("throws IllegalStateException when order is already CANCELLED")
        void throwsWhenAlreadyCancelled() {
            InventoryItem item = makeItem(1L, 10);
            Order order = makeOrder(1L, Order.OrderStatus.CANCELLED, item, 2);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

            assertThatThrownBy(() -> orderService.cancelOrder(1L))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("already cancelled");

            verify(inventoryRepository, never()).save(any());
        }

        @Test
        @DisplayName("throws IllegalStateException when order is DELIVERED")
        void throwsWhenDelivered() {
            InventoryItem item = makeItem(1L, 10);
            Order order = makeOrder(1L, Order.OrderStatus.DELIVERED, item, 2);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

            assertThatThrownBy(() -> orderService.cancelOrder(1L))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Delivered orders cannot be cancelled");

            verify(inventoryRepository, never()).save(any());
        }

        @Test
        @DisplayName("stock is restored by the exact quantity ordered")
        void stockRestoredByExactQuantity() {
            InventoryItem item = makeItem(1L, 7);
            Order order = makeOrder(1L, Order.OrderStatus.PROCESSING, item, 4);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
            when(orderRepository.save(any())).thenReturn(order);

            orderService.cancelOrder(1L);

            assertThat(item.getQuantity()).isEqualTo(11); // 7 + 4
        }
    }


    @Nested
    @DisplayName("getOrders()")
    class GetOrders {

        @Test
        @DisplayName("returns all orders when no filters provided")
        void returnsAllOrdersWithNoFilter() {
            InventoryItem item = makeItem(1L, 10);
            when(orderRepository.findFiltered(null, null, null))
                    .thenReturn(List.of(
                            makeOrder(1L, Order.OrderStatus.PROCESSING, item, 1),
                            makeOrder(2L, Order.OrderStatus.DELIVERED, item, 2)
                    ));

            List<Dtos.OrderResponse> result = orderService.getOrders(null, null, null);

            assertThat(result).hasSize(2);
        }

        @Test
        @DisplayName("passes parsed status enum to repository")
        void passesStatusToRepository() {
            when(orderRepository.findFiltered(Order.OrderStatus.PROCESSING, null, null))
                    .thenReturn(List.of());

            orderService.getOrders("PROCESSING", null, null);

            verify(orderRepository).findFiltered(Order.OrderStatus.PROCESSING, null, null);
        }

        @Test
        @DisplayName("status filter is case-insensitive")
        void statusFilterCaseInsensitive() {
            when(orderRepository.findFiltered(Order.OrderStatus.DELIVERED, null, null))
                    .thenReturn(List.of());

            orderService.getOrders("delivered", null, null);

            verify(orderRepository).findFiltered(Order.OrderStatus.DELIVERED, null, null);
        }

        @Test
        @DisplayName("throws IllegalArgumentException for invalid status value")
        void throwsForInvalidStatus() {
            assertThatThrownBy(() -> orderService.getOrders("SHIPPED", null, null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Invalid status")
                    .hasMessageContaining("SHIPPED");
        }

        @Test
        @DisplayName("passes date range to repository")
        void passesDateRangeToRepository() {
            LocalDateTime from = LocalDateTime.of(2024, 1, 1, 0, 0);
            LocalDateTime to   = LocalDateTime.of(2024, 12, 31, 23, 59);
            when(orderRepository.findFiltered(null, from, to)).thenReturn(List.of());

            orderService.getOrders(null, from, to);

            verify(orderRepository).findFiltered(null, from, to);
        }

        @Test
        @DisplayName("blank status string is treated as no filter")
        void blankStatusTreatedAsNoFilter() {
            when(orderRepository.findFiltered(null, null, null)).thenReturn(List.of());

            orderService.getOrders("  ", null, null);

            verify(orderRepository).findFiltered(null, null, null);
        }
    }
}
