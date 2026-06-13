package org.kevinchege47.ecommercebackend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "inventory_item")
@Data
@NoArgsConstructor
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @NotBlank
    @Column(nullable = false, unique = true)
    private String sku;

    @Min(0)
    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column
    private String category;

    public void deductStock(int qty) {
        if (this.quantity < qty) {
            throw new IllegalStateException(
                "Insufficient stock for item '%s': available=%d, requested=%d"
                    .formatted(this.name, this.quantity, qty));
        }
        this.quantity -= qty;
    }

    public void restoreStock(int qty) {
        this.quantity += qty;
    }
}
