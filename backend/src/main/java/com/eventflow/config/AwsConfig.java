package com.eventflow.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.AwsSessionCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cloudwatch.CloudWatchClient;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.eventbridge.EventBridgeClient;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class AwsConfig {
    private static final Logger log = LoggerFactory.getLogger(AwsConfig.class);

    @Value("${aws.region:us-east-1}")
    private String regionStr;

    @Value("${aws.accessKeyId:}")
    private String accessKeyId;

    @Value("${aws.secretAccessKey:}")
    private String secretAccessKey;

    @Value("${aws.sessionToken:}")
    private String sessionToken;

    @Value("${aws.s3.bucket:eventflow-hackathon-data-demo}")
    private String bucketName;

    @Bean
    public Region awsRegion() {
        return Region.of(regionStr != null && !regionStr.isBlank() ? regionStr : "us-east-1");
    }

    @Bean
    public AwsCredentialsProvider awsCredentialsProvider() {
        if (accessKeyId != null && !accessKeyId.isBlank() &&
            secretAccessKey != null && !secretAccessKey.isBlank() &&
            !accessKeyId.contains("paste_your_access_key")) {

            if (sessionToken != null && !sessionToken.isBlank() && !sessionToken.contains("paste_your_session_token")) {
                log.info("Configuring AWS with Session Token (AWS Academy Learner Lab)");
                return StaticCredentialsProvider.create(
                        AwsSessionCredentials.create(accessKeyId.trim(), secretAccessKey.trim(), sessionToken.trim())
                );
            } else {
                log.info("Configuring AWS with Basic Credentials");
                return StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKeyId.trim(), secretAccessKey.trim())
                );
            }
        }
        log.info("Using Default AWS Credentials Provider Chain");
        return DefaultCredentialsProvider.create();
    }

    @Bean
    public S3Client s3Client(Region region, AwsCredentialsProvider credentialsProvider) {
        try {
            return S3Client.builder()
                    .region(region)
                    .credentialsProvider(credentialsProvider)
                    .build();
        } catch (Exception e) {
            log.warn("S3Client initialization warning: {}", e.getMessage());
            return S3Client.builder().region(region).build();
        }
    }

    @Bean
    public DynamoDbClient dynamoDbClient(Region region, AwsCredentialsProvider credentialsProvider) {
        try {
            return DynamoDbClient.builder()
                    .region(region)
                    .credentialsProvider(credentialsProvider)
                    .build();
        } catch (Exception e) {
            log.warn("DynamoDbClient initialization warning: {}", e.getMessage());
            return DynamoDbClient.builder().region(region).build();
        }
    }

    @Bean
    public EventBridgeClient eventBridgeClient(Region region, AwsCredentialsProvider credentialsProvider) {
        try {
            return EventBridgeClient.builder()
                    .region(region)
                    .credentialsProvider(credentialsProvider)
                    .build();
        } catch (Exception e) {
            log.warn("EventBridgeClient initialization warning: {}", e.getMessage());
            return EventBridgeClient.builder().region(region).build();
        }
    }

    @Bean
    public CloudWatchClient cloudWatchClient(Region region, AwsCredentialsProvider credentialsProvider) {
        try {
            return CloudWatchClient.builder()
                    .region(region)
                    .credentialsProvider(credentialsProvider)
                    .build();
        } catch (Exception e) {
            log.warn("CloudWatchClient initialization warning: {}", e.getMessage());
            return CloudWatchClient.builder().region(region).build();
        }
    }

    public String getBucketName() {
        return bucketName;
    }
}
