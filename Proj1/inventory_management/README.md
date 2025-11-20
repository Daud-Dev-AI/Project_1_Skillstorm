# Inventory Management System

A comprehensive full-stack warehouse and inventory management solution built with Spring Boot and React.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Contributing](#contributing)

## Overview

The Inventory Management System empowers administrators with full control over warehouse entities across multiple locations. It features robust capabilities for viewing, adding, removing, and modifying inventory, all within an intuitive, user-friendly interface.

### Key Highlights
- **Real-time Dashboard**: View warehouse capacity, utilization metrics, and inventory analytics
- **Capacity Management**: Monitor warehouse limits and prevent overstocking with automated alerts
- **Item Transfers**: Seamlessly transfer inventory between warehouses
- **Advanced Search & Filter**: Quickly find items by name, SKU, category, or warehouse
- **Responsive Design**: Fully functional on desktop, tablet, and mobile devices

## Features

### Warehouse Management
- ✅ Create, read, update, and delete warehouses
- ✅ Set maximum capacity per warehouse
- ✅ View real-time capacity utilization
- ✅ Location-based warehouse organization
- ✅ Prevent deletion of non-empty warehouses

### Inventory Management
- ✅ Add, edit, and remove inventory items
- ✅ Track items by SKU, name, category, and quantity
- ✅ Assign storage locations within warehouses
- ✅ Transfer items between warehouses
- ✅ Partial and full quantity transfers
- ✅ Automatic capacity validation

### Dashboard & Analytics
- ✅ Overview of all warehouses and items
- ✅ Capacity utilization charts (Bar and Pie charts)
- ✅ Inventory distribution by category
- ✅ Capacity alerts for warehouses exceeding 80% utilization
- ✅ Real-time metrics and KPIs

### Edge Case Handling
- ✅ **Warehouse Full Capacity**: Prevents adding items beyond warehouse capacity with clear error messages
- ✅ **Duplicate SKU Prevention**: Ensures unique SKUs across the system
- ✅ **Duplicate Warehouse Names**: Prevents warehouse name conflicts
- ✅ **Transfer Validation**: Validates source and destination capacity during transfers
- ✅ **Capacity Reduction**: Prevents reducing warehouse capacity below current usage

## Technologies Used

### Backend
- **Java 17**
- **Spring Boot 3.5.7**
- **Spring Data JPA** - Database operations
- **Spring Web** - RESTful API
- **Spring Validation** - Input validation
- **Hibernate** - ORM
- **PostgreSQL 18** - Database
- **Lombok** - Boilerplate code reduction

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - Component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Data visualization

## Prerequisites

- **Java JDK 17** or higher
- **Node.js 20.19+** or **22.12+**
- **PostgreSQL 18** installed and running
- **Maven** (included via Maven Wrapper)

## Installation

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd inventory_management
```

### 2. Database Setup
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE inventory_management;

# Exit psql
\q
```

### 3. Configure Database Connection
Edit `src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/inventory_management
    username: postgres
    password: YOUR_PASSWORD
```

### 4. Install Backend Dependencies
```bash
# The Maven Wrapper will download dependencies automatically
./mvnw clean install
```

### 5. Install Frontend Dependencies
```bash
cd frontend
npm install
```

## Running the Application

### Start Backend Server
```bash
# From project root
./mvnw spring-boot:run
```
Backend will start on **http://localhost:8080**

Or you could use the Spring Boot Dashboard if you have the Extension installed in VS Code.

### Start Frontend Development Server
```bash
# In a new terminal, from project root
cd frontend
npm run dev
```
Frontend will start on **http://localhost:5173**

### Access the Application
Open your browser and navigate to **http://localhost:5173**

## API Documentation

### Warehouse Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/warehouses` | Get all warehouses |
| GET | `/api/warehouses/{id}` | Get warehouse by ID |
| POST | `/api/warehouses` | Create new warehouse |
| PUT | `/api/warehouses/{id}` | Update warehouse |
| DELETE | `/api/warehouses/{id}` | Delete warehouse |
| GET | `/api/warehouses/search?name={name}` | Search warehouses by name |

### Inventory Item Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | Get all inventory items |
| GET | `/api/items/{id}` | Get item by ID |
| GET | `/api/items/warehouse/{warehouseId}` | Get items by warehouse |
| POST | `/api/items` | Create new item |
| PUT | `/api/items/{id}` | Update item |
| DELETE | `/api/items/{id}` | Delete item |
| POST | `/api/items/transfer` | Transfer item between warehouses |
| GET | `/api/items/search` | Search items (supports searchTerm and warehouseId params) |
| GET | `/api/items/categories` | Get all distinct categories |

### Sample Requests

#### Create Warehouse
```json
POST /api/warehouses
{
  "name": "Main Distribution Center",
  "location": "New York, NY",
  "maxCapacity": 10000
}
```

#### Create Inventory Item
```json
POST /api/items
{
  "sku": "ELEC-001",
  "name": "Laptop Computer",
  "description": "High-performance laptop",
  "category": "Electronics",
  "quantity": 150,
  "storageLocation": "Aisle A, Shelf 1",
  "warehouseId": 1
}
```

#### Transfer Item
```json
POST /api/items/transfer
{
  "itemId": 1,
  "sourceWarehouseId": 1,
  "destinationWarehouseId": 2,
  "quantity": 50
}
```

## Project Structure

```
inventory_management/
├── src/
│   ├── main/
│   │   ├── java/com/skillstorm/inventory_management/
│   │   │   ├── config/          # Configuration classes (CORS, etc.)
│   │   │   ├── controllers/     # REST controllers
│   │   │   ├── dtos/           # Data Transfer Objects
│   │   │   ├── entities/       # JPA entities
│   │   │   ├── exceptions/     # Custom exceptions and handlers
│   │   │   ├── repositories/   # JPA repositories
│   │   │   └── services/       # Business logic layer
│   │   └── resources/
│   │       ├── application.yml # Application configuration
│   │       └── data.sql       # Sample data
│   └── test/                  # Unit tests
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   └── vite.config.js
├── pom.xml                 # Maven configuration
└── README.md
```

## Database Schema

### Warehouses Table
- `id` (BIGINT, Primary Key)
- `name` (VARCHAR, Unique)
- `location` (VARCHAR)
- `max_capacity` (INTEGER)

### Inventory Items Table
- `id` (BIGINT, Primary Key)
- `sku` (VARCHAR, Unique)
- `name` (VARCHAR)
- `description` (TEXT)
- `category` (VARCHAR)
- `quantity` (INTEGER)
- `storage_location` (VARCHAR)
- `warehouse_id` (BIGINT, Foreign Key → Warehouses)

## Best Practices Implemented

### Backend
- **SOLID Principles**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **DRY (Don't Repeat Yourself)**: Reusable services and DTOs
- **Comprehensive JavaDocs**: All classes and methods documented
- **Global Exception Handling**: Centralized error management
- **Input Validation**: Bean Validation annotations
- **Transaction Management**: @Transactional annotations
- **Separation of Concerns**: Clear layer separation (Controller → Service → Repository)
- **Reduced and Normalized Tables**: Tables are normalized to reduce redundancies and improve efficiency of CRUD Operations.

### Frontend
- **Component Reusability**: Modular React components
- **Responsive Design**: Material-UI responsive grid system
- **Error Handling**: User-friendly error messages and validations
- **State Management**: React hooks (useState, useEffect)
- **API Abstraction**: Centralized API service layer

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Note**: This application uses sample data loaded automatically on startup. The database schema is recreated each time the application starts (ddl-auto: create-drop). For production use, change this to `validate` or `update`.
## Author

Engr. Daud Ahmad