package com.skillstorm.inventory_management.exceptions;

/**
 * Exception thrown when a warehouse does not have sufficient capacity for an operation.
 * This is a runtime exception that will be handled by the global exception handler.
 */
public class InsufficientCapacityException extends RuntimeException {

    /**
     * Constructs a new InsufficientCapacityException with the specified detail message
     *
     * @param message the detail message
     */
    public InsufficientCapacityException(String message) {
        super(message);
    }

    /**
     * Constructs a new InsufficientCapacityException with the specified detail message and cause
     *
     * @param message the detail message
     * @param cause the cause
     */
    public InsufficientCapacityException(String message, Throwable cause) {
        super(message, cause);
    }
}
