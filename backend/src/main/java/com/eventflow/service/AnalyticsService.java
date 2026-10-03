package com.eventflow.service;

import com.eventflow.aws.DynamoDBService;
import com.eventflow.dto.AnalyticsSummaryResponse;
import com.eventflow.dto.ErrorAnalyticsResponse;
import com.eventflow.dto.LatencyMetricsResponse;
import com.eventflow.model.EventRecord;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final DynamoDBService dynamoDBService;

    public AnalyticsService(DynamoDBService dynamoDBService) {
        this.dynamoDBService = dynamoDBService;
    }

    public AnalyticsSummaryResponse getSummary() {
        List<EventRecord> events = dynamoDBService.getAllEvents();
        long totalFiles = dynamoDBService.getAllFiles().size();

        long total = events.size();
        long successful = events.stream().filter(e -> "SUCCESS".equalsIgnoreCase(e.getStatus())).count();
        long failed = events.stream().filter(e -> "FAILED".equalsIgnoreCase(e.getStatus())).count();
        long inProgress = events.stream().filter(e -> "PROCESSING".equalsIgnoreCase(e.getStatus()) || "EVENT_RECEIVED".equalsIgnoreCase(e.getStatus())).count();

        double successRate = total > 0 ? (double) successful / total * 100.0 : 0.0;
        double failureRate = total > 0 ? (double) failed / total * 100.0 : 0.0;

        double avgLatency = events.stream()
                .filter(e -> e.getTotalLatency() != null)
                .mapToLong(EventRecord::getTotalLatency)
                .average()
                .orElse(0.0);

        double avgProcessing = events.stream()
                .filter(e -> e.getProcessingLatency() != null)
                .mapToLong(EventRecord::getProcessingLatency)
                .average()
                .orElse(0.0);

        Map<String, Long> byMechanism = events.stream()
                .collect(Collectors.groupingBy(e -> e.getMechanism() != null ? e.getMechanism() : "UNKNOWN", Collectors.counting()));

        Map<String, Long> byStatus = events.stream()
                .collect(Collectors.groupingBy(e -> e.getStatus() != null ? e.getStatus() : "UNKNOWN", Collectors.counting()));

        AnalyticsSummaryResponse summary = new AnalyticsSummaryResponse();
        summary.setTotalEvents(total);
        summary.setSuccessfulEvents(successful);
        summary.setFailedEvents(failed);
        summary.setInProgressEvents(inProgress);
        summary.setSuccessRate(Math.round(successRate * 100.0) / 100.0);
        summary.setFailureRate(Math.round(failureRate * 100.0) / 100.0);
        summary.setAverageLatency(Math.round(avgLatency * 100.0) / 100.0);
        summary.setAverageProcessingTime(Math.round(avgProcessing * 100.0) / 100.0);
        summary.setTotalFiles(totalFiles);
        summary.setEventsByMechanism(byMechanism);
        summary.setEventsByStatus(byStatus);

        return summary;
    }

    public LatencyMetricsResponse getLatencyMetrics(String architecture) {
        List<EventRecord> events = dynamoDBService.getAllEvents().stream()
                .filter(e -> architecture == null || architecture.isBlank() || architecture.equalsIgnoreCase("ALL") ||
                        (e.getMechanism() != null && e.getMechanism().equalsIgnoreCase(architecture)))
                .filter(e -> e.getTotalLatency() != null && e.getTotalLatency() > 0)
                .collect(Collectors.toList());

        LatencyMetricsResponse metrics = new LatencyMetricsResponse();
        metrics.setArchitecture(architecture != null && !architecture.isBlank() ? architecture : "ALL");
        metrics.setSampleCount(events.size());

        if (events.isEmpty()) {
            return metrics;
        }

        List<Long> totalLatencies = events.stream().map(EventRecord::getTotalLatency).sorted().toList();
        List<Long> deliveryLatencies = events.stream()
                .map(EventRecord::getEventDeliveryLatency)
                .filter(Objects::nonNull)
                .sorted()
                .toList();
        List<Long> procLatencies = events.stream()
                .map(EventRecord::getProcessingLatency)
                .filter(Objects::nonNull)
                .sorted()
                .toList();

        metrics.setAverageTotalLatency(round(totalLatencies.stream().mapToLong(Long::longValue).average().orElse(0.0)));
        metrics.setAverageDeliveryLatency(round(deliveryLatencies.stream().mapToLong(Long::longValue).average().orElse(0.0)));
        metrics.setAverageProcessingLatency(round(procLatencies.stream().mapToLong(Long::longValue).average().orElse(0.0)));

        metrics.setMinLatency(totalLatencies.get(0));
        metrics.setMaxLatency(totalLatencies.get(totalLatencies.size() - 1));

        metrics.setP50(calculatePercentile(totalLatencies, 50));
        metrics.setP90(calculatePercentile(totalLatencies, 90));
        metrics.setP95(calculatePercentile(totalLatencies, 95));
        metrics.setP99(calculatePercentile(totalLatencies, 99));

        return metrics;
    }

    public ErrorAnalyticsResponse getErrorAnalytics() {
        List<EventRecord> events = dynamoDBService.getAllEvents();
        List<EventRecord> failedEvents = events.stream()
                .filter(e -> "FAILED".equalsIgnoreCase(e.getStatus()) || e.getErrorMessage() != null)
                .toList();

        Map<String, Long> byCategory = new HashMap<>();
        byCategory.put("INVALID_FILE", 0L);
        byCategory.put("LAMBDA_ERROR", 0L);
        byCategory.put("TIMEOUT", 0L);
        byCategory.put("PERMISSION_ERROR", 0L);
        byCategory.put("DATABASE_ERROR", 0L);
        byCategory.put("UNKNOWN", 0L);

        for (EventRecord e : failedEvents) {
            String cat = e.getErrorCategory() != null ? e.getErrorCategory() : "UNKNOWN";
            byCategory.put(cat, byCategory.getOrDefault(cat, 0L) + 1);
        }

        Map<String, Long> byMechanism = failedEvents.stream()
                .collect(Collectors.groupingBy(e -> e.getMechanism() != null ? e.getMechanism() : "UNKNOWN", Collectors.counting()));

        return new ErrorAnalyticsResponse(failedEvents.size(), byCategory, byMechanism);
    }

    public static double calculatePercentile(List<Long> sortedValues, double percentile) {
        if (sortedValues == null || sortedValues.isEmpty()) {
            return 0.0;
        }
        int index = (int) Math.ceil((percentile / 100.0) * sortedValues.size()) - 1;
        index = Math.max(0, Math.min(index, sortedValues.size() - 1));
        return sortedValues.get(index).doubleValue();
    }

    private double round(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}
