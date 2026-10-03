package com.eventflow.aws;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.cloudwatch.CloudWatchClient;
import software.amazon.awssdk.services.cloudwatch.model.ListMetricsRequest;

@Service
public class CloudWatchService {
    private static final Logger log = LoggerFactory.getLogger(CloudWatchService.class);

    private final CloudWatchClient cloudWatchClient;

    public CloudWatchService(CloudWatchClient cloudWatchClient) {
        this.cloudWatchClient = cloudWatchClient;
    }

    public boolean checkHealth() {
        try {
            cloudWatchClient.listMetrics(ListMetricsRequest.builder().namespace("AWS/Lambda").build());
            return true;
        } catch (Exception e) {
            log.debug("CloudWatch check failed: {}", e.getMessage());
            return false;
        }
    }
}
