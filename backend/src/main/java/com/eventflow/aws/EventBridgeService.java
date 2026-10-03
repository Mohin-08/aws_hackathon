package com.eventflow.aws;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.eventbridge.EventBridgeClient;
import software.amazon.awssdk.services.eventbridge.model.*;

import java.util.List;

@Service
public class EventBridgeService {
    private static final Logger log = LoggerFactory.getLogger(EventBridgeService.class);

    private final EventBridgeClient eventBridgeClient;

    public EventBridgeService(EventBridgeClient eventBridgeClient) {
        this.eventBridgeClient = eventBridgeClient;
    }

    public boolean checkHealth() {
        try {
            ListRulesResponse response = eventBridgeClient.listRules(ListRulesRequest.builder().limit(5).build());
            return true;
        } catch (Exception e) {
            log.debug("EventBridge health check failed: {}", e.getMessage());
            return false;
        }
    }

    public List<Rule> listRules() {
        try {
            ListRulesResponse res = eventBridgeClient.listRules(ListRulesRequest.builder().build());
            return res.rules();
        } catch (Exception e) {
            log.debug("EventBridge listRules failed: {}", e.getMessage());
            return List.of();
        }
    }

    public boolean putRule(String ruleName, String eventPattern, String description) {
        try {
            PutRuleRequest request = PutRuleRequest.builder()
                    .name(ruleName)
                    .eventPattern(eventPattern)
                    .description(description)
                    .state(RuleState.ENABLED)
                    .build();
            eventBridgeClient.putRule(request);
            log.info("Successfully created/updated EventBridge rule: {}", ruleName);
            return true;
        } catch (Exception e) {
            log.warn("Failed to create EventBridge rule in AWS (simulated locally): {}", e.getMessage());
            return false;
        }
    }

    public boolean deleteRule(String ruleName) {
        try {
            // First remove targets if any
            eventBridgeClient.deleteRule(DeleteRuleRequest.builder().name(ruleName).build());
            return true;
        } catch (Exception e) {
            log.debug("Delete EventBridge rule fallback: {}", e.getMessage());
            return false;
        }
    }
}
