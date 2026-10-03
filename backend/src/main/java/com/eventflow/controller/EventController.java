package com.eventflow.controller;

import com.eventflow.model.EventRecord;
import com.eventflow.model.TimelineItem;
import com.eventflow.service.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public ResponseEntity<List<EventRecord>> getEvents(
            @RequestParam(value = "mechanism", required = false) String mechanism,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "eventType", required = false) String eventType,
            @RequestParam(value = "search", required = false) String search) {
        return ResponseEntity.ok(eventService.getAllEvents(mechanism, status, eventType, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEventById(@PathVariable("id") String id) {
        return eventService.getEventById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/timeline")
    public ResponseEntity<List<TimelineItem>> getEventTimeline(@PathVariable("id") String id) {
        List<TimelineItem> timeline = eventService.getEventTimeline(id);
        if (timeline.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(timeline);
    }

    @PostMapping("/{id}/retry")
    public ResponseEntity<?> retryEvent(@PathVariable("id") String id) {
        try {
            EventRecord retried = eventService.retryEvent(id);
            return ResponseEntity.ok(retried);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/replay")
    public ResponseEntity<?> replayEvent(@PathVariable("id") String id) {
        try {
            EventRecord replayed = eventService.replayEvent(id);
            return ResponseEntity.ok(replayed);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
