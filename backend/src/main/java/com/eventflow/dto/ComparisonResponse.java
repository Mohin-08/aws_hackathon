package com.eventflow.dto;

import java.util.Map;

public class ComparisonResponse {
    private ArchitectureMetrics s3Notification;
    private ArchitectureMetrics eventBridge;
    private Map<String, Object> featureComparison;

    public ComparisonResponse() {}

    public ComparisonResponse(ArchitectureMetrics s3Notification, ArchitectureMetrics eventBridge, Map<String, Object> featureComparison) {
        this.s3Notification = s3Notification;
        this.eventBridge = eventBridge;
        this.featureComparison = featureComparison;
    }

    public ArchitectureMetrics getS3Notification() { return s3Notification; }
    public void setS3Notification(ArchitectureMetrics s3Notification) { this.s3Notification = s3Notification; }

    public ArchitectureMetrics getEventBridge() { return eventBridge; }
    public void setEventBridge(ArchitectureMetrics eventBridge) { this.eventBridge = eventBridge; }

    public Map<String, Object> getFeatureComparison() { return featureComparison; }
    public void setFeatureComparison(Map<String, Object> featureComparison) { this.featureComparison = featureComparison; }
}
