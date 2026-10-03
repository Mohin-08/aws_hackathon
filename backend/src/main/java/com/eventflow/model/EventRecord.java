package com.eventflow.model;

import java.time.Instant;

public class EventRecord {
    private String eventId;
    private String fileId;
    private String fileName;
    private String s3Key;
    private String eventType; // OBJECT_CREATED, OBJECT_REMOVED, etc.
    private String mechanism; // S3_NOTIFICATION, EVENTBRIDGE
    private String source;    // aws.s3
    private String status;    // EVENT_RECEIVED, PROCESSING, SUCCESS, FAILED
    private String objectCreatedAt;
    private String receivedAt;
    private String processingStartedAt;
    private String processingCompletedAt;
    private Long eventDeliveryLatency; // ms: receivedAt - objectCreatedAt
    private Long processingLatency;    // ms: processingCompletedAt - processingStartedAt
    private Long totalLatency;         // ms: processingCompletedAt - objectCreatedAt
    private int retryCount;
    private String errorMessage;
    private String errorCategory; // INVALID_FILE, LAMBDA_ERROR, TIMEOUT, PERMISSION_ERROR, DATABASE_ERROR, UNKNOWN
    private String processorName;
    private String ruleMatched;

    public EventRecord() {
        this.receivedAt = Instant.now().toString();
        this.status = "EVENT_RECEIVED";
        this.retryCount = 0;
    }

    // Getters and Setters
    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getFileId() { return fileId; }
    public void setFileId(String fileId) { this.fileId = fileId; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getS3Key() { return s3Key; }
    public void setS3Key(String s3Key) { this.s3Key = s3Key; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getMechanism() { return mechanism; }
    public void setMechanism(String mechanism) { this.mechanism = mechanism; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getObjectCreatedAt() { return objectCreatedAt; }
    public void setObjectCreatedAt(String objectCreatedAt) { this.objectCreatedAt = objectCreatedAt; }

    public String getReceivedAt() { return receivedAt; }
    public void setReceivedAt(String receivedAt) { this.receivedAt = receivedAt; }

    public String getProcessingStartedAt() { return processingStartedAt; }
    public void setProcessingStartedAt(String processingStartedAt) { this.processingStartedAt = processingStartedAt; }

    public String getProcessingCompletedAt() { return processingCompletedAt; }
    public void setProcessingCompletedAt(String processingCompletedAt) { this.processingCompletedAt = processingCompletedAt; }

    public Long getEventDeliveryLatency() { return eventDeliveryLatency; }
    public void setEventDeliveryLatency(Long eventDeliveryLatency) { this.eventDeliveryLatency = eventDeliveryLatency; }

    public Long getProcessingLatency() { return processingLatency; }
    public void setProcessingLatency(Long processingLatency) { this.processingLatency = processingLatency; }

    public Long getTotalLatency() { return totalLatency; }
    public void setTotalLatency(Long totalLatency) { this.totalLatency = totalLatency; }

    public int getRetryCount() { return retryCount; }
    public void setRetryCount(int retryCount) { this.retryCount = retryCount; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public String getErrorCategory() { return errorCategory; }
    public void setErrorCategory(String errorCategory) { this.errorCategory = errorCategory; }

    public String getProcessorName() { return processorName; }
    public void setProcessorName(String processorName) { this.processorName = processorName; }

    public String getRuleMatched() { return ruleMatched; }
    public void setRuleMatched(String ruleMatched) { this.ruleMatched = ruleMatched; }
}
