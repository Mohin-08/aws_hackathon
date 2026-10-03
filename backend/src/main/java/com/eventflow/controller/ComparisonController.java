package com.eventflow.controller;

import com.eventflow.dto.ComparisonResponse;
import com.eventflow.service.ComparisonService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/comparison")
public class ComparisonController {

    private final ComparisonService comparisonService;

    public ComparisonController(ComparisonService comparisonService) {
        this.comparisonService = comparisonService;
    }

    @GetMapping
    public ResponseEntity<ComparisonResponse> getComparison() {
        return ResponseEntity.ok(comparisonService.getComparison());
    }

    @GetMapping("/latency")
    public ResponseEntity<?> getLatencyComparison() {
        ComparisonResponse comp = comparisonService.getComparison();
        return ResponseEntity.ok(Map.of(
                "s3Notification", Map.of(
                        "averageLatency", comp.getS3Notification().getAverageLatency(),
                        "deliveryLatency", comp.getS3Notification().getAverageDeliveryLatency(),
                        "processingLatency", comp.getS3Notification().getAverageProcessingLatency(),
                        "p50", comp.getS3Notification().getP50Latency(),
                        "p95", comp.getS3Notification().getP95Latency(),
                        "p99", comp.getS3Notification().getP99Latency()
                ),
                "eventBridge", Map.of(
                        "averageLatency", comp.getEventBridge().getAverageLatency(),
                        "deliveryLatency", comp.getEventBridge().getAverageDeliveryLatency(),
                        "processingLatency", comp.getEventBridge().getAverageProcessingLatency(),
                        "p50", comp.getEventBridge().getP50Latency(),
                        "p95", comp.getEventBridge().getP95Latency(),
                        "p99", comp.getEventBridge().getP99Latency()
                )
        ));
    }

    @GetMapping("/reliability")
    public ResponseEntity<?> getReliabilityComparison() {
        ComparisonResponse comp = comparisonService.getComparison();
        return ResponseEntity.ok(Map.of(
                "s3Notification", Map.of(
                        "totalEvents", comp.getS3Notification().getTotalEvents(),
                        "successRate", comp.getS3Notification().getSuccessRate(),
                        "failureRate", comp.getS3Notification().getFailureRate(),
                        "successfulEvents", comp.getS3Notification().getSuccessfulEvents(),
                        "failedEvents", comp.getS3Notification().getFailedEvents()
                ),
                "eventBridge", Map.of(
                        "totalEvents", comp.getEventBridge().getTotalEvents(),
                        "successRate", comp.getEventBridge().getSuccessRate(),
                        "failureRate", comp.getEventBridge().getFailureRate(),
                        "successfulEvents", comp.getEventBridge().getSuccessfulEvents(),
                        "failedEvents", comp.getEventBridge().getFailedEvents()
                )
        ));
    }

    @GetMapping("/routing")
    public ResponseEntity<?> getRoutingComparison() {
        ComparisonResponse comp = comparisonService.getComparison();
        return ResponseEntity.ok(Map.of(
                "s3Notification", Map.of(
                        "flexibility", comp.getS3Notification().getRoutingFlexibility(),
                        "coupling", comp.getS3Notification().getCoupling(),
                        "targets", comp.getS3Notification().getTargetsSupported(),
                        "filtering", comp.getS3Notification().getFilteringSupport()
                ),
                "eventBridge", Map.of(
                        "flexibility", comp.getEventBridge().getRoutingFlexibility(),
                        "coupling", comp.getEventBridge().getCoupling(),
                        "targets", comp.getEventBridge().getTargetsSupported(),
                        "filtering", comp.getEventBridge().getFilteringSupport()
                ),
                "detailedFeatures", comp.getFeatureComparison()
        ));
    }
}
