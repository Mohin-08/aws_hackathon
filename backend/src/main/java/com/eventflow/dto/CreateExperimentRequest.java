package com.eventflow.dto;

public class CreateExperimentRequest {
    private String name;
    private String architecture; // S3_NOTIFICATION, EVENTBRIDGE, BOTH
    private int eventCount; // 10, 25, 50
    private String notes;

    public CreateExperimentRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getArchitecture() { return architecture; }
    public void setArchitecture(String architecture) { this.architecture = architecture; }
    public int getEventCount() { return eventCount; }
    public void setEventCount(int eventCount) { this.eventCount = eventCount; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
