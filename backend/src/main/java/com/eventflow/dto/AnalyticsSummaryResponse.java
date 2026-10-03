package com.eventflow.dto;

import java.util.Map;

public class AnalyticsSummaryResponse {
    private long totalEvents;
    private long successfulEvents;
    private long failedEvents;
    private long inProgressEvents;
    private double successRate;
    private double failureRate;
    private double averageLatency;
    private double averageProcessingTime;
    private long totalFiles;
    private Map<String, Long> eventsByMechanism;
    private Map<String, Long> eventsByStatus;

    public AnalyticsSummaryResponse() {}

    public long getTotalEvents() { return totalEvents; }
    public void setTotalEvents(long totalEvents) { this.totalEvents = totalEvents; }

    public long getSuccessfulEvents() { return successfulEvents; }
    public void setSuccessfulEvents(long successfulEvents) { this.successfulEvents = successfulEvents; }

    public long getFailedEvents() { return failedEvents; }
    public void setFailedEvents(long failedEvents) { this.failedEvents = failedEvents; }

    public long getInProgressEvents() { return inProgressEvents; }
    public void setInProgressEvents(long inProgressEvents) { this.inProgressEvents = inProgressEvents; }

    public double getSuccessRate() { return successRate; }
    public void setSuccessRate(double successRate) { this.successRate = successRate; }

    public double getFailureRate() { return failureRate; }
    public void setFailureRate(double failureRate) { this.failureRate = failureRate; }

    public double getAverageLatency() { return averageLatency; }
    public void setAverageLatency(double averageLatency) { this.averageLatency = averageLatency; }

    public double getAverageProcessingTime() { return averageProcessingTime; }
    public void setAverageProcessingTime(double averageProcessingTime) { this.averageProcessingTime = averageProcessingTime; }

    public long getTotalFiles() { return totalFiles; }
    public void setTotalFiles(long totalFiles) { this.totalFiles = totalFiles; }

    public Map<String, Long> getEventsByMechanism() { return eventsByMechanism; }
    public void setEventsByMechanism(Map<String, Long> eventsByMechanism) { this.eventsByMechanism = eventsByMechanism; }

    public Map<String, Long> getEventsByStatus() { return eventsByStatus; }
    public void setEventsByStatus(Map<String, Long> eventsByStatus) { this.eventsByStatus = eventsByStatus; }
}
