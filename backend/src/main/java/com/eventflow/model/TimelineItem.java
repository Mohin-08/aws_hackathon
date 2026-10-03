package com.eventflow.model;

public class TimelineItem {
    private String stage;       // UPLOADED, EVENT_RECEIVED, PROCESSING, SUCCESS, FAILED, RETRIED, REPLAYED
    private String timestamp;
    private Long durationMs;
    private String details;
    private String status;      // SUCCESS, FAILED, INFO, WARNING

    public TimelineItem() {}

    public TimelineItem(String stage, String timestamp, Long durationMs, String details, String status) {
        this.stage = stage;
        this.timestamp = timestamp;
        this.durationMs = durationMs;
        this.details = details;
        this.status = status;
    }

    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public Long getDurationMs() { return durationMs; }
    public void setDurationMs(Long durationMs) { this.durationMs = durationMs; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
