package com.eventflow.model;

import java.time.Instant;

public class RuleRecord {
    private String ruleId;
    private String name;
    private String prefix;
    private String eventType;
    private String target;
    private boolean enabled;
    private String createdAt;
    private String description;

    public RuleRecord() {
        this.createdAt = Instant.now().toString();
        this.enabled = true;
    }

    public RuleRecord(String ruleId, String name, String prefix, String eventType, String target, String description) {
        this.ruleId = ruleId;
        this.name = name;
        this.prefix = prefix;
        this.eventType = eventType;
        this.target = target;
        this.description = description;
        this.enabled = true;
        this.createdAt = Instant.now().toString();
    }

    // Getters and Setters
    public String getRuleId() { return ruleId; }
    public void setRuleId(String ruleId) { this.ruleId = ruleId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPrefix() { return prefix; }
    public void setPrefix(String prefix) { this.prefix = prefix; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
