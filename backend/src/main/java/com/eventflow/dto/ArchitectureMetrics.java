package com.eventflow.dto;

public class ArchitectureMetrics {
    private String architecture;
    private long totalEvents;
    private long successfulEvents;
    private long failedEvents;
    private double successRate;
    private double failureRate;
    private double averageLatency;
    private double averageDeliveryLatency;
    private double averageProcessingLatency;
    private double p50Latency;
    private double p90Latency;
    private double p95Latency;
    private double p99Latency;
    private long minLatency;
    private long maxLatency;

    // Architectural characteristics (qualitative & operational)
    private String routingFlexibility;  // Direct/Bucket-Prefix only vs Multi-rule JSON pattern matching
    private String coupling;            // Tight vs Loose
    private String targetsSupported;    // Lambda/SNS/SQS only vs 20+ AWS service targets
    private String filteringSupport;    // Prefix/Suffix only vs Advanced payload-content filtering

    public ArchitectureMetrics() {}

    public String getArchitecture() { return architecture; }
    public void setArchitecture(String architecture) { this.architecture = architecture; }

    public long getTotalEvents() { return totalEvents; }
    public void setTotalEvents(long totalEvents) { this.totalEvents = totalEvents; }

    public long getSuccessfulEvents() { return successfulEvents; }
    public void setSuccessfulEvents(long successfulEvents) { this.successfulEvents = successfulEvents; }

    public long getFailedEvents() { return failedEvents; }
    public void setFailedEvents(long failedEvents) { this.failedEvents = failedEvents; }

    public double getSuccessRate() { return successRate; }
    public void setSuccessRate(double successRate) { this.successRate = successRate; }

    public double getFailureRate() { return failureRate; }
    public void setFailureRate(double failureRate) { this.failureRate = failureRate; }

    public double getAverageLatency() { return averageLatency; }
    public void setAverageLatency(double averageLatency) { this.averageLatency = averageLatency; }

    public double getAverageDeliveryLatency() { return averageDeliveryLatency; }
    public void setAverageDeliveryLatency(double averageDeliveryLatency) { this.averageDeliveryLatency = averageDeliveryLatency; }

    public double getAverageProcessingLatency() { return averageProcessingLatency; }
    public void setAverageProcessingLatency(double averageProcessingLatency) { this.averageProcessingLatency = averageProcessingLatency; }

    public double getP50Latency() { return p50Latency; }
    public void setP50Latency(double p50Latency) { this.p50Latency = p50Latency; }

    public double getP90Latency() { return p90Latency; }
    public void setP90Latency(double p90Latency) { this.p90Latency = p90Latency; }

    public double getP95Latency() { return p95Latency; }
    public void setP95Latency(double p95Latency) { this.p95Latency = p95Latency; }

    public double getP99Latency() { return p99Latency; }
    public void setP99Latency(double p99Latency) { this.p99Latency = p99Latency; }

    public long getMinLatency() { return minLatency; }
    public void setMinLatency(long minLatency) { this.minLatency = minLatency; }

    public long getMaxLatency() { return maxLatency; }
    public void setMaxLatency(long maxLatency) { this.maxLatency = maxLatency; }

    public String getRoutingFlexibility() { return routingFlexibility; }
    public void setRoutingFlexibility(String routingFlexibility) { this.routingFlexibility = routingFlexibility; }

    public String getCoupling() { return coupling; }
    public void setCoupling(String coupling) { this.coupling = coupling; }

    public String getTargetsSupported() { return targetsSupported; }
    public void setTargetsSupported(String targetsSupported) { this.targetsSupported = targetsSupported; }

    public String getFilteringSupport() { return filteringSupport; }
    public void setFilteringSupport(String filteringSupport) { this.filteringSupport = filteringSupport; }
}
