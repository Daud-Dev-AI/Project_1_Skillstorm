package com.skillstorm.inventory_management.services;

import com.skillstorm.inventory_management.dtos.WarehouseDto;
import com.skillstorm.inventory_management.entities.Warehouse;
import com.skillstorm.inventory_management.exceptions.DuplicateResourceException;
import com.skillstorm.inventory_management.exceptions.ResourceNotFoundException;
import com.skillstorm.inventory_management.repositories.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for managing warehouse operations.
 * Implements business logic for warehouse CRUD operations and validations.
 */
@Service
@RequiredArgsConstructor
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;

    /**
     * Retrieves all warehouses from the database
     *
     * @return List of warehouse DTOs
     */
    @Transactional(readOnly = true)
    public List<WarehouseDto> getAllWarehouses() {
        return warehouseRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a warehouse by its ID
     *
     * @param id Warehouse ID
     * @return Warehouse DTO
     * @throws ResourceNotFoundException if warehouse not found
     */
    @Transactional(readOnly = true)
    public WarehouseDto getWarehouseById(Long id) {
        Warehouse warehouse = warehouseRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + id));
        return convertToDto(warehouse);
    }

    /**
     * Creates a new warehouse
     *
     * @param warehouseDto Warehouse data
     * @return Created warehouse DTO
     * @throws DuplicateResourceException if warehouse name already exists
     */
    @Transactional
    public WarehouseDto createWarehouse(WarehouseDto warehouseDto) {
        if (warehouseRepository.existsByName(warehouseDto.getName())) {
            throw new DuplicateResourceException("Warehouse with name '" + warehouseDto.getName() + "' already exists");
        }

        Warehouse warehouse = new Warehouse();
        warehouse.setName(warehouseDto.getName());
        warehouse.setLocation(warehouseDto.getLocation());
        warehouse.setMaxCapacity(warehouseDto.getMaxCapacity());

        Warehouse saved = warehouseRepository.save(warehouse);
        return convertToDto(saved);
    }

    /**
     * Updates an existing warehouse
     *
     * @param id Warehouse ID
     * @param warehouseDto Updated warehouse data
     * @return Updated warehouse DTO
     * @throws ResourceNotFoundException if warehouse not found
     * @throws DuplicateResourceException if new name conflicts with existing warehouse
     * @throws IllegalArgumentException if new capacity is less than current usage
     */
    @Transactional
    public WarehouseDto updateWarehouse(Long id, WarehouseDto warehouseDto) {
        Warehouse warehouse = warehouseRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + id));

        // Check for duplicate name (excluding current warehouse)
        if (!warehouse.getName().equals(warehouseDto.getName()) &&
            warehouseRepository.existsByName(warehouseDto.getName())) {
            throw new DuplicateResourceException("Warehouse with name '" + warehouseDto.getName() + "' already exists");
        }

        // Validate that new capacity is not less than current usage
        if (warehouseDto.getMaxCapacity() < warehouse.getCurrentCapacity()) {
            throw new IllegalArgumentException(
                "Cannot reduce capacity to " + warehouseDto.getMaxCapacity() +
                ". Current usage is " + warehouse.getCurrentCapacity() + " items."
            );
        }

        warehouse.setName(warehouseDto.getName());
        warehouse.setLocation(warehouseDto.getLocation());
        warehouse.setMaxCapacity(warehouseDto.getMaxCapacity());

        Warehouse updated = warehouseRepository.save(warehouse);
        return convertToDto(updated);
    }

    /**
     * Deletes a warehouse by ID
     *
     * @param id Warehouse ID
     * @throws ResourceNotFoundException if warehouse not found
     * @throws IllegalStateException if warehouse contains items
     */
    @Transactional
    public void deleteWarehouse(Long id) {
        Warehouse warehouse = warehouseRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + id));

        if (!warehouse.getItems().isEmpty()) {
            throw new IllegalStateException(
                "Cannot delete warehouse. It contains " + warehouse.getItems().size() + " items. " +
                "Please remove or transfer all items before deleting."
            );
        }

        warehouseRepository.delete(warehouse);
    }

    /**
     * Searches warehouses by name
     *
     * @param name Search term
     * @return List of matching warehouse DTOs
     */
    @Transactional(readOnly = true)
    public List<WarehouseDto> searchWarehousesByName(String name) {
        return warehouseRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Converts Warehouse entity to DTO
     *
     * @param warehouse Warehouse entity
     * @return Warehouse DTO
     */
    private WarehouseDto convertToDto(Warehouse warehouse) {
        WarehouseDto dto = new WarehouseDto();
        dto.setId(warehouse.getId());
        dto.setName(warehouse.getName());
        dto.setLocation(warehouse.getLocation());
        dto.setMaxCapacity(warehouse.getMaxCapacity());
        dto.setCurrentCapacity(warehouse.getCurrentCapacity());
        dto.setAvailableCapacity(warehouse.getAvailableCapacity());
        dto.setUtilizationPercentage(warehouse.getUtilizationPercentage());
        dto.setItemCount(warehouse.getItems() != null ? warehouse.getItems().size() : 0);
        return dto;
    }
}
