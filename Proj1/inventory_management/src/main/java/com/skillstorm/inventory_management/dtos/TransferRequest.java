package com.skillstorm.inventory_management.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

/**
 * Data Transfer Object for transferring inventory items between warehouses.
 * Encapsulates the details needed for a warehouse-to-warehouse transfer.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransferRequest {

    /**
     * ID of the inventory item to transfer
     */
    @NotNull(message = "Item ID is required")
    private Long itemId;

    /**
     * ID of the source warehouse
     */
    @NotNull(message = "Source warehouse ID is required")
    private Long sourceWarehouseId;

    /**
     * ID of the destination warehouse
     */
    @NotNull(message = "Destination warehouse ID is required")
    private Long destinationWarehouseId;

    /**
     * Quantity to transfer
     */
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Transfer quantity must be at least 1")
    private Integer quantity;
}
