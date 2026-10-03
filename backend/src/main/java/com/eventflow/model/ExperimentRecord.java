package com.eventflow.model;

import java.time.Instant;

public class ExperimentRecord {
    private String experimentId;
    private String name;
    private String architecture; // S3_NOTIFICATION, EVENTBRIDGE, BOTH
    private int eventCount;
    private int successCount;
    private int failureCount;
    private Double averageLatency;
    private Double p50;
    private Double p90;
    private Double p95;
    private Double p99;
    private Long minLatency;
    private Long maxLatency;
    private Long totalDuration;
    private String status; // PENDING, RUNNING, COMPLETED, FAILED
    private String startedAt;
    private String completedAt;
    private String notes;

    public ExperimentRecord() {
        this.startedAt = Instant.now().toString();
        this.status = "PENDING";
    }

    // Getters and Setters
    public String getExperimentId() { return experimentId; }
    public void setExperimentId(String experimentId) { this.experimentId = experimentId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getArchitecture() { return architecture; }
    public void setArchitecture(String architecture) { this.architecture = architecture; }

    public int getEventCount() { return eventCount; }
    public void setEventCount(int eventCount) { this.eventCount = eventCount; }

    public int getSuccessCount() { return successCount; }
    public void setSuccessCount(int successCount) { this.successCount = successCount; }

    public int getFailureCount() { return failureCount; }
    public void setFailureCount(int failureCount) { this.failureCount = failureCount; }

    public Double getAverageLatency() { return averageLatency; }
    public void setAverageLatency(Double averageLatency) { this.averageLatency = averageLatency; }

    public Double getP50() { return p50; }
    public void setP50(Double p50) { this.p50 = p50; }

    public Double getP90() { return p90; }
    public void setP90(Double p90) { this.p90 = p90; }

    public Double getP95() { return p95; }
    public void setP95(Double p95) { this.p95 = p95; }

    public Double getP99() { return p99; }
    public void setP99(Double p99) { this.p99 = p99; }

    public Long getMinLatency() { return minLatency; }
    public void setMinLatency(Long minLatency) { this.minLatency = minLatency; }

    public Long getMaxLatency() { return maxLatency; }
    public void setMaxLatency(Long maxLatency) { this.maxLatency = maxLatency; }

    public Long getTotalDuration() { return totalDuration; }
    public void setTotalDuration(Long totalDuration) { this.totalDuration = totalDuration; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getStartedAt() { return startedAt; }
    public void setStartedAt(String startedAt) { this.startedAt = startedAt; }

    public String getCompletedAt() { return completedAt; }
    public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
