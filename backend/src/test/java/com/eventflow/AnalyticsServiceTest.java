package com.eventflow;

import com.eventflow.service.AnalyticsService;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class AnalyticsServiceTest {

    @Test
    void testPercentileCalculations() {
        List<Long> latencies = List.of(10L, 20L, 30L, 40L, 50L, 60L, 70L, 80L, 90L, 100L);

        double p50 = AnalyticsService.calculatePercentile(latencies, 50);
        double p90 = AnalyticsService.calculatePercentile(latencies, 90);
        double p95 = AnalyticsService.calculatePercentile(latencies, 95);
        double p99 = AnalyticsService.calculatePercentile(latencies, 99);

        assertEquals(50.0, p50);
        assertEquals(90.0, p90);
        assertEquals(100.0, p95);
        assertEquals(100.0, p99);
    }

    @Test
    void testEmptyListPercentile() {
        double p50 = AnalyticsService.calculatePercentile(List.of(), 50);
        assertEquals(0.0, p50);
    }
}
