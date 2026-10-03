package com.eventflow;

import io.github.cdimascio.dotenv.Dotenv;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;

@SpringBootApplication
public class EventFlowApplication {
    private static final Logger log = LoggerFactory.getLogger(EventFlowApplication.class);

    public static void main(String[] args) {
        // Automatically load .env from current directory or parent directory
        loadDotenv();
        SpringApplication.run(EventFlowApplication.class, args);
        log.info("=================================================================");
        log.info("🚀 EventFlow Backend successfully initialized and running on port 8080");
        log.info("API Docs: http://localhost:8080/api/system/health");
        log.info("=================================================================");
    }

    private static void loadDotenv() {
        try {
            File envFile = new File(".env");
            File parentEnvFile = new File("../.env");
            Dotenv dotenv = null;

            if (envFile.exists()) {
                dotenv = Dotenv.configure().ignoreIfMissing().load();
                log.info("Loaded .env from current directory");
            } else if (parentEnvFile.exists()) {
                dotenv = Dotenv.configure().directory("../").ignoreIfMissing().load();
                log.info("Loaded .env from parent directory");
            }

            if (dotenv != null) {
                dotenv.entries().forEach(entry -> {
                    if (System.getProperty(entry.getKey()) == null && System.getenv(entry.getKey()) == null) {
                        System.setProperty(entry.getKey(), entry.getValue());
                    }
                });
            }
        } catch (Exception e) {
            log.warn("Could not load .env file: {}", e.getMessage());
        }
    }
}
