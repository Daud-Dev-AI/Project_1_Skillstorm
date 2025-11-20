package com.skillstorm.inventory_management.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;

/**
 * Data Transfer Object for Warehouse entity.
 * Used for transferring warehouse data between client and server.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseDto {

    /**
     * Unique identifier for the warehouse
     */
    private Long id;

    /**
     * Name of the warehouse
     */
    @NotBlank(message = "Warehouse name is required")
    private String name;

    /**
     * Physical location of the warehouse
     */
    @NotBlank(message = "Location is required")
    private String location;

    /**
     * Maximum capacity of items the warehouse can hold
     */
    @Min(value = 1, message = "Maximum capacity must be at least 1")
    private Integer maxCapacity;

    /**
     * Current total quantity of items in the warehouse
     */
    private Integer currentCapacity;

    /**
     * Available capacity remaining
     */
    private Integer availableCapacity;

    /**
     * Percentage of warehouse utilization
     */
    private Double utilizationPercentage;

    /**
     * Number of unique items in the warehouse
     */
    private Integer itemCount;
}
