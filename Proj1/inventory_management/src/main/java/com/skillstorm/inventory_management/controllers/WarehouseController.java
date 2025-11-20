package com.skillstorm.inventory_management.controllers;

import com.skillstorm.inventory_management.dtos.WarehouseDto;
import com.skillstorm.inventory_management.services.WarehouseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for warehouse management operations.
 * Provides endpoints for CRUD operations on warehouses.
 */
@RestController
@RequestMapping("/api/warehouses")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class WarehouseController {

    private final WarehouseService warehouseService;

    /**
     * Retrieves all warehouses
     *
     * @return List of warehouse DTOs
     */
    @GetMapping
    public ResponseEntity<List<WarehouseDto>> getAllWarehouses() {
        List<WarehouseDto> warehouses = warehouseService.getAllWarehouses();
        return ResponseEntity.ok(warehouses);
    }

    /**
     * Retrieves a warehouse by ID
     *
     * @param id Warehouse ID
     * @return Warehouse DTO
     */
    @GetMapping("/{id}")
    public ResponseEntity<WarehouseDto> getWarehouseById(@PathVariable Long id) {
        WarehouseDto warehouse = warehouseService.getWarehouseById(id);
        return ResponseEntity.ok(warehouse);
    }

    /**
     * Creates a new warehouse
     *
     * @param warehouseDto Warehouse data
     * @return Created warehouse DTO
     */
    @PostMapping
    public ResponseEntity<WarehouseDto> createWarehouse(@Valid @RequestBody WarehouseDto warehouseDto) {
        WarehouseDto created = warehouseService.createWarehouse(warehouseDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Updates an existing warehouse
     *
     * @param id Warehouse ID
     * @param warehouseDto Updated warehouse data
     * @return Updated warehouse DTO
     */
    @PutMapping("/{id}")
    public ResponseEntity<WarehouseDto> updateWarehouse(
            @PathVariable Long id,
            @Valid @RequestBody WarehouseDto warehouseDto) {
        WarehouseDto updated = warehouseService.updateWarehouse(id, warehouseDto);
        return ResponseEntity.ok(updated);
    }

    /**
     * Deletes a warehouse
     *
     * @param id Warehouse ID
     * @return No content response
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWarehouse(@PathVariable Long id) {
        warehouseService.deleteWarehouse(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Searches warehouses by name
     *
     * @param name Search term
     * @return List of matching warehouse DTOs
     */
    @GetMapping("/search")
    public ResponseEntity<List<WarehouseDto>> searchWarehouses(@RequestParam String name) {
        List<WarehouseDto> warehouses = warehouseService.searchWarehousesByName(name);
        return ResponseEntity.ok(warehouses);
    }
}
