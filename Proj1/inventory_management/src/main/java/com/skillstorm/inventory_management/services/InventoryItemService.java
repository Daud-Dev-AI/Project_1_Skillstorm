package com.skillstorm.inventory_management.services;

import com.skillstorm.inventory_management.dtos.InventoryItemDto;
import com.skillstorm.inventory_management.dtos.TransferRequest;
import com.skillstorm.inventory_management.entities.InventoryItem;
import com.skillstorm.inventory_management.entities.Warehouse;
import com.skillstorm.inventory_management.exceptions.DuplicateResourceException;
import com.skillstorm.inventory_management.exceptions.InsufficientCapacityException;
import com.skillstorm.inventory_management.exceptions.ResourceNotFoundException;
import com.skillstorm.inventory_management.repositories.InventoryItemRepository;
import com.skillstorm.inventory_management.repositories.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for managing inventory item operations.
 * Implements business logic for inventory CRUD operations, transfers, and validations.
 */
@Service
@RequiredArgsConstructor
public class InventoryItemService {

    private final InventoryItemRepository inventoryItemRepository;
    private final WarehouseRepository warehouseRepository;

    /**
     * Retrieves all inventory items
     *
     * @return List of inventory item DTOs
     */
    @Transactional(readOnly = true)
    public List<InventoryItemDto> getAllItems() {
        return inventoryItemRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves an inventory item by ID
     *
     * @param id Item ID
     * @return Inventory item DTO
     * @throws ResourceNotFoundException if item not found
     */
    @Transactional(readOnly = true)
    public InventoryItemDto getItemById(Long id) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));
        return convertToDto(item);
    }

    /**
     * Retrieves all items in a specific warehouse
     *
     * @param warehouseId Warehouse ID
     * @return List of inventory item DTOs
     */
    @Transactional(readOnly = true)
    public List<InventoryItemDto> getItemsByWarehouse(Long warehouseId) {
        return inventoryItemRepository.findByWarehouseId(warehouseId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Creates a new inventory item
     *
     * @param itemDto Inventory item data
     * @return Created inventory item DTO
     * @throws ResourceNotFoundException if warehouse not found
     * @throws DuplicateResourceException if SKU already exists
     * @throws InsufficientCapacityException if warehouse capacity exceeded
     */
    @Transactional
    public InventoryItemDto createItem(InventoryItemDto itemDto) {
        // Check for duplicate SKU
        if (inventoryItemRepository.existsBySku(itemDto.getSku())) {
            throw new DuplicateResourceException("Item with SKU '" + itemDto.getSku() + "' already exists");
        }

        // Find warehouse
        Warehouse warehouse = warehouseRepository.findByIdWithItems(itemDto.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + itemDto.getWarehouseId()));

        // Check warehouse capacity
        if (!warehouse.hasCapacity(itemDto.getQuantity())) {
            throw new InsufficientCapacityException(
                "Insufficient warehouse capacity. Available: " + warehouse.getAvailableCapacity() +
                ", Required: " + itemDto.getQuantity()
            );
        }

        // Create item
        InventoryItem item = new InventoryItem();
        item.setSku(itemDto.getSku());
        item.setName(itemDto.getName());
        item.setDescription(itemDto.getDescription());
        item.setCategory(itemDto.getCategory());
        item.setQuantity(itemDto.getQuantity());
        item.setStorageLocation(itemDto.getStorageLocation());
        item.setWarehouse(warehouse);

        InventoryItem saved = inventoryItemRepository.save(item);
        return convertToDto(saved);
    }

    /**
     * Updates an existing inventory item
     *
     * @param id Item ID
     * @param itemDto Updated item data
     * @return Updated inventory item DTO
     * @throws ResourceNotFoundException if item or warehouse not found
     * @throws DuplicateResourceException if new SKU conflicts
     * @throws InsufficientCapacityException if capacity exceeded
     */
    @Transactional
    public InventoryItemDto updateItem(Long id, InventoryItemDto itemDto) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));

        // Check for duplicate SKU (excluding current item)
        if (!item.getSku().equals(itemDto.getSku()) &&
            inventoryItemRepository.existsBySku(itemDto.getSku())) {
            throw new DuplicateResourceException("Item with SKU '" + itemDto.getSku() + "' already exists");
        }

        // If warehouse is changing or quantity is increasing, check capacity
        if (!item.getWarehouse().getId().equals(itemDto.getWarehouseId()) ||
            itemDto.getQuantity() > item.getQuantity()) {

            Warehouse newWarehouse = warehouseRepository.findByIdWithItems(itemDto.getWarehouseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + itemDto.getWarehouseId()));

            int capacityNeeded;
            if (!item.getWarehouse().getId().equals(itemDto.getWarehouseId())) {
                // Moving to different warehouse - need full quantity
                capacityNeeded = itemDto.getQuantity();
            } else {
                // Same warehouse - only need the increase
                capacityNeeded = itemDto.getQuantity() - item.getQuantity();
            }

            if (!newWarehouse.hasCapacity(capacityNeeded)) {
                throw new InsufficientCapacityException(
                    "Insufficient warehouse capacity. Available: " + newWarehouse.getAvailableCapacity() +
                    ", Required: " + capacityNeeded
                );
            }

            item.setWarehouse(newWarehouse);
        }

        item.setSku(itemDto.getSku());
        item.setName(itemDto.getName());
        item.setDescription(itemDto.getDescription());
        item.setCategory(itemDto.getCategory());
        item.setQuantity(itemDto.getQuantity());
        item.setStorageLocation(itemDto.getStorageLocation());

        InventoryItem updated = inventoryItemRepository.save(item);
        return convertToDto(updated);
    }

    /**
     * Deletes an inventory item
     *
     * @param id Item ID
     * @throws ResourceNotFoundException if item not found
     */
    @Transactional
    public void deleteItem(Long id) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));
        inventoryItemRepository.delete(item);
    }

    /**
     * Transfers inventory items between warehouses
     *
     * @param transferRequest Transfer details
     * @return Updated inventory item DTO
     * @throws ResourceNotFoundException if item or warehouses not found
     * @throws InsufficientCapacityException if destination warehouse lacks capacity
     * @throws IllegalArgumentException if transfer quantity exceeds available quantity
     */
    @Transactional
    public InventoryItemDto transferItem(TransferRequest transferRequest) {
        // Validate item exists
        InventoryItem item = inventoryItemRepository.findById(transferRequest.getItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + transferRequest.getItemId()));

        // Validate source warehouse
        if (!item.getWarehouse().getId().equals(transferRequest.getSourceWarehouseId())) {
            throw new IllegalArgumentException("Item is not in the specified source warehouse");
        }

        // Validate quantity
        if (transferRequest.getQuantity() > item.getQuantity()) {
            throw new IllegalArgumentException(
                "Transfer quantity (" + transferRequest.getQuantity() +
                ") exceeds available quantity (" + item.getQuantity() + ")"
            );
        }

        // Get destination warehouse
        Warehouse destinationWarehouse = warehouseRepository.findByIdWithItems(transferRequest.getDestinationWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Destination warehouse not found with id: " + transferRequest.getDestinationWarehouseId()));

        // Check destination warehouse capacity
        if (!destinationWarehouse.hasCapacity(transferRequest.getQuantity())) {
            throw new InsufficientCapacityException(
                "Insufficient capacity in destination warehouse. Available: " + destinationWarehouse.getAvailableCapacity() +
                ", Required: " + transferRequest.getQuantity()
            );
        }

        // If transferring partial quantity, create new item in destination warehouse
        if (transferRequest.getQuantity() < item.getQuantity()) {
            // Reduce quantity in source
            item.setQuantity(item.getQuantity() - transferRequest.getQuantity());
            inventoryItemRepository.save(item);

            // Check if same SKU exists in destination warehouse
            List<InventoryItem> existingItems = inventoryItemRepository.findByWarehouseId(destinationWarehouse.getId());
            InventoryItem existingItem = existingItems.stream()
                    .filter(i -> i.getSku().equals(item.getSku()))
                    .findFirst()
                    .orElse(null);

            if (existingItem != null) {
                // Update existing item quantity
                existingItem.setQuantity(existingItem.getQuantity() + transferRequest.getQuantity());
                InventoryItem updated = inventoryItemRepository.save(existingItem);
                return convertToDto(updated);
            } else {
                // Create new item in destination
                InventoryItem newItem = new InventoryItem();
                newItem.setSku(item.getSku() + "-" + System.currentTimeMillis()); // Make SKU unique
                newItem.setName(item.getName());
                newItem.setDescription(item.getDescription());
                newItem.setCategory(item.getCategory());
                newItem.setQuantity(transferRequest.getQuantity());
                newItem.setStorageLocation(item.getStorageLocation());
                newItem.setWarehouse(destinationWarehouse);
                InventoryItem created = inventoryItemRepository.save(newItem);
                return convertToDto(created);
            }
        } else {
            // Transfer entire item
            item.setWarehouse(destinationWarehouse);
            InventoryItem updated = inventoryItemRepository.save(item);
            return convertToDto(updated);
        }
    }

    /**
     * Searches inventory items by criteria
     *
     * @param searchTerm Search term
     * @param warehouseId Optional warehouse filter
     * @return List of matching inventory item DTOs
     */
    @Transactional(readOnly = true)
    public List<InventoryItemDto> searchItems(String searchTerm, Long warehouseId) {
        return inventoryItemRepository.searchItems(searchTerm, warehouseId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Gets all distinct categories
     *
     * @return List of categories
     */
    @Transactional(readOnly = true)
    public List<String> getCategories() {
        return inventoryItemRepository.findDistinctCategories();
    }

    /**
     * Converts InventoryItem entity to DTO
     *
     * @param item Inventory item entity
     * @return Inventory item DTO
     */
    private InventoryItemDto convertToDto(InventoryItem item) {
        InventoryItemDto dto = new InventoryItemDto();
        dto.setId(item.getId());
        dto.setSku(item.getSku());
        dto.setName(item.getName());
        dto.setDescription(item.getDescription());
        dto.setCategory(item.getCategory());
        dto.setQuantity(item.getQuantity());
        dto.setStorageLocation(item.getStorageLocation());
        dto.setWarehouseId(item.getWarehouseId());
        if (item.getWarehouse() != null) {
            dto.setWarehouseName(item.getWarehouse().getName());
        }
        return dto;
    }
}
