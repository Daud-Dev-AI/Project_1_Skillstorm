package com.skillstorm.inventory_management.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

/**
 * Data Transfer Object for InventoryItem entity.
 * Used for transferring inventory item data between client and server.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItemDto {

    /**
     * Unique identifier for the inventory item
     */
    private Long id;

    /**
     * Stock Keeping Unit - unique identifier for the product
     */
    @NotBlank(message = "SKU is required")
    private String sku;

    /**
     * Name of the product
     */
    @NotBlank(message = "Item name is required")
    private String name;

    /**
     * Detailed description of the product
     */
    private String description;

    /**
     * Category of the product
     */
    private String category;

    /**
     * Quantity of items in stock
     */
    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;

    /**
     * Storage location within the warehouse
     */
    private String storageLocation;

    /**
     * ID of the warehouse where this item is stored
     */
    @NotNull(message = "Warehouse ID is required")
    private Long warehouseId;

    /**
     * Name of the warehouse (for display purposes)
     */
    private String warehouseName;
}
