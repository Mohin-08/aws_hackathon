package com.eventflow.controller;

import com.eventflow.dto.CreateRuleRequest;
import com.eventflow.model.RuleRecord;
import com.eventflow.service.RuleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rules")
public class RuleController {

    private final RuleService ruleService;

    public RuleController(RuleService ruleService) {
        this.ruleService = ruleService;
    }

    @GetMapping
    public ResponseEntity<List<RuleRecord>> getRules() {
        return ResponseEntity.ok(ruleService.getAllRules());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRuleById(@PathVariable("id") String id) {
        return ruleService.getRuleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<RuleRecord> createRule(@RequestBody CreateRuleRequest request) {
        RuleRecord created = ruleService.createRule(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRule(@PathVariable("id") String id, @RequestBody CreateRuleRequest request) {
        try {
            RuleRecord updated = ruleService.updateRule(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRule(@PathVariable("id") String id) {
        boolean deleted = ruleService.deleteRule(id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Rule deleted", "ruleId", id));
        }
        return ResponseEntity.notFound().build();
    }
}
