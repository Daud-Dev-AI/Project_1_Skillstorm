package com.skillstorm.inventory_management.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Entity class representing an Inventory Item in the warehouse.
 * Each item belongs to a specific warehouse and contains product information.
 */
@Entity
@Table(name = "inventory_items",
       uniqueConstraints = @UniqueConstraint(columnNames = {"sku", "warehouse_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItem {

    /**
     * Unique identifier for the inventory item
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Stock Keeping Unit - unique identifier for the product
     * SKU combined with warehouse_id must be unique (same product can exist in multiple warehouses)
     */
    @Column(nullable = false)
    @NotBlank(message = "SKU is required")
    private String sku;

    /**
     * Name of the product
     */
    @Column(nullable = false)
    @NotBlank(message = "Item name is required")
    private String name;

    /**
     * Detailed description of the product
     */
    @Column(length = 1000)
    private String description;

    /**
     * Category of the product (e.g., Electronics, Furniture, etc.)
     */
    private String category;

    /**
     * Quantity of items in stock
     */
    @Column(nullable = false)
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;

    /**
     * Storage location within the warehouse (e.g., Aisle A, Shelf 5)
     */
    private String storageLocation;

    /**
     * The warehouse where this item is stored
     * JsonIgnore prevents circular reference during serialization
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    @JsonIgnore
    private Warehouse warehouse;

    /**
     * Helper method to get warehouse ID without loading the full warehouse entity
     *
     * @return Warehouse ID
     */
    @Transient
    public Long getWarehouseId() {
        return warehouse != null ? warehouse.getId() : null;
    }
}
