package com.eventflow.controller;

import com.eventflow.dto.DuplicateCheckResponse;
import com.eventflow.dto.FileValidationResponse;
import com.eventflow.model.FileRecord;
import com.eventflow.service.FileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @PostMapping
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "prefix", required = false) String prefix,
            @RequestParam(value = "mechanism", required = false) String mechanism) {
        try {
            FileRecord record = fileService.uploadFile(file, prefix, mechanism);
            return ResponseEntity.status(HttpStatus.CREATED).body(record);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Upload failed: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<FileRecord>> getFiles(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "prefix", required = false) String prefix) {
        return ResponseEntity.ok(fileService.getAllFiles(search, status, prefix));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getFileById(@PathVariable("id") String id) {
        return fileService.getFileById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFile(@PathVariable("id") String id) {
        boolean deleted = fileService.deleteFile(id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "File deleted successfully", "fileId", id));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/validate")
    public ResponseEntity<FileValidationResponse> validateFile(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(fileService.validateFile(file));
    }

    @PostMapping("/check-duplicate")
    public ResponseEntity<DuplicateCheckResponse> checkDuplicate(@RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(fileService.checkDuplicate(file.getBytes()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new DuplicateCheckResponse(false, "", null, null, null, e.getMessage()));
        }
    }
}
