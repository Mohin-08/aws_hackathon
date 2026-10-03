package com.eventflow.model;

import java.time.Instant;

public class FileRecord {
    private String fileId;
    private String fileName;
    private String s3Key;
    private long fileSize;
    private String contentType;
    private String hash;
    private String status; // UPLOADED, PROCESSED, ERROR, DUPLICATE
    private String uploadedAt;
    private String prefix;
    private String errorMessage;

    public FileRecord() {
        this.uploadedAt = Instant.now().toString();
        this.status = "UPLOADED";
    }

    public FileRecord(String fileId, String fileName, String s3Key, long fileSize, String contentType, String hash, String prefix) {
        this.fileId = fileId;
        this.fileName = fileName;
        this.s3Key = s3Key;
        this.fileSize = fileSize;
        this.contentType = contentType;
        this.hash = hash;
        this.prefix = prefix;
        this.status = "UPLOADED";
        this.uploadedAt = Instant.now().toString();
    }

    // Getters and Setters
    public String getFileId() { return fileId; }
    public void setFileId(String fileId) { this.fileId = fileId; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getS3Key() { return s3Key; }
    public void setS3Key(String s3Key) { this.s3Key = s3Key; }

    public long getFileSize() { return fileSize; }
    public void setFileSize(long fileSize) { this.fileSize = fileSize; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public String getHash() { return hash; }
    public void setHash(String hash) { this.hash = hash; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(String uploadedAt) { this.uploadedAt = uploadedAt; }

    public String getPrefix() { return prefix; }
    public void setPrefix(String prefix) { this.prefix = prefix; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}
