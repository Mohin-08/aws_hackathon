package com.eventflow.aws;

import com.eventflow.model.EventRecord;
import com.eventflow.model.ExperimentRecord;
import com.eventflow.model.FileRecord;
import com.eventflow.model.RuleRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DynamoDBService {
    private static final Logger log = LoggerFactory.getLogger(DynamoDBService.class);

    private final DynamoDbClient dynamoDbClient;

    @Value("${aws.dynamodb.filesTable:EventFlowFiles}")
    private String filesTableName;

    @Value("${aws.dynamodb.eventsTable:EventFlowEvents}")
    private String eventsTableName;

    @Value("${aws.dynamodb.rulesTable:EventFlowRules}")
    private String rulesTableName;

    @Value("${aws.dynamodb.experimentsTable:EventFlowExperiments}")
    private String experimentsTableName;

    // Resilient local store to mirror & fallback seamlessly
    private final Map<String, FileRecord> localFiles = new ConcurrentHashMap<>();
    private final Map<String, EventRecord> localEvents = new ConcurrentHashMap<>();
    private final Map<String, RuleRecord> localRules = new ConcurrentHashMap<>();
    private final Map<String, ExperimentRecord> localExperiments = new ConcurrentHashMap<>();

    private boolean dynamoDbAvailable = false;

    public DynamoDBService(DynamoDbClient dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
    }

    public boolean checkHealth() {
        try {
            ListTablesResponse response = dynamoDbClient.listTables(ListTablesRequest.builder().limit(5).build());
            dynamoDbAvailable = true;
            return true;
        } catch (Exception e) {
            log.debug("DynamoDB health check failed: {}", e.getMessage());
            dynamoDbAvailable = false;
            return false;
        }
    }

    public boolean isAvailable() {
        return dynamoDbAvailable;
    }

    // ==================== FILES ====================

    public void saveFile(FileRecord file) {
        localFiles.put(file.getFileId(), file);
        try {
            Map<String, AttributeValue> item = new HashMap<>();
            item.put("fileId", AttributeValue.builder().s(file.getFileId()).build());
            item.put("fileName", AttributeValue.builder().s(file.getFileName()).build());
            item.put("s3Key", AttributeValue.builder().s(file.getS3Key()).build());
            item.put("fileSize", AttributeValue.builder().n(String.valueOf(file.getFileSize())).build());
            item.put("contentType", AttributeValue.builder().s(file.getContentType()).build());
            item.put("hash", AttributeValue.builder().s(file.getHash()).build());
            item.put("status", AttributeValue.builder().s(file.getStatus()).build());
            item.put("uploadedAt", AttributeValue.builder().s(file.getUploadedAt()).build());
            if (file.getPrefix() != null) item.put("prefix", AttributeValue.builder().s(file.getPrefix()).build());
            if (file.getErrorMessage() != null) item.put("errorMessage", AttributeValue.builder().s(file.getErrorMessage()).build());

            dynamoDbClient.putItem(PutItemRequest.builder()
                    .tableName(filesTableName)
                    .item(item)
                    .build());
            dynamoDbAvailable = true;
        } catch (Exception e) {
            log.debug("DynamoDB saveFile falling back to local memory: {}", e.getMessage());
        }
    }

    public Optional<FileRecord> getFile(String fileId) {
        if (dynamoDbAvailable) {
            try {
                GetItemResponse res = dynamoDbClient.getItem(GetItemRequest.builder()
                        .tableName(filesTableName)
                        .key(Map.of("fileId", AttributeValue.builder().s(fileId).build()))
                        .build());
                if (res.hasItem()) {
                    return Optional.of(mapToFileRecord(res.item()));
                }
            } catch (Exception e) {
                log.debug("DynamoDB getFile failed, using local: {}", e.getMessage());
            }
        }
        return Optional.ofNullable(localFiles.get(fileId));
    }

    public List<FileRecord> getAllFiles() {
        if (dynamoDbAvailable) {
            try {
                ScanResponse response = dynamoDbClient.scan(ScanRequest.builder().tableName(filesTableName).build());
                List<FileRecord> list = new ArrayList<>();
                for (Map<String, AttributeValue> item : response.items()) {
                    FileRecord f = mapToFileRecord(item);
                    list.add(f);
                    localFiles.put(f.getFileId(), f);
                }
                return list;
            } catch (Exception e) {
                log.debug("DynamoDB scan files failed, using local cache: {}", e.getMessage());
            }
        }
        return new ArrayList<>(localFiles.values());
    }

    public void deleteFile(String fileId) {
        localFiles.remove(fileId);
        try {
            dynamoDbClient.deleteItem(DeleteItemRequest.builder()
                    .tableName(filesTableName)
                    .key(Map.of("fileId", AttributeValue.builder().s(fileId).build()))
                    .build());
        } catch (Exception e) {
            log.debug("DynamoDB deleteFile fallback: {}", e.getMessage());
        }
    }

    // ==================== EVENTS ====================

    public void saveEvent(EventRecord event) {
        localEvents.put(event.getEventId(), event);
        try {
            Map<String, AttributeValue> item = new HashMap<>();
            item.put("eventId", AttributeValue.builder().s(event.getEventId()).build());
            if (event.getFileId() != null) item.put("fileId", AttributeValue.builder().s(event.getFileId()).build());
            if (event.getFileName() != null) item.put("fileName", AttributeValue.builder().s(event.getFileName()).build());
            if (event.getS3Key() != null) item.put("s3Key", AttributeValue.builder().s(event.getS3Key()).build());
            if (event.getEventType() != null) item.put("eventType", AttributeValue.builder().s(event.getEventType()).build());
            if (event.getMechanism() != null) item.put("mechanism", AttributeValue.builder().s(event.getMechanism()).build());
            if (event.getSource() != null) item.put("source", AttributeValue.builder().s(event.getSource()).build());
            if (event.getStatus() != null) item.put("status", AttributeValue.builder().s(event.getStatus()).build());
            if (event.getObjectCreatedAt() != null) item.put("objectCreatedAt", AttributeValue.builder().s(event.getObjectCreatedAt()).build());
            if (event.getReceivedAt() != null) item.put("receivedAt", AttributeValue.builder().s(event.getReceivedAt()).build());
            if (event.getProcessingStartedAt() != null) item.put("processingStartedAt", AttributeValue.builder().s(event.getProcessingStartedAt()).build());
            if (event.getProcessingCompletedAt() != null) item.put("processingCompletedAt", AttributeValue.builder().s(event.getProcessingCompletedAt()).build());
            if (event.getEventDeliveryLatency() != null) item.put("eventDeliveryLatency", AttributeValue.builder().n(String.valueOf(event.getEventDeliveryLatency())).build());
            if (event.getProcessingLatency() != null) item.put("processingLatency", AttributeValue.builder().n(String.valueOf(event.getProcessingLatency())).build());
            if (event.getTotalLatency() != null) item.put("totalLatency", AttributeValue.builder().n(String.valueOf(event.getTotalLatency())).build());
            item.put("retryCount", AttributeValue.builder().n(String.valueOf(event.getRetryCount())).build());
            if (event.getErrorMessage() != null) item.put("errorMessage", AttributeValue.builder().s(event.getErrorMessage()).build());
            if (event.getErrorCategory() != null) item.put("errorCategory", AttributeValue.builder().s(event.getErrorCategory()).build());
            if (event.getProcessorName() != null) item.put("processorName", AttributeValue.builder().s(event.getProcessorName()).build());
            if (event.getRuleMatched() != null) item.put("ruleMatched", AttributeValue.builder().s(event.getRuleMatched()).build());

            dynamoDbClient.putItem(PutItemRequest.builder()
                    .tableName(eventsTableName)
                    .item(item)
                    .build());
            dynamoDbAvailable = true;
        } catch (Exception e) {
            log.debug("DynamoDB saveEvent falling back to local memory: {}", e.getMessage());
        }
    }

    public Optional<EventRecord> getEvent(String eventId) {
        if (dynamoDbAvailable) {
            try {
                GetItemResponse res = dynamoDbClient.getItem(GetItemRequest.builder()
                        .tableName(eventsTableName)
                        .key(Map.of("eventId", AttributeValue.builder().s(eventId).build()))
                        .build());
                if (res.hasItem()) {
                    return Optional.of(mapToEventRecord(res.item()));
                }
            } catch (Exception e) {
                log.debug("DynamoDB getEvent failed, using local: {}", e.getMessage());
            }
        }
        return Optional.ofNullable(localEvents.get(eventId));
    }

    public List<EventRecord> getAllEvents() {
        if (dynamoDbAvailable) {
            try {
                ScanResponse response = dynamoDbClient.scan(ScanRequest.builder().tableName(eventsTableName).build());
                List<EventRecord> list = new ArrayList<>();
                for (Map<String, AttributeValue> item : response.items()) {
                    EventRecord e = mapToEventRecord(item);
                    list.add(e);
                    localEvents.put(e.getEventId(), e);
                }
                return list;
            } catch (Exception e) {
                log.debug("DynamoDB scan events failed, using local: {}", e.getMessage());
            }
        }
        return new ArrayList<>(localEvents.values());
    }

    // ==================== RULES ====================

    public void saveRule(RuleRecord rule) {
        localRules.put(rule.getRuleId(), rule);
        try {
            Map<String, AttributeValue> item = new HashMap<>();
            item.put("ruleId", AttributeValue.builder().s(rule.getRuleId()).build());
            item.put("name", AttributeValue.builder().s(rule.getName()).build());
            item.put("prefix", AttributeValue.builder().s(rule.getPrefix()).build());
            item.put("eventType", AttributeValue.builder().s(rule.getEventType()).build());
            item.put("target", AttributeValue.builder().s(rule.getTarget()).build());
            item.put("enabled", AttributeValue.builder().bool(rule.isEnabled()).build());
            item.put("createdAt", AttributeValue.builder().s(rule.getCreatedAt()).build());
            if (rule.getDescription() != null) item.put("description", AttributeValue.builder().s(rule.getDescription()).build());

            dynamoDbClient.putItem(PutItemRequest.builder()
                    .tableName(rulesTableName)
                    .item(item)
                    .build());
        } catch (Exception e) {
            log.debug("DynamoDB saveRule local fallback: {}", e.getMessage());
        }
    }

    public Optional<RuleRecord> getRule(String ruleId) {
        if (dynamoDbAvailable) {
            try {
                GetItemResponse res = dynamoDbClient.getItem(GetItemRequest.builder()
                        .tableName(rulesTableName)
                        .key(Map.of("ruleId", AttributeValue.builder().s(ruleId).build()))
                        .build());
                if (res.hasItem()) {
                    return Optional.of(mapToRuleRecord(res.item()));
                }
            } catch (Exception e) {
                log.debug("DynamoDB getRule fallback: {}", e.getMessage());
            }
        }
        return Optional.ofNullable(localRules.get(ruleId));
    }

    public List<RuleRecord> getAllRules() {
        if (dynamoDbAvailable) {
            try {
                ScanResponse response = dynamoDbClient.scan(ScanRequest.builder().tableName(rulesTableName).build());
                List<RuleRecord> list = new ArrayList<>();
                for (Map<String, AttributeValue> item : response.items()) {
                    RuleRecord r = mapToRuleRecord(item);
                    list.add(r);
                    localRules.put(r.getRuleId(), r);
                }
                return list;
            } catch (Exception e) {
                log.debug("DynamoDB scan rules fallback: {}", e.getMessage());
            }
        }
        return new ArrayList<>(localRules.values());
    }

    public void deleteRule(String ruleId) {
        localRules.remove(ruleId);
        try {
            dynamoDbClient.deleteItem(DeleteItemRequest.builder()
                    .tableName(rulesTableName)
                    .key(Map.of("ruleId", AttributeValue.builder().s(ruleId).build()))
                    .build());
        } catch (Exception e) {
            log.debug("DynamoDB deleteRule fallback: {}", e.getMessage());
        }
    }

    // ==================== EXPERIMENTS ====================

    public void saveExperiment(ExperimentRecord exp) {
        localExperiments.put(exp.getExperimentId(), exp);
        try {
            Map<String, AttributeValue> item = new HashMap<>();
            item.put("experimentId", AttributeValue.builder().s(exp.getExperimentId()).build());
            item.put("name", AttributeValue.builder().s(exp.getName()).build());
            if (exp.getArchitecture() != null) item.put("architecture", AttributeValue.builder().s(exp.getArchitecture()).build());
            item.put("eventCount", AttributeValue.builder().n(String.valueOf(exp.getEventCount())).build());
            item.put("successCount", AttributeValue.builder().n(String.valueOf(exp.getSuccessCount())).build());
            item.put("failureCount", AttributeValue.builder().n(String.valueOf(exp.getFailureCount())).build());
            if (exp.getAverageLatency() != null) item.put("averageLatency", AttributeValue.builder().n(String.valueOf(exp.getAverageLatency())).build());
            if (exp.getP50() != null) item.put("p50", AttributeValue.builder().n(String.valueOf(exp.getP50())).build());
            if (exp.getP90() != null) item.put("p90", AttributeValue.builder().n(String.valueOf(exp.getP90())).build());
            if (exp.getP95() != null) item.put("p95", AttributeValue.builder().n(String.valueOf(exp.getP95())).build());
            if (exp.getP99() != null) item.put("p99", AttributeValue.builder().n(String.valueOf(exp.getP99())).build());
            if (exp.getMinLatency() != null) item.put("minLatency", AttributeValue.builder().n(String.valueOf(exp.getMinLatency())).build());
            if (exp.getMaxLatency() != null) item.put("maxLatency", AttributeValue.builder().n(String.valueOf(exp.getMaxLatency())).build());
            if (exp.getTotalDuration() != null) item.put("totalDuration", AttributeValue.builder().n(String.valueOf(exp.getTotalDuration())).build());
            if (exp.getStatus() != null) item.put("status", AttributeValue.builder().s(exp.getStatus()).build());
            if (exp.getStartedAt() != null) item.put("startedAt", AttributeValue.builder().s(exp.getStartedAt()).build());
            if (exp.getCompletedAt() != null) item.put("completedAt", AttributeValue.builder().s(exp.getCompletedAt()).build());
            if (exp.getNotes() != null) item.put("notes", AttributeValue.builder().s(exp.getNotes()).build());

            dynamoDbClient.putItem(PutItemRequest.builder()
                    .tableName(experimentsTableName)
                    .item(item)
                    .build());
        } catch (Exception e) {
            log.debug("DynamoDB saveExperiment fallback: {}", e.getMessage());
        }
    }

    public Optional<ExperimentRecord> getExperiment(String expId) {
        if (dynamoDbAvailable) {
            try {
                GetItemResponse res = dynamoDbClient.getItem(GetItemRequest.builder()
                        .tableName(experimentsTableName)
                        .key(Map.of("experimentId", AttributeValue.builder().s(expId).build()))
                        .build());
                if (res.hasItem()) {
                    return Optional.of(mapToExperimentRecord(res.item()));
                }
            } catch (Exception e) {
                log.debug("DynamoDB getExperiment fallback: {}", e.getMessage());
            }
        }
        return Optional.ofNullable(localExperiments.get(expId));
    }

    public List<ExperimentRecord> getAllExperiments() {
        if (dynamoDbAvailable) {
            try {
                ScanResponse response = dynamoDbClient.scan(ScanRequest.builder().tableName(experimentsTableName).build());
                List<ExperimentRecord> list = new ArrayList<>();
                for (Map<String, AttributeValue> item : response.items()) {
                    ExperimentRecord exp = mapToExperimentRecord(item);
                    list.add(exp);
                    localExperiments.put(exp.getExperimentId(), exp);
                }
                return list;
            } catch (Exception e) {
                log.debug("DynamoDB scan experiments fallback: {}", e.getMessage());
            }
        }
        return new ArrayList<>(localExperiments.values());
    }

    // ==================== MAPPERS ====================

    private FileRecord mapToFileRecord(Map<String, AttributeValue> item) {
        FileRecord f = new FileRecord();
        if (item.containsKey("fileId")) f.setFileId(item.get("fileId").s());
        if (item.containsKey("fileName")) f.setFileName(item.get("fileName").s());
        if (item.containsKey("s3Key")) f.setS3Key(item.get("s3Key").s());
        if (item.containsKey("fileSize")) f.setFileSize(Long.parseLong(item.get("fileSize").n()));
        if (item.containsKey("contentType")) f.setContentType(item.get("contentType").s());
        if (item.containsKey("hash")) f.setHash(item.get("hash").s());
        if (item.containsKey("status")) f.setStatus(item.get("status").s());
        if (item.containsKey("uploadedAt")) f.setUploadedAt(item.get("uploadedAt").s());
        if (item.containsKey("prefix")) f.setPrefix(item.get("prefix").s());
        if (item.containsKey("errorMessage")) f.setErrorMessage(item.get("errorMessage").s());
        return f;
    }

    private EventRecord mapToEventRecord(Map<String, AttributeValue> item) {
        EventRecord e = new EventRecord();
        if (item.containsKey("eventId")) e.setEventId(item.get("eventId").s());
        if (item.containsKey("fileId")) e.setFileId(item.get("fileId").s());
        if (item.containsKey("fileName")) e.setFileName(item.get("fileName").s());
        if (item.containsKey("s3Key")) e.setS3Key(item.get("s3Key").s());
        if (item.containsKey("eventType")) e.setEventType(item.get("eventType").s());
        if (item.containsKey("mechanism")) e.setMechanism(item.get("mechanism").s());
        if (item.containsKey("source")) e.setSource(item.get("source").s());
        if (item.containsKey("status")) e.setStatus(item.get("status").s());
        if (item.containsKey("objectCreatedAt")) e.setObjectCreatedAt(item.get("objectCreatedAt").s());
        if (item.containsKey("receivedAt")) e.setReceivedAt(item.get("receivedAt").s());
        if (item.containsKey("processingStartedAt")) e.setProcessingStartedAt(item.get("processingStartedAt").s());
        if (item.containsKey("processingCompletedAt")) e.setProcessingCompletedAt(item.get("processingCompletedAt").s());
        if (item.containsKey("eventDeliveryLatency")) e.setEventDeliveryLatency(Long.parseLong(item.get("eventDeliveryLatency").n()));
        if (item.containsKey("processingLatency")) e.setProcessingLatency(Long.parseLong(item.get("processingLatency").n()));
        if (item.containsKey("totalLatency")) e.setTotalLatency(Long.parseLong(item.get("totalLatency").n()));
        if (item.containsKey("retryCount")) e.setRetryCount(Integer.parseInt(item.get("retryCount").n()));
        if (item.containsKey("errorMessage")) e.setErrorMessage(item.get("errorMessage").s());
        if (item.containsKey("errorCategory")) e.setErrorCategory(item.get("errorCategory").s());
        if (item.containsKey("processorName")) e.setProcessorName(item.get("processorName").s());
        if (item.containsKey("ruleMatched")) e.setRuleMatched(item.get("ruleMatched").s());
        return e;
    }

    private RuleRecord mapToRuleRecord(Map<String, AttributeValue> item) {
        RuleRecord r = new RuleRecord();
        if (item.containsKey("ruleId")) r.setRuleId(item.get("ruleId").s());
        if (item.containsKey("name")) r.setName(item.get("name").s());
        if (item.containsKey("prefix")) r.setPrefix(item.get("prefix").s());
        if (item.containsKey("eventType")) r.setEventType(item.get("eventType").s());
        if (item.containsKey("target")) r.setTarget(item.get("target").s());
        if (item.containsKey("enabled")) r.setEnabled(item.get("enabled").bool());
        if (item.containsKey("createdAt")) r.setCreatedAt(item.get("createdAt").s());
        if (item.containsKey("description")) r.setDescription(item.get("description").s());
        return r;
    }

    private ExperimentRecord mapToExperimentRecord(Map<String, AttributeValue> item) {
        ExperimentRecord exp = new ExperimentRecord();
        if (item.containsKey("experimentId")) exp.setExperimentId(item.get("experimentId").s());
        if (item.containsKey("name")) exp.setName(item.get("name").s());
        if (item.containsKey("architecture")) exp.setArchitecture(item.get("architecture").s());
        if (item.containsKey("eventCount")) exp.setEventCount(Integer.parseInt(item.get("eventCount").n()));
        if (item.containsKey("successCount")) exp.setSuccessCount(Integer.parseInt(item.get("successCount").n()));
        if (item.containsKey("failureCount")) exp.setFailureCount(Integer.parseInt(item.get("failureCount").n()));
        if (item.containsKey("averageLatency")) exp.setAverageLatency(Double.parseDouble(item.get("averageLatency").n()));
        if (item.containsKey("p50")) exp.setP50(Double.parseDouble(item.get("p50").n()));
        if (item.containsKey("p90")) exp.setP90(Double.parseDouble(item.get("p90").n()));
        if (item.containsKey("p95")) exp.setP95(Double.parseDouble(item.get("p95").n()));
        if (item.containsKey("p99")) exp.setP99(Double.parseDouble(item.get("p99").n()));
        if (item.containsKey("minLatency")) exp.setMinLatency(Long.parseLong(item.get("minLatency").n()));
        if (item.containsKey("maxLatency")) exp.setMaxLatency(Long.parseLong(item.get("maxLatency").n()));
        if (item.containsKey("totalDuration")) exp.setTotalDuration(Long.parseLong(item.get("totalDuration").n()));
        if (item.containsKey("status")) exp.setStatus(item.get("status").s());
        if (item.containsKey("startedAt")) exp.setStartedAt(item.get("startedAt").s());
        if (item.containsKey("completedAt")) exp.setCompletedAt(item.get("completedAt").s());
        if (item.containsKey("notes")) exp.setNotes(item.get("notes").s());
        return exp;
    }
}
