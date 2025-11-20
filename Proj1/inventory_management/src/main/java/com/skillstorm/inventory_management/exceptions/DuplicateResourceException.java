package com.skillstorm.inventory_management.exceptions;

/**
 * Exception thrown when attempting to create a resource that already exists.
 * This is a runtime exception that will be handled by the global exception handler.
 */
public class DuplicateResourceException extends RuntimeException {

    /**
     * Constructs a new DuplicateResourceException with the specified detail message
     *
     * @param message the detail message
     */
    public DuplicateResourceException(String message) {
        super(message);
    }

    /**
     * Constructs a new DuplicateResourceException with the specified detail message and cause
     *
     * @param message the detail message
     * @param cause the cause
     */
    public DuplicateResourceException(String message, Throwable cause) {
        super(message, cause);
    }
}
