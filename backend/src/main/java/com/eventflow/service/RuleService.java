package com.eventflow.service;

import com.eventflow.aws.DynamoDBService;
import com.eventflow.aws.EventBridgeService;
import com.eventflow.dto.CreateRuleRequest;
import com.eventflow.model.RuleRecord;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RuleService {
    private static final Logger log = LoggerFactory.getLogger(RuleService.class);

    private final DynamoDBService dynamoDBService;
    private final EventBridgeService eventBridgeService;

    public RuleService(DynamoDBService dynamoDBService, EventBridgeService eventBridgeService) {
        this.dynamoDBService = dynamoDBService;
        this.eventBridgeService = eventBridgeService;
    }

    @PostConstruct
    public void initDefaultRules() {
        if (dynamoDBService.getAllRules().isEmpty()) {
            log.info("Initializing default EventBridge routing rules");
            createDefaultRule("rule-invoices", "Invoice Processing Rule", "uploads/invoices/", "Object Created", "Lambda B - Invoice Processor", "Routes invoice uploads to dedicated financial parser");
            createDefaultRule("rule-reports", "Report Processing Rule", "uploads/reports/", "Object Created", "Lambda B - Report Processor", "Routes business reports to summary analyzer");
            createDefaultRule("rule-images", "Media Processing Rule", "uploads/images/", "Object Created", "Lambda B - Image Processor", "Routes uploaded media to thumbnail generator");
            createDefaultRule("rule-audit", "Global EventBridge Audit Rule", "uploads/", "All Events", "Lambda B - Event Auditor", "Captures all S3 object events for centralized event audit");
        }
    }

    private void createDefaultRule(String id, String name, String prefix, String eventType, String target, String desc) {
        RuleRecord rule = new RuleRecord(id, name, prefix, eventType, target, desc);
        dynamoDBService.saveRule(rule);
    }

    public List<RuleRecord> getAllRules() {
        return dynamoDBService.getAllRules();
    }

    public Optional<RuleRecord> getRuleById(String ruleId) {
        return dynamoDBService.getRule(ruleId);
    }

    public RuleRecord createRule(CreateRuleRequest req) {
        String ruleId = "rule-" + UUID.randomUUID().toString().substring(0, 8);
        RuleRecord rule = new RuleRecord(
                ruleId,
                req.getName(),
                req.getPrefix() != null ? req.getPrefix() : "uploads/",
                req.getEventType() != null ? req.getEventType() : "Object Created",
                req.getTarget() != null ? req.getTarget() : "Lambda B - EventBridge Handler",
                req.getDescription() != null ? req.getDescription() : "Custom routing rule"
        );
        if (req.getEnabled() != null) {
            rule.setEnabled(req.getEnabled());
        }

        dynamoDBService.saveRule(rule);

        // Attempt creation in real AWS EventBridge if connected
        String pattern = String.format("{\"source\": [\"aws.s3\"], \"detail-type\": [\"Object Created\"], \"detail\": {\"object\": {\"key\": [{\"prefix\": \"%s\"}]}}}", rule.getPrefix());
        eventBridgeService.putRule(rule.getName().replaceAll("[^a-zA-Z0-9-_]", "-"), pattern, rule.getDescription());

        return rule;
    }

    public RuleRecord updateRule(String ruleId, CreateRuleRequest req) {
        Optional<RuleRecord> existingOpt = dynamoDBService.getRule(ruleId);
        if (existingOpt.isEmpty()) {
            throw new IllegalArgumentException("Rule not found with ID: " + ruleId);
        }

        RuleRecord rule = existingOpt.get();
        if (req.getName() != null) rule.setName(req.getName());
        if (req.getPrefix() != null) rule.setPrefix(req.getPrefix());
        if (req.getEventType() != null) rule.setEventType(req.getEventType());
        if (req.getTarget() != null) rule.setTarget(req.getTarget());
        if (req.getDescription() != null) rule.setDescription(req.getDescription());
        if (req.getEnabled() != null) rule.setEnabled(req.getEnabled());

        dynamoDBService.saveRule(rule);
        return rule;
    }

    public boolean deleteRule(String ruleId) {
        Optional<RuleRecord> ruleOpt = dynamoDBService.getRule(ruleId);
        if (ruleOpt.isPresent()) {
            eventBridgeService.deleteRule(ruleOpt.get().getName());
            dynamoDBService.deleteRule(ruleId);
            return true;
        }
        return false;
    }
}
