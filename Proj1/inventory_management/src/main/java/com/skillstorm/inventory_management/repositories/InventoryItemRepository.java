package com.skillstorm.inventory_management.repositories;

import com.skillstorm.inventory_management.entities.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for InventoryItem entity.
 * Provides database access methods for inventory item operations.
 */
@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {

    /**
     * Finds an inventory item by its SKU
     *
     * @param sku Stock Keeping Unit
     * @return Optional containing the item if found
     */
    Optional<InventoryItem> findBySku(String sku);

    /**
     * Finds all items in a specific warehouse
     *
     * @param warehouseId Warehouse ID
     * @return List of items in the warehouse
     */
    @Query("SELECT i FROM InventoryItem i WHERE i.warehouse.id = :warehouseId")
    List<InventoryItem> findByWarehouseId(@Param("warehouseId") Long warehouseId);

    /**
     * Finds items by category
     *
     * @param category Category name
     * @return List of items in the category
     */
    List<InventoryItem> findByCategory(String category);

    /**
     * Finds items by name containing the search term (case-insensitive)
     *
     * @param name Search term
     * @return List of matching items
     */
    List<InventoryItem> findByNameContainingIgnoreCase(String name);

    /**
     * Finds items by SKU containing the search term (case-insensitive)
     *
     * @param sku Search term
     * @return List of matching items
     */
    List<InventoryItem> findBySkuContainingIgnoreCase(String sku);

    /**
     * Checks if an item with the given SKU exists
     *
     * @param sku Stock Keeping Unit
     * @return true if exists, false otherwise
     */
    boolean existsBySku(String sku);

    /**
     * Searches items by multiple criteria
     *
     * @param searchTerm Search term to match against name, SKU, or category
     * @param warehouseId Optional warehouse ID filter
     * @return List of matching items
     */
    @Query("SELECT i FROM InventoryItem i WHERE " +
           "(:searchTerm IS NULL OR LOWER(i.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(i.sku) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(i.category) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "(:warehouseId IS NULL OR i.warehouse.id = :warehouseId)")
    List<InventoryItem> searchItems(@Param("searchTerm") String searchTerm,
                                    @Param("warehouseId") Long warehouseId);

    /**
     * Gets distinct categories from all items
     *
     * @return List of unique categories
     */
    @Query("SELECT DISTINCT i.category FROM InventoryItem i WHERE i.category IS NOT NULL ORDER BY i.category")
    List<String> findDistinctCategories();
}
