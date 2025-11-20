package com.skillstorm.inventory_management.exceptions;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Standard error response structure for API exceptions.
 * Provides consistent error information to clients.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    /**
     * Timestamp when the error occurred
     */
    private LocalDateTime timestamp;

    /**
     * HTTP status code
     */
    private int status;

    /**
     * Error type/name
     */
    private String error;

    /**
     * Detailed error message
     */
    private String message;

    /**
     * Request path where error occurred
     */
    private String path;

    /**
     * Additional validation errors (for validation failures)
     */
    private Map<String, String> validationErrors;

    /**
     * Constructor without validation errors
     */
    public ErrorResponse(LocalDateTime timestamp, int status, String error, String message, String path) {
        this.timestamp = timestamp;
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
    }
}
