package org.kevinchege47.ecommercebackend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kevinchege47.ecommercebackend.dto.Dtos;
import org.kevinchege47.ecommercebackend.exception.ResourceNotFoundException;
import org.kevinchege47.ecommercebackend.model.InventoryItem;
import org.kevinchege47.ecommercebackend.repository.InventoryRepository;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("InventoryService")
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @InjectMocks
    private InventoryService inventoryService;


    private InventoryItem makeItem(Long id, String name, int quantity) {
        InventoryItem item = new InventoryItem();
        item.setId(id);
        item.setName(name);
        item.setSku("SKU-00" + id);
        item.setQuantity(quantity);
        item.setUnitPrice(new BigDecimal("1000.00"));
        item.setCategory("Electronics");
        return item;
    }

    @BeforeEach
    void setThreshold() {
        ReflectionTestUtils.setField(inventoryService, "lowStockThreshold", 10);
    }

    // ── getAllItems ───────────────────────────────────────────────────────

    @Nested
    @DisplayName("getAllItems()")
    class GetAllItems {

        @Test
        @DisplayName("returns all items mapped to InventoryResponse")
        void returnsAllItems() {
            when(inventoryRepository.findAll())
                    .thenReturn(List.of(
                            makeItem(1L, "Keyboard", 25),
                            makeItem(2L, "Mouse", 5)
                    ));

            List<Dtos.InventoryResponse> result = inventoryService.getAllItems();

            assertThat(result).hasSize(2);
            assertThat(result).extracting(Dtos.InventoryResponse::getName)
                    .containsExactly("Keyboard", "Mouse");
        }

        @Test
        @DisplayName("sets lowStock=true for items below threshold")
        void flagsLowStockCorrectly() {
            when(inventoryRepository.findAll())
                    .thenReturn(List.of(
                            makeItem(1L, "Keyboard", 25),
                            makeItem(2L, "Mouse", 5)
                    ));

            List<Dtos.InventoryResponse> result = inventoryService.getAllItems();

            assertThat(result.get(0).isLowStock()).isFalse();
            assertThat(result.get(1).isLowStock()).isTrue();
        }

        @Test
        @DisplayName("item exactly at threshold is NOT flagged as low stock")
        void itemAtThresholdNotFlagged() {
            when(inventoryRepository.findAll())
                    .thenReturn(List.of(makeItem(1L, "Cable", 10)));

            List<Dtos.InventoryResponse> result = inventoryService.getAllItems();

            assertThat(result.get(0).isLowStock()).isFalse();
        }

        @Test
        @DisplayName("returns empty list when repository is empty")
        void emptyRepository() {
            when(inventoryRepository.findAll()).thenReturn(List.of());

            List<Dtos.InventoryResponse> result = inventoryService.getAllItems();

            assertThat(result).isEmpty();
        }
    }


    @Nested
    @DisplayName("getLowStockItems()")
    class GetLowStockItems {

        @Test
        @DisplayName("delegates to repository with configured threshold")
        void delegatesToRepository() {
            when(inventoryRepository.findLowStock(10))
                    .thenReturn(List.of(makeItem(1L, "Mouse", 3)));

            List<Dtos.InventoryResponse> result = inventoryService.getLowStockItems();

            verify(inventoryRepository).findLowStock(10);
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getName()).isEqualTo("Mouse");
            assertThat(result.get(0).isLowStock()).isTrue();
        }

        @Test
        @DisplayName("returns empty list when nothing is low stock")
        void nothingLowStock() {
            when(inventoryRepository.findLowStock(10)).thenReturn(List.of());

            List<Dtos.InventoryResponse> result = inventoryService.getLowStockItems();

            assertThat(result).isEmpty();
        }
    }


    @Nested
    @DisplayName("getItemById()")
    class GetItemById {

        @Test
        @DisplayName("returns item when found")
        void returnsItemWhenFound() {
            InventoryItem item = makeItem(1L, "Keyboard", 20);
            when(inventoryRepository.findById(1L)).thenReturn(Optional.of(item));

            InventoryItem result = inventoryService.getItemById(1L);

            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getName()).isEqualTo("Keyboard");
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when item does not exist")
        void throwsWhenNotFound() {
            when(inventoryRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> inventoryService.getItemById(99L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("99");
        }
    }
}
