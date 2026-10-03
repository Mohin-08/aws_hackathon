package com.eventflow.dto;

import java.util.Map;

public class ErrorAnalyticsResponse {
    private long totalErrors;
    private Map<String, Long> errorsByCategory; // INVALID_FILE, LAMBDA_ERROR, TIMEOUT, PERMISSION_ERROR, DATABASE_ERROR, UNKNOWN
    private Map<String, Long> errorsByMechanism;

    public ErrorAnalyticsResponse() {}

    public ErrorAnalyticsResponse(long totalErrors, Map<String, Long> errorsByCategory, Map<String, Long> errorsByMechanism) {
        this.totalErrors = totalErrors;
        this.errorsByCategory = errorsByCategory;
        this.errorsByMechanism = errorsByMechanism;
    }

    public long getTotalErrors() { return totalErrors; }
    public void setTotalErrors(long totalErrors) { this.totalErrors = totalErrors; }

    public Map<String, Long> getErrorsByCategory() { return errorsByCategory; }
    public void setErrorsByCategory(Map<String, Long> errorsByCategory) { this.errorsByCategory = errorsByCategory; }

    public Map<String, Long> getErrorsByMechanism() { return errorsByMechanism; }
    public void setErrorsByMechanism(Map<String, Long> errorsByMechanism) { this.errorsByMechanism = errorsByMechanism; }
}
