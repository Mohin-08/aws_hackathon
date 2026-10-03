package com.eventflow.dto;

import java.util.Map;

public class SystemHealthResponse {
    private String status; // UP, DEGRADED, DOWN
    private String version;
    private String timestamp;
    private Map<String, ServiceStatus> services;
    private AwsConfigStatus aws;

    public static class ServiceStatus {
        private String status; // CONNECTED, DISCONNECTED, MOCK_MODE, ERROR
        private String details;
        private long latencyMs;

        public ServiceStatus() {}
        public ServiceStatus(String status, String details, long latencyMs) {
            this.status = status;
            this.details = details;
            this.latencyMs = latencyMs;
        }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getDetails() { return details; }
        public void setDetails(String details) { this.details = details; }
        public long getLatencyMs() { return latencyMs; }
        public void setLatencyMs(long latencyMs) { this.latencyMs = latencyMs; }
    }

    public static class AwsConfigStatus {
        private String region;
        private String bucket;
        private boolean credentialsConfigured;
        private boolean sessionTokenPresent;
        private String iamRole;

        public AwsConfigStatus() {}
        public AwsConfigStatus(String region, String bucket, boolean credentialsConfigured, boolean sessionTokenPresent, String iamRole) {
            this.region = region;
            this.bucket = bucket;
            this.credentialsConfigured = credentialsConfigured;
            this.sessionTokenPresent = sessionTokenPresent;
            this.iamRole = iamRole;
        }

        public String getRegion() { return region; }
        public void setRegion(String region) { this.region = region; }
        public String getBucket() { return bucket; }
        public void setBucket(String bucket) { this.bucket = bucket; }
        public boolean isCredentialsConfigured() { return credentialsConfigured; }
        public void setCredentialsConfigured(boolean credentialsConfigured) { this.credentialsConfigured = credentialsConfigured; }
        public boolean isSessionTokenPresent() { return sessionTokenPresent; }
        public void setSessionTokenPresent(boolean sessionTokenPresent) { this.sessionTokenPresent = sessionTokenPresent; }
        public String getIamRole() { return iamRole; }
        public void setIamRole(String iamRole) { this.iamRole = iamRole; }
    }

    public SystemHealthResponse() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public Map<String, ServiceStatus> getServices() { return services; }
    public void setServices(Map<String, ServiceStatus> services) { this.services = services; }
    public AwsConfigStatus getAws() { return aws; }
    public void setAws(AwsConfigStatus aws) { this.aws = aws; }
}
