-- Sample data for Inventory Management System

-- Insert Warehouses
INSERT INTO warehouses (name, location, max_capacity) VALUES
('Main Distribution Center', 'New York, NY', 10000),
('West Coast Hub', 'Los Angeles, CA', 8000),
('Midwest Facility', 'Chicago, IL', 6000),
('Southern Warehouse', 'Houston, TX', 7000),
('Northeast Center', 'Boston, MA', 5000);

-- Insert Inventory Items
INSERT INTO inventory_items (sku, name, description, category, quantity, storage_location, warehouse_id) VALUES
-- Main Distribution Center items
('ELEC-001', 'Laptop Computer', 'High-performance laptop for business use', 'Electronics', 150, 'Aisle A, Shelf 1', 1),
('ELEC-002', 'Wireless Mouse', 'Ergonomic wireless mouse', 'Electronics', 500, 'Aisle A, Shelf 2', 1),
('FURN-001', 'Office Chair', 'Adjustable ergonomic office chair', 'Furniture', 200, 'Aisle B, Shelf 1', 1),
('STAT-001', 'Printer Paper', 'A4 printer paper, 500 sheets per ream', 'Stationery', 1000, 'Aisle C, Shelf 1', 1),
('ELEC-003', 'USB Cable', '6-foot USB-C cable', 'Electronics', 800, 'Aisle A, Shelf 3', 1),

-- West Coast Hub items
('ELEC-004', 'Monitor 27-inch', '4K LED monitor', 'Electronics', 180, 'Aisle A, Shelf 1', 2),
('ELEC-005', 'Keyboard', 'Mechanical keyboard', 'Electronics', 300, 'Aisle A, Shelf 2', 2),
('FURN-002', 'Standing Desk', 'Height-adjustable standing desk', 'Furniture', 120, 'Aisle B, Shelf 1', 2),
('STAT-002', 'Notebooks', 'Spiral-bound notebooks, pack of 5', 'Stationery', 600, 'Aisle C, Shelf 1', 2),

-- Midwest Facility items
('ELEC-006', 'Tablet 10-inch', 'Android tablet', 'Electronics', 250, 'Aisle A, Shelf 1', 3),
('ELEC-007', 'Headphones', 'Noise-cancelling headphones', 'Electronics', 400, 'Aisle A, Shelf 2', 3),
('FURN-003', 'Bookshelf', '5-tier wooden bookshelf', 'Furniture', 80, 'Aisle B, Shelf 1', 3),
('STAT-003', 'Pens', 'Ballpoint pens, box of 50', 'Stationery', 1200, 'Aisle C, Shelf 1', 3),

-- Southern Warehouse items
('ELEC-008', 'Smartphone', 'Latest model smartphone', 'Electronics', 300, 'Aisle A, Shelf 1', 4),
('ELEC-009', 'Charger', 'Fast charging adapter', 'Electronics', 700, 'Aisle A, Shelf 2', 4),
('FURN-004', 'Filing Cabinet', '4-drawer metal filing cabinet', 'Furniture', 100, 'Aisle B, Shelf 1', 4),
('STAT-004', 'Folders', 'File folders, pack of 25', 'Stationery', 800, 'Aisle C, Shelf 1', 4),

-- Northeast Center items
('ELEC-010', 'Webcam', 'HD webcam with microphone', 'Electronics', 200, 'Aisle A, Shelf 1', 5),
('ELEC-011', 'External SSD', '1TB portable SSD', 'Electronics', 350, 'Aisle A, Shelf 2', 5),
('FURN-005', 'Conference Table', 'Large conference table', 'Furniture', 30, 'Aisle B, Shelf 1', 5),
('STAT-005', 'Staplers', 'Heavy-duty stapler', 'Stationery', 250, 'Aisle C, Shelf 1', 5);
