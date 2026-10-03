package com.eventflow.service;

import com.eventflow.aws.DynamoDBService;
import com.eventflow.dto.ArchitectureMetrics;
import com.eventflow.dto.ComparisonResponse;
import com.eventflow.dto.LatencyMetricsResponse;
import com.eventflow.model.EventRecord;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ComparisonService {

    private final DynamoDBService dynamoDBService;
    private final AnalyticsService analyticsService;

    public ComparisonService(DynamoDBService dynamoDBService, AnalyticsService analyticsService) {
        this.dynamoDBService = dynamoDBService;
        this.analyticsService = analyticsService;
    }

    public ComparisonResponse getComparison() {
        ArchitectureMetrics s3Notification = calculateMetricsForArchitecture("S3_NOTIFICATION");
        ArchitectureMetrics eventBridge = calculateMetricsForArchitecture("EVENTBRIDGE");

        s3Notification.setRoutingFlexibility("Direct point-to-point via S3 bucket prefix and suffix matching only");
        s3Notification.setCoupling("Tight coupling: S3 bucket configuration directly names destination Lambda/SQS/SNS");
        s3Notification.setTargetsSupported("Limited destinations: AWS Lambda, SNS Topic, SQS Queue");
        s3Notification.setFilteringSupport("Simple prefix/suffix string matching (no content-based JSON filtering)");

        eventBridge.setRoutingFlexibility("Highly flexible: Rule-based routing with rich JSON event pattern matching");
        eventBridge.setCoupling("Loose coupling: Publisher (S3) has zero knowledge of subscribers or target services");
        eventBridge.setTargetsSupported("Extensive: 20+ AWS service targets (Step Functions, Lambda, Kinesis, ECS, API Gateway, etc.)");
        eventBridge.setFilteringSupport("Advanced filtering: Content matching, numeric ranges, prefix, wildcard, multiple rules per event");

        Map<String, Object> featureComparison = new LinkedHashMap<>();
        featureComparison.put("Delivery Latency Profile", Map.of(
                "S3_NOTIFICATION", "Direct invocation (low overhead, ~25-50ms delivery)",
                "EVENTBRIDGE", "Bus routing overhead (~45-90ms delivery due to pattern evaluation & bus transport)"
        ));
        featureComparison.put("Fan-Out Capabilities", Map.of(
                "S3_NOTIFICATION", "Single destination per prefix/suffix filter pair (cannot easily fan-out without adding SNS)",
                "EVENTBRIDGE", "Native fan-out up to 5 targets per rule, multiple rules matching the same S3 event"
        ));
        featureComparison.put("Dead Letter Queue (DLQ) Support", Map.of(
                "S3_NOTIFICATION", "Configurable on Lambda execution side or SQS target",
                "EVENTBRIDGE", "Configurable directly on EventBridge Rule target level with retry policies"
        ));
        featureComparison.put("Cross-Account / Cross-Region", Map.of(
                "S3_NOTIFICATION", "Complex setup requiring cross-account IAM or SNS intermediate topics",
                "EVENTBRIDGE", "Native event bus forwarding across AWS accounts and AWS regions"
        ));
        featureComparison.put("Replay / Archive Capabilities", Map.of(
                "S3_NOTIFICATION", "No native archive or event replay from S3 direct notifications",
                "EVENTBRIDGE", "Native EventBridge Event Archive and Point-in-Time Event Replay"
        ));

        return new ComparisonResponse(s3Notification, eventBridge, featureComparison);
    }

    private ArchitectureMetrics calculateMetricsForArchitecture(String mechanism) {
        List<EventRecord> allEvents = dynamoDBService.getAllEvents();
        List<EventRecord> archEvents = allEvents.stream()
                .filter(e -> mechanism.equalsIgnoreCase(e.getMechanism()))
                .toList();

        ArchitectureMetrics m = new ArchitectureMetrics();
        m.setArchitecture(mechanism);
        m.setTotalEvents(archEvents.size());

        long successful = archEvents.stream().filter(e -> "SUCCESS".equalsIgnoreCase(e.getStatus())).count();
        long failed = archEvents.stream().filter(e -> "FAILED".equalsIgnoreCase(e.getStatus())).count();
        m.setSuccessfulEvents(successful);
        m.setFailedEvents(failed);

        m.setSuccessRate(archEvents.isEmpty() ? 0.0 : round((double) successful / archEvents.size() * 100.0));
        m.setFailureRate(archEvents.isEmpty() ? 0.0 : round((double) failed / archEvents.size() * 100.0));

        LatencyMetricsResponse latency = analyticsService.getLatencyMetrics(mechanism);
        m.setAverageLatency(latency.getAverageTotalLatency());
        m.setAverageDeliveryLatency(latency.getAverageDeliveryLatency());
        m.setAverageProcessingLatency(latency.getAverageProcessingLatency());
        m.setP50Latency(latency.getP50());
        m.setP90Latency(latency.getP90());
        m.setP95Latency(latency.getP95());
        m.setP99Latency(latency.getP99());
        m.setMinLatency(latency.getMinLatency());
        m.setMaxLatency(latency.getMaxLatency());

        return m;
    }

    private double round(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}
