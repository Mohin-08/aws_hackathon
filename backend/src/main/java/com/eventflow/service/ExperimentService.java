package com.eventflow.service;

import com.eventflow.aws.DynamoDBService;
import com.eventflow.aws.S3Service;
import com.eventflow.dto.CreateExperimentRequest;
import com.eventflow.model.EventRecord;
import com.eventflow.model.ExperimentRecord;
import com.eventflow.model.FileRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
public class ExperimentService {
    private static final Logger log = LoggerFactory.getLogger(ExperimentService.class);

    private final DynamoDBService dynamoDBService;
    private final EventService eventService;

    public ExperimentService(DynamoDBService dynamoDBService, EventService eventService) {
        this.dynamoDBService = dynamoDBService;
        this.eventService = eventService;
    }

    public List<ExperimentRecord> getAllExperiments() {
        return dynamoDBService.getAllExperiments();
    }

    public Optional<ExperimentRecord> getExperimentById(String expId) {
        return dynamoDBService.getExperiment(expId);
    }

    public ExperimentRecord createExperiment(CreateExperimentRequest req) {
        ExperimentRecord exp = new ExperimentRecord();
        exp.setExperimentId("exp-" + UUID.randomUUID().toString().substring(0, 8));
        exp.setName(req.getName() != null ? req.getName() : "Controlled Benchmark " + req.getEventCount() + " files");
        exp.setArchitecture(req.getArchitecture() != null ? req.getArchitecture() : "BOTH");
        exp.setEventCount(req.getEventCount() > 0 ? req.getEventCount() : 10);
        exp.setNotes(req.getNotes());
        exp.setStatus("PENDING");

        dynamoDBService.saveExperiment(exp);
        return exp;
    }

    public ExperimentRecord runExperiment(String expId) {
        Optional<ExperimentRecord> expOpt = dynamoDBService.getExperiment(expId);
        if (expOpt.isEmpty()) {
            throw new NoSuchElementException("Experiment not found: " + expId);
        }

        ExperimentRecord exp = expOpt.get();
        exp.setStatus("RUNNING");
        exp.setStartedAt(Instant.now().toString());
        dynamoDBService.saveExperiment(exp);

        Instant benchmarkStart = Instant.now();
        List<Long> latencies = new ArrayList<>();
        int successCount = 0;
        int failureCount = 0;

        String architecture = exp.getArchitecture();
        int count = exp.getEventCount();

        log.info("Starting controlled benchmark experiment: {} [count={}, arch={}]", exp.getName(), count, architecture);

        for (int i = 1; i <= count; i++) {
            String fileName = "benchmark-doc-" + i + ".pdf";
            String fileId = "bench-" + UUID.randomUUID().toString().substring(0, 8);
            String s3Key = "uploads/reports/" + fileId + "_" + fileName;
            byte[] syntheticContent = ("Sample benchmark report payload item #" + i + " content").getBytes(StandardCharsets.UTF_8);
            String hash = S3Service.calculateSha256(syntheticContent);

            FileRecord benchFile = new FileRecord(fileId, fileName, s3Key, syntheticContent.length, "application/pdf", hash, "uploads/reports/");
            benchFile.setStatus("UPLOADED");
            benchFile.setUploadedAt(Instant.now().toString());
            dynamoDBService.saveFile(benchFile);

            // Execute pipeline
            if ("BOTH".equalsIgnoreCase(architecture)) {
                EventRecord evA = eventService.processEventForArchitecture(benchFile, "S3_NOTIFICATION");
                EventRecord evB = eventService.processEventForArchitecture(benchFile, "EVENTBRIDGE");
                latencies.add(evA.getTotalLatency());
                latencies.add(evB.getTotalLatency());
                if ("SUCCESS".equals(evA.getStatus())) successCount++; else failureCount++;
                if ("SUCCESS".equals(evB.getStatus())) successCount++; else failureCount++;
            } else {
                EventRecord ev = eventService.processEventForArchitecture(benchFile, architecture);
                latencies.add(ev.getTotalLatency());
                if ("SUCCESS".equals(ev.getStatus())) successCount++; else failureCount++;
            }
        }

        Instant benchmarkEnd = Instant.now();
        long totalDurationMs = Duration.between(benchmarkStart, benchmarkEnd).toMillis();

        Collections.sort(latencies);

        exp.setSuccessCount(successCount);
        exp.setFailureCount(failureCount);
        exp.setTotalDuration(totalDurationMs);
        exp.setCompletedAt(benchmarkEnd.toString());
        exp.setStatus("COMPLETED");

        if (!latencies.isEmpty()) {
            double avg = latencies.stream().mapToLong(Long::longValue).average().orElse(0.0);
            exp.setAverageLatency(Math.round(avg * 100.0) / 100.0);
            exp.setMinLatency(latencies.get(0));
            exp.setMaxLatency(latencies.get(latencies.size() - 1));
            exp.setP50(AnalyticsService.calculatePercentile(latencies, 50));
            exp.setP90(AnalyticsService.calculatePercentile(latencies, 90));
            exp.setP95(AnalyticsService.calculatePercentile(latencies, 95));
            exp.setP99(AnalyticsService.calculatePercentile(latencies, 99));
        }

        dynamoDBService.saveExperiment(exp);
        log.info("Completed experiment {}: P50={}ms, P95={}ms, TotalDuration={}ms", exp.getExperimentId(), exp.getP50(), exp.getP95(), totalDurationMs);
        return exp;
    }
}
