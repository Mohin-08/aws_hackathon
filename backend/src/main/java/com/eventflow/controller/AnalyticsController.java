package com.eventflow.controller;

import com.eventflow.dto.AnalyticsSummaryResponse;
import com.eventflow.dto.ErrorAnalyticsResponse;
import com.eventflow.dto.LatencyMetricsResponse;
import com.eventflow.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryResponse> getSummary() {
        return ResponseEntity.ok(analyticsService.getSummary());
    }

    @GetMapping("/latency")
    public ResponseEntity<LatencyMetricsResponse> getLatency(
            @RequestParam(value = "architecture", required = false) String architecture) {
        return ResponseEntity.ok(analyticsService.getLatencyMetrics(architecture));
    }

    @GetMapping("/errors")
    public ResponseEntity<ErrorAnalyticsResponse> getErrors() {
        return ResponseEntity.ok(analyticsService.getErrorAnalytics());
    }

    @GetMapping("/success-rate")
    public ResponseEntity<?> getSuccessRate() {
        AnalyticsSummaryResponse summary = analyticsService.getSummary();
        return ResponseEntity.ok(Map.of(
                "successRate", summary.getSuccessRate(),
                "failureRate", summary.getFailureRate(),
                "totalEvents", summary.getTotalEvents(),
                "successfulEvents", summary.getSuccessfulEvents(),
                "failedEvents", summary.getFailedEvents()
        ));
    }
}
