package com.eventflow.dto;

public class DuplicateCheckResponse {
    private boolean duplicate;
    private String hash;
    private String originalFileId;
    private String originalFileName;
    private String originalUploadedAt;
    private String message;

    public DuplicateCheckResponse() {}

    public DuplicateCheckResponse(boolean duplicate, String hash, String originalFileId, String originalFileName, String originalUploadedAt, String message) {
        this.duplicate = duplicate;
        this.hash = hash;
        this.originalFileId = originalFileId;
        this.originalFileName = originalFileName;
        this.originalUploadedAt = originalUploadedAt;
        this.message = message;
    }

    public boolean isDuplicate() { return duplicate; }
    public void setDuplicate(boolean duplicate) { this.duplicate = duplicate; }

    public String getHash() { return hash; }
    public void setHash(String hash) { this.hash = hash; }

    public String getOriginalFileId() { return originalFileId; }
    public void setOriginalFileId(String originalFileId) { this.originalFileId = originalFileId; }

    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }

    public String getOriginalUploadedAt() { return originalUploadedAt; }
    public void setOriginalUploadedAt(String originalUploadedAt) { this.originalUploadedAt = originalUploadedAt; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
