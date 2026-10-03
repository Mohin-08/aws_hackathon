package com.eventflow.service;

import com.eventflow.aws.DynamoDBService;
import com.eventflow.aws.S3Service;
import com.eventflow.dto.DuplicateCheckResponse;
import com.eventflow.dto.FileValidationResponse;
import com.eventflow.model.FileRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FileService {
    private static final Logger log = LoggerFactory.getLogger(FileService.class);

    private static final long MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "pdf", "png", "jpg", "jpeg", "json", "csv", "xml", "txt", "docx", "xlsx"
    );
    private static final Set<String> DISALLOWED_EXTENSIONS = Set.of(
            "exe", "bat", "cmd", "sh", "bin", "dll", "vbs", "msi", "jar"
    );

    private final S3Service s3Service;
    private final DynamoDBService dynamoDBService;
    private final EventService eventService;

    public FileService(S3Service s3Service, DynamoDBService dynamoDBService, EventService eventService) {
        this.s3Service = s3Service;
        this.dynamoDBService = dynamoDBService;
        this.eventService = eventService;
    }

    public FileValidationResponse validateFile(MultipartFile file) {
        List<String> errors = new ArrayList<>();
        if (file == null || file.isEmpty()) {
            errors.add("File is empty or not provided");
            return new FileValidationResponse(false, "", "", 0, "", errors);
        }

        String fileName = file.getOriginalFilename();
        if (fileName == null || fileName.trim().isEmpty()) {
            errors.add("Filename is required");
            return new FileValidationResponse(false, "", "", 0, "", errors);
        }

        // Filename rules: reject path traversal or malicious chars
        if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
            errors.add("Filename contains invalid or dangerous characters");
        }

        // Extension check
        String ext = getFileExtension(fileName).toLowerCase();
        if (DISALLOWED_EXTENSIONS.contains(ext)) {
            errors.add("File extension '." + ext + "' is rejected for security reasons (executable/script)");
        } else if (!ALLOWED_EXTENSIONS.contains(ext)) {
            errors.add("Unsupported file extension '." + ext + "'. Allowed: " + String.join(", ", ALLOWED_EXTENSIONS));
        }

        // Size check
        if (file.getSize() > MAX_FILE_SIZE) {
            errors.add("File size (" + (file.getSize() / 1024 / 1024) + "MB) exceeds maximum limit of 25MB");
        }

        String detectedPrefix = detectPrefix(fileName, ext);
        boolean valid = errors.isEmpty();

        return new FileValidationResponse(
                valid,
                fileName,
                file.getContentType() != null ? file.getContentType() : "application/octet-stream",
                file.getSize(),
                detectedPrefix,
                errors
        );
    }

    public DuplicateCheckResponse checkDuplicate(byte[] fileBytes) {
        String hash = S3Service.calculateSha256(fileBytes);
        List<FileRecord> existingFiles = dynamoDBService.getAllFiles();

        for (FileRecord existing : existingFiles) {
            if (hash.equalsIgnoreCase(existing.getHash())) {
                return new DuplicateCheckResponse(
                        true,
                        hash,
                        existing.getFileId(),
                        existing.getFileName(),
                        existing.getUploadedAt(),
                        "Exact duplicate detected. Matches existing file: " + existing.getFileName()
                );
            }
        }

        return new DuplicateCheckResponse(false, hash, null, null, null, "File is unique. No duplicates found.");
    }

    public FileRecord uploadFile(MultipartFile file, String prefixOverride, String forceMechanism) throws Exception {
        FileValidationResponse validation = validateFile(file);
        if (!validation.isValid()) {
            throw new IllegalArgumentException("File validation failed: " + String.join("; ", validation.getValidationErrors()));
        }

        byte[] bytes = file.getBytes();
        DuplicateCheckResponse duplicateCheck = checkDuplicate(bytes);

        String prefix = (prefixOverride != null && !prefixOverride.isBlank())
                ? prefixOverride.trim()
                : validation.getDetectedPrefix();

        if (!prefix.endsWith("/")) {
            prefix += "/";
        }
        if (!prefix.startsWith("uploads/")) {
            prefix = "uploads/" + prefix;
        }

        String fileId = UUID.randomUUID().toString();
        String originalName = file.getOriginalFilename();
        String s3Key = prefix + fileId + "_" + originalName;

        FileRecord fileRecord = new FileRecord(
                fileId,
                originalName,
                s3Key,
                file.getSize(),
                file.getContentType(),
                duplicateCheck.getHash(),
                prefix
        );

        if (duplicateCheck.isDuplicate()) {
            fileRecord.setStatus("DUPLICATE");
            fileRecord.setErrorMessage(duplicateCheck.getMessage());
        }

        // Upload to S3
        try (InputStream is = new ByteArrayInputStream(bytes)) {
            s3Service.uploadFile(s3Key, is, bytes.length, file.getContentType());
        }

        // Save to DynamoDB
        dynamoDBService.saveFile(fileRecord);
        log.info("File created and registered in DynamoDB: fileId={}, key={}", fileId, s3Key);

        // Trigger processing pipeline for the uploaded file
        // In full AWS deployment, S3 Event Notification or EventBridge will invoke Lambda.
        // For unified testing, local demo, and benchmarking, our eventService processes or mirrors both architectures:
        eventService.triggerEventPipeline(fileRecord, forceMechanism);

        return fileRecord;
    }

    public List<FileRecord> getAllFiles(String search, String status, String prefix) {
        List<FileRecord> files = dynamoDBService.getAllFiles();
        return files.stream()
                .filter(f -> search == null || search.isBlank() ||
                        f.getFileName().toLowerCase().contains(search.toLowerCase()) ||
                        f.getS3Key().toLowerCase().contains(search.toLowerCase()) ||
                        f.getFileId().equalsIgnoreCase(search))
                .filter(f -> status == null || status.isBlank() || f.getStatus().equalsIgnoreCase(status))
                .filter(f -> prefix == null || prefix.isBlank() ||
                        (f.getPrefix() != null && f.getPrefix().toLowerCase().contains(prefix.toLowerCase())))
                .sorted((a, b) -> b.getUploadedAt().compareTo(a.getUploadedAt()))
                .collect(Collectors.toList());
    }

    public Optional<FileRecord> getFileById(String fileId) {
        return dynamoDBService.getFile(fileId);
    }

    public boolean deleteFile(String fileId) {
        Optional<FileRecord> fileOpt = dynamoDBService.getFile(fileId);
        if (fileOpt.isPresent()) {
            FileRecord file = fileOpt.get();
            s3Service.deleteFile(file.getS3Key());
            dynamoDBService.deleteFile(fileId);
            return true;
        }
        return false;
    }

    private String getFileExtension(String fileName) {
        int dot = fileName.lastIndexOf('.');
        return dot > 0 ? fileName.substring(dot + 1) : "";
    }

    private String detectPrefix(String fileName, String ext) {
        String lower = fileName.toLowerCase();
        if (lower.contains("invoice") || lower.contains("bill") || lower.contains("receipt")) {
            return "invoices";
        } else if (lower.contains("report") || lower.contains("summary") || lower.contains("statement")) {
            return "reports";
        } else if (Set.of("png", "jpg", "jpeg", "gif", "webp").contains(ext)) {
            return "images";
        }
        return "general";
    }
}
