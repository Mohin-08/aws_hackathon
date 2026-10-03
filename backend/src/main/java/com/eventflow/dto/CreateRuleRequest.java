package com.eventflow.dto;

public class CreateRuleRequest {
    private String name;
    private String prefix;
    private String eventType;
    private String target;
    private String description;
    private Boolean enabled;

    public CreateRuleRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPrefix() { return prefix; }
    public void setPrefix(String prefix) { this.prefix = prefix; }
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
}
