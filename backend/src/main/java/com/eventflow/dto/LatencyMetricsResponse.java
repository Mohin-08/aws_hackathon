package com.eventflow.dto;

public class LatencyMetricsResponse {
    private String architecture;
    private long sampleCount;
    private double averageDeliveryLatency;
    private double averageProcessingLatency;
    private double averageTotalLatency;
    private double p50;
    private double p90;
    private double p95;
    private double p99;
    private long minLatency;
    private long maxLatency;

    public LatencyMetricsResponse() {}

    public String getArchitecture() { return architecture; }
    public void setArchitecture(String architecture) { this.architecture = architecture; }

    public long getSampleCount() { return sampleCount; }
    public void setSampleCount(long sampleCount) { this.sampleCount = sampleCount; }

    public double getAverageDeliveryLatency() { return averageDeliveryLatency; }
    public void setAverageDeliveryLatency(double averageDeliveryLatency) { this.averageDeliveryLatency = averageDeliveryLatency; }

    public double getAverageProcessingLatency() { return averageProcessingLatency; }
    public void setAverageProcessingLatency(double averageProcessingLatency) { this.averageProcessingLatency = averageProcessingLatency; }

    public double getAverageTotalLatency() { return averageTotalLatency; }
    public void setAverageTotalLatency(double averageTotalLatency) { this.averageTotalLatency = averageTotalLatency; }

    public double getP50() { return p50; }
    public void setP50(Double p50) { this.p50 = p50 != null ? p50 : 0.0; }

    public double getP90() { return p90; }
    public void setP90(Double p90) { this.p90 = p90 != null ? p90 : 0.0; }

    public double getP95() { return p95; }
    public void setP95(Double p95) { this.p95 = p95 != null ? p95 : 0.0; }

    public double getP99() { return p99; }
    public void setP99(Double p99) { this.p99 = p99 != null ? p99 : 0.0; }

    public long getMinLatency() { return minLatency; }
    public void setMinLatency(long minLatency) { this.minLatency = minLatency; }

    public long getMaxLatency() { return maxLatency; }
    public void setMaxLatency(long maxLatency) { this.maxLatency = maxLatency; }
}
