package com.eventflow.controller;

import com.eventflow.dto.CreateExperimentRequest;
import com.eventflow.model.ExperimentRecord;
import com.eventflow.service.ExperimentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/experiments")
public class ExperimentController {

    private final ExperimentService experimentService;

    public ExperimentController(ExperimentService experimentService) {
        this.experimentService = experimentService;
    }

    @GetMapping
    public ResponseEntity<List<ExperimentRecord>> getAllExperiments() {
        return ResponseEntity.ok(experimentService.getAllExperiments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getExperimentById(@PathVariable("id") String id) {
        return experimentService.getExperimentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ExperimentRecord> createExperiment(@RequestBody CreateExperimentRequest request) {
        ExperimentRecord created = experimentService.createExperiment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/run")
    public ResponseEntity<?> runExperiment(@PathVariable("id") String id) {
        try {
            ExperimentRecord completed = experimentService.runExperiment(id);
            return ResponseEntity.ok(completed);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Experiment failed: " + e.getMessage()));
        }
    }
}
