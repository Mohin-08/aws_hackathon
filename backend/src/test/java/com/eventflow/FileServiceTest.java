package com.eventflow;

import com.eventflow.aws.S3Service;
import org.junit.jupiter.api.Test;
import java.nio.charset.StandardCharsets;
import static org.junit.jupiter.api.Assertions.*;

class FileServiceTest {

    @Test
    void testSha256Determinism() {
        byte[] payloadA = "Sample Invoice Data 12345".getBytes(StandardCharsets.UTF_8);
        byte[] payloadB = "Sample Invoice Data 12345".getBytes(StandardCharsets.UTF_8);
        byte[] payloadC = "Different content".getBytes(StandardCharsets.UTF_8);

        String hashA = S3Service.calculateSha256(payloadA);
        String hashB = S3Service.calculateSha256(payloadB);
        String hashC = S3Service.calculateSha256(payloadC);

        assertNotNull(hashA);
        assertEquals(hashA, hashB);
        assertNotEquals(hashA, hashC);
        assertEquals(64, hashA.length()); // SHA-256 produces 64 hex chars
    }
}
