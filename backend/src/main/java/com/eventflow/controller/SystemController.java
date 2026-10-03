package com.eventflow.controller;

import com.eventflow.aws.CloudWatchService;
import com.eventflow.aws.DynamoDBService;
import com.eventflow.aws.EventBridgeService;
import com.eventflow.aws.S3Service;
import com.eventflow.config.AwsConfig;
import com.eventflow.dto.SystemHealthResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/system")
public class SystemController {

    private final S3Service s3Service;
    private final DynamoDBService dynamoDBService;
    private final EventBridgeService eventBridgeService;
    private final CloudWatchService cloudWatchService;
    private final AwsConfig awsConfig;

    @Value("${aws.region:us-east-1}")
    private String region;

    @Value("${aws.accessKeyId:}")
    private String accessKeyId;

    @Value("${aws.sessionToken:}")
    private String sessionToken;

    public SystemController(S3Service s3Service, DynamoDBService dynamoDBService,
                            EventBridgeService eventBridgeService, CloudWatchService cloudWatchService,
                            AwsConfig awsConfig) {
        this.s3Service = s3Service;
        this.dynamoDBService = dynamoDBService;
        this.eventBridgeService = eventBridgeService;
        this.cloudWatchService = cloudWatchService;
        this.awsConfig = awsConfig;
    }

    @GetMapping("/health")
    public ResponseEntity<SystemHealthResponse> getHealth() {
        SystemHealthResponse res = new SystemHealthResponse();
        res.setStatus("UP");
        res.setVersion("1.0.0");
        res.setTimestamp(Instant.now().toString());

        Map<String, SystemHealthResponse.ServiceStatus> services = new LinkedHashMap<>();

        // Spring Boot backend
        services.put("backend", new SystemHealthResponse.ServiceStatus("CONNECTED", "Spring Boot 3 API active on port 8080", 0L));

        // S3
        long startS3 = System.currentTimeMillis();
        boolean s3Ok = s3Service.checkHealth();
        long s3Latency = System.currentTimeMillis() - startS3;
        services.put("s3", new SystemHealthResponse.ServiceStatus(
                s3Ok ? "CONNECTED" : "FALLBACK_MODE",
                s3Ok ? "S3 Bucket connected: " + s3Service.getBucketName() : "S3 Bucket not reachable or local fallback active",
                s3Latency
        ));

        // DynamoDB
        long startDdb = System.currentTimeMillis();
        boolean ddbOk = dynamoDBService.checkHealth();
        long ddbLatency = System.currentTimeMillis() - startDdb;
        services.put("dynamodb", new SystemHealthResponse.ServiceStatus(
                ddbOk ? "CONNECTED" : "FALLBACK_MODE",
                ddbOk ? "DynamoDB tables connected and reachable" : "DynamoDB in-memory high-fidelity store active (ready to sync with AWS tables)",
                ddbLatency
        ));

        // EventBridge
        long startEb = System.currentTimeMillis();
        boolean ebOk = eventBridgeService.checkHealth();
        long ebLatency = System.currentTimeMillis() - startEb;
        services.put("eventbridge", new SystemHealthResponse.ServiceStatus(
                ebOk ? "CONNECTED" : "FALLBACK_MODE",
                ebOk ? "EventBridge default bus active" : "EventBridge local rule simulator active",
                ebLatency
        ));

        // CloudWatch
        long startCw = System.currentTimeMillis();
        boolean cwOk = cloudWatchService.checkHealth();
        long cwLatency = System.currentTimeMillis() - startCw;
        services.put("cloudwatch", new SystemHealthResponse.ServiceStatus(
                cwOk ? "CONNECTED" : "FALLBACK_MODE",
                cwOk ? "CloudWatch logs & metrics stream reachable" : "CloudWatch local logger active",
                cwLatency
        ));

        boolean credentialsPresent = accessKeyId != null && !accessKeyId.isBlank() && !accessKeyId.contains("paste_your_access_key");
        boolean sessionTokenPresent = sessionToken != null && !sessionToken.isBlank() && !sessionToken.contains("paste_your_session_token");

        res.setServices(services);
        res.setAws(new SystemHealthResponse.AwsConfigStatus(
                region,
                s3Service.getBucketName(),
                credentialsPresent,
                sessionTokenPresent,
                "arn:aws:iam::[accountId]:role/LabRole"
        ));

        return ResponseEntity.ok(res);
    }

    @GetMapping("/aws-status")
    public ResponseEntity<?> getAwsStatus() {
        return getHealth();
    }
}
