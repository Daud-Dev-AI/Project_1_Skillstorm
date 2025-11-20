package com.skillstorm.inventory_management.repositories;

import com.skillstorm.inventory_management.entities.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Warehouse entity.
 * Provides database access methods for warehouse operations.
 */
@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {

    /**
     * Finds a warehouse by its name
     *
     * @param name Warehouse name
     * @return Optional containing the warehouse if found
     */
    Optional<Warehouse> findByName(String name);

    /**
     * Finds all warehouses in a specific location
     *
     * @param location Location to search
     * @return List of warehouses in the specified location
     */
    List<Warehouse> findByLocation(String location);

    /**
     * Finds warehouses by name containing the search term (case-insensitive)
     *
     * @param name Search term
     * @return List of matching warehouses
     */
    List<Warehouse> findByNameContainingIgnoreCase(String name);

    /**
     * Checks if a warehouse with the given name exists
     *
     * @param name Warehouse name
     * @return true if exists, false otherwise
     */
    boolean existsByName(String name);

    /**
     * Fetches warehouse with all its items eagerly loaded
     *
     * @param id Warehouse ID
     * @return Optional containing warehouse with items
     */
    @Query("SELECT w FROM Warehouse w LEFT JOIN FETCH w.items WHERE w.id = :id")
    Optional<Warehouse> findByIdWithItems(Long id);
}
