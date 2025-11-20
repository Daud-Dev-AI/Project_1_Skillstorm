package com.skillstorm.inventory_management.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;

import java.util.ArrayList;
import java.util.List;

/**
 * Entity class representing a Warehouse in the inventory management system.
 * A warehouse can store multiple inventory items and has a maximum capacity limit.
 */
@Entity
@Table(name = "warehouses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Warehouse {

    /**
     * Unique identifier for the warehouse
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Name of the warehouse
     */
    @Column(nullable = false)
    @NotBlank(message = "Warehouse name is required")
    private String name;

    /**
     * Physical location of the warehouse
     */
    @Column(nullable = false)
    @NotBlank(message = "Location is required")
    private String location;

    /**
     * Maximum capacity of items the warehouse can hold
     */
    @Column(nullable = false)
    @Min(value = 1, message = "Maximum capacity must be at least 1")
    private Integer maxCapacity;

    /**
     * List of inventory items stored in this warehouse
     * Cascade operations ensure items are managed with the warehouse
     * Orphan removal ensures items are deleted when removed from warehouse
     */
    @OneToMany(mappedBy = "warehouse", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InventoryItem> items = new ArrayList<>();

    /**
     * Calculates the current total quantity of items in the warehouse
     *
     * @return Total quantity of all items
     */
    @Transient
    public Integer getCurrentCapacity() {
        return items.stream()
                .mapToInt(InventoryItem::getQuantity)
                .sum();
    }

    /**
     * Checks if the warehouse has available capacity
     *
     * @param quantityToAdd Quantity to be added
     * @return true if there is sufficient capacity, false otherwise
     */
    @Transient
    public boolean hasCapacity(int quantityToAdd) {
        return getCurrentCapacity() + quantityToAdd <= maxCapacity;
    }

    /**
     * Gets the available capacity remaining in the warehouse
     *
     * @return Available capacity
     */
    @Transient
    public Integer getAvailableCapacity() {
        return maxCapacity - getCurrentCapacity();
    }

    /**
     * Calculates the capacity utilization percentage
     *
     * @return Utilization percentage (0-100)
     */
    @Transient
    public Double getUtilizationPercentage() {
        if (maxCapacity == 0) return 0.0;
        return (getCurrentCapacity().doubleValue() / maxCapacity) * 100;
    }
}
