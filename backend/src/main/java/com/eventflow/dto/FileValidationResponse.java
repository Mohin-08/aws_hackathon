package com.eventflow.dto;

import java.util.List;

public class FileValidationResponse {
    private boolean valid;
    private String fileName;
    private String contentType;
    private long fileSize;
    private String detectedPrefix;
    private List<String> validationErrors;

    public FileValidationResponse() {}

    public FileValidationResponse(boolean valid, String fileName, String contentType, long fileSize, String detectedPrefix, List<String> validationErrors) {
        this.valid = valid;
        this.fileName = fileName;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.detectedPrefix = detectedPrefix;
        this.validationErrors = validationErrors;
    }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public long getFileSize() { return fileSize; }
    public void setFileSize(long fileSize) { this.fileSize = fileSize; }

    public String getDetectedPrefix() { return detectedPrefix; }
    public void setDetectedPrefix(String detectedPrefix) { this.detectedPrefix = detectedPrefix; }

    public List<String> getValidationErrors() { return validationErrors; }
    public void setValidationErrors(List<String> validationErrors) { this.validationErrors = validationErrors; }
}
