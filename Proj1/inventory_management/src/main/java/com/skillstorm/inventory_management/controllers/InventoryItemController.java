package com.skillstorm.inventory_management.controllers;

import com.skillstorm.inventory_management.dtos.InventoryItemDto;
import com.skillstorm.inventory_management.dtos.TransferRequest;
import com.skillstorm.inventory_management.services.InventoryItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for inventory item management operations.
 * Provides endpoints for CRUD operations, transfers, and search.
 */
@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class InventoryItemController {

    private final InventoryItemService inventoryItemService;

    /**
     * Retrieves all inventory items
     *
     * @return List of inventory item DTOs
     */
    @GetMapping
    public ResponseEntity<List<InventoryItemDto>> getAllItems() {
        List<InventoryItemDto> items = inventoryItemService.getAllItems();
        return ResponseEntity.ok(items);
    }

    /**
     * Retrieves an inventory item by ID
     *
     * @param id Item ID
     * @return Inventory item DTO
     */
    @GetMapping("/{id}")
    public ResponseEntity<InventoryItemDto> getItemById(@PathVariable Long id) {
        InventoryItemDto item = inventoryItemService.getItemById(id);
        return ResponseEntity.ok(item);
    }

    /**
     * Retrieves all items in a specific warehouse
     *
     * @param warehouseId Warehouse ID
     * @return List of inventory item DTOs
     */
    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<List<InventoryItemDto>> getItemsByWarehouse(@PathVariable Long warehouseId) {
        List<InventoryItemDto> items = inventoryItemService.getItemsByWarehouse(warehouseId);
        return ResponseEntity.ok(items);
    }

    /**
     * Creates a new inventory item
     *
     * @param itemDto Inventory item data
     * @return Created inventory item DTO
     */
    @PostMapping
    public ResponseEntity<InventoryItemDto> createItem(@Valid @RequestBody InventoryItemDto itemDto) {
        InventoryItemDto created = inventoryItemService.createItem(itemDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Updates an existing inventory item
     *
     * @param id Item ID
     * @param itemDto Updated item data
     * @return Updated inventory item DTO
     */
    @PutMapping("/{id}")
    public ResponseEntity<InventoryItemDto> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody InventoryItemDto itemDto) {
        InventoryItemDto updated = inventoryItemService.updateItem(id, itemDto);
        return ResponseEntity.ok(updated);
    }

    /**
     * Deletes an inventory item
     *
     * @param id Item ID
     * @return No content response
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        inventoryItemService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Transfers inventory items between warehouses
     *
     * @param transferRequest Transfer details
     * @return Updated inventory item DTO
     */
    @PostMapping("/transfer")
    public ResponseEntity<InventoryItemDto> transferItem(@Valid @RequestBody TransferRequest transferRequest) {
        InventoryItemDto transferred = inventoryItemService.transferItem(transferRequest);
        return ResponseEntity.ok(transferred);
    }

    /**
     * Searches inventory items
     *
     * @param searchTerm Search term (optional)
     * @param warehouseId Warehouse ID filter (optional)
     * @return List of matching inventory item DTOs
     */
    @GetMapping("/search")
    public ResponseEntity<List<InventoryItemDto>> searchItems(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Long warehouseId) {
        List<InventoryItemDto> items = inventoryItemService.searchItems(searchTerm, warehouseId);
        return ResponseEntity.ok(items);
    }

    /**
     * Retrieves all distinct categories
     *
     * @return List of categories
     */
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        List<String> categories = inventoryItemService.getCategories();
        return ResponseEntity.ok(categories);
    }
}
