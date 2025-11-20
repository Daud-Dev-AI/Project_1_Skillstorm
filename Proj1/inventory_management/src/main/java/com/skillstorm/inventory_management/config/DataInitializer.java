package com.skillstorm.inventory_management.config;

import com.skillstorm.inventory_management.entities.InventoryItem;
import com.skillstorm.inventory_management.entities.Warehouse;
import com.skillstorm.inventory_management.repositories.InventoryItemRepository;
import com.skillstorm.inventory_management.repositories.WarehouseRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Data initializer that loads sample data only if database is empty
 * This runs once on startup and checks for existing data before inserting
 */
@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(WarehouseRepository warehouseRepository,
                                    InventoryItemRepository inventoryItemRepository) {
        return args -> {
            // Only load sample data if warehouses table is empty
            if (warehouseRepository.count() == 0) {
                System.out.println("Loading sample data...");

                // Create warehouses
                Warehouse wh1 = new Warehouse();
                wh1.setName("Main Distribution Center");
                wh1.setLocation("New York, NY");
                wh1.setMaxCapacity(10000);
                wh1 = warehouseRepository.save(wh1);

                Warehouse wh2 = new Warehouse();
                wh2.setName("West Coast Hub");
                wh2.setLocation("Los Angeles, CA");
                wh2.setMaxCapacity(8000);
                wh2 = warehouseRepository.save(wh2);

                Warehouse wh3 = new Warehouse();
                wh3.setName("Midwest Warehouse");
                wh3.setLocation("Chicago, IL");
                wh3.setMaxCapacity(7500);
                wh3 = warehouseRepository.save(wh3);

                Warehouse wh4 = new Warehouse();
                wh4.setName("Southern Distribution");
                wh4.setLocation("Atlanta, GA");
                wh4.setMaxCapacity(6000);
                wh4 = warehouseRepository.save(wh4);

                Warehouse wh5 = new Warehouse();
                wh5.setName("Pacific Northwest");
                wh5.setLocation("Seattle, WA");
                wh5.setMaxCapacity(5500);
                wh5 = warehouseRepository.save(wh5);

                // Create inventory items
                createItem(inventoryItemRepository, "LAPTOP-001", "Dell Latitude 5520", "15-inch business laptop", "Electronics", 150, "A1-R1-S3", wh1);
                createItem(inventoryItemRepository, "LAPTOP-002", "MacBook Pro 16", "Professional laptop", "Electronics", 85, "A1-R2-S1", wh2);
                createItem(inventoryItemRepository, "LAPTOP-003", "HP EliteBook 840", "Lightweight laptop", "Electronics", 120, "A2-R1-S2", wh3);

                createItem(inventoryItemRepository, "DESK-CHAIR-001", "ErgoMax Executive Chair", "Ergonomic office chair", "Furniture", 200, "B1-R3-S1", wh1);
                createItem(inventoryItemRepository, "DESK-001", "Standing Desk Pro", "Adjustable height desk", "Furniture", 75, "B2-R1-S2", wh2);
                createItem(inventoryItemRepository, "DESK-002", "Corner Desk Unit", "L-shaped desk", "Furniture", 60, "B1-R2-S3", wh4);

                createItem(inventoryItemRepository, "MONITOR-001", "Dell UltraSharp 27", "27-inch 4K monitor", "Electronics", 180, "A3-R1-S1", wh1);
                createItem(inventoryItemRepository, "MONITOR-002", "LG 34 Ultrawide", "34-inch curved monitor", "Electronics", 95, "A1-R3-S2", wh3);

                createItem(inventoryItemRepository, "KEYBOARD-001", "Mechanical Keyboard RGB", "Gaming keyboard", "Electronics", 300, "A2-R2-S1", wh2);
                createItem(inventoryItemRepository, "MOUSE-001", "Wireless Ergonomic Mouse", "Vertical mouse", "Electronics", 250, "A2-R2-S2", wh2);

                createItem(inventoryItemRepository, "PRINTER-001", "HP LaserJet Pro", "Network printer", "Electronics", 45, "C1-R1-S1", wh1);
                createItem(inventoryItemRepository, "PRINTER-002", "Canon ImageClass", "Color laser printer", "Electronics", 30, "C1-R2-S1", wh4);

                createItem(inventoryItemRepository, "PHONE-001", "VoIP Desk Phone", "Business phone", "Electronics", 400, "A3-R2-S1", wh1);
                createItem(inventoryItemRepository, "TABLET-001", "iPad Pro 12.9", "Professional tablet", "Electronics", 120, "A1-R1-S1", wh2);

                createItem(inventoryItemRepository, "CABLE-001", "USB-C Cable 6ft", "Charging cable", "Accessories", 1000, "D1-R1-S1", wh5);
                createItem(inventoryItemRepository, "ADAPTER-001", "USB-C Hub", "Multi-port adapter", "Accessories", 500, "D1-R1-S2", wh5);

                createItem(inventoryItemRepository, "WHITEBOARD-001", "Mobile Whiteboard", "Rolling whiteboard", "Office Supplies", 35, "B3-R1-S1", wh3);
                createItem(inventoryItemRepository, "FILING-001", "4-Drawer File Cabinet", "Locking file cabinet", "Furniture", 80, "B2-R3-S1", wh4);

                createItem(inventoryItemRepository, "LAMP-001", "LED Desk Lamp", "Adjustable desk lamp", "Office Supplies", 150, "D2-R1-S1", wh1);
                createItem(inventoryItemRepository, "WEBCAM-001", "HD Webcam 1080p", "Conference camera", "Electronics", 200, "A3-R3-S1", wh3);
                createItem(inventoryItemRepository, "HEADSET-001", "Noise-Canceling Headset", "Wireless headset", "Electronics", 175, "A2-R3-S1", wh2);

                System.out.println("Sample data loaded successfully!");
            } else {
                System.out.println("Database already contains data. Skipping initialization.");
            }
        };
    }

    private static void createItem(InventoryItemRepository repository, String sku, String name,
                                   String description, String category, int quantity,
                                   String storageLocation, Warehouse warehouse) {
        InventoryItem item = new InventoryItem();
        item.setSku(sku);
        item.setName(name);
        item.setDescription(description);
        item.setCategory(category);
        item.setQuantity(quantity);
        item.setStorageLocation(storageLocation);
        item.setWarehouse(warehouse);
        repository.save(item);
    }
}
