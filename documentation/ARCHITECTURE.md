# EventFlow — Architecture & Design Specification

## 1. System Overview
**EventFlow** is an enterprise event-driven file processing and observability platform that implements and compares two Amazon S3 event architectures:
- **Architecture A (Direct S3 Event Notification):** S3 bucket directly invokes AWS Lambda A upon `s3:ObjectCreated:*` events.
- **Architecture B (Amazon EventBridge):** S3 events flow into the default EventBridge bus, where rules pattern-match metadata and route events to AWS Lambda B.

Both architectures execute **identical business workloads** (metadata extraction, security scan verification, indexing, classification), record real operational timestamps in Amazon DynamoDB, and stream structured telemetry into Amazon CloudWatch.

---

## 2. High-Level Topology

```
                       ┌─────────────────────────┐
                       │   React + TS Frontend   │
                       │   (Tailwind + Recharts) │
                       └────────────┬────────────┘
                                    │ HTTP / REST
                                    ▼
                       ┌─────────────────────────┐
                       │  Spring Boot 3 Backend  │
                       │   (Java 21 Monolith)    │
                       └────────┬────────┬───────┘
                                │        │
                       Upload   ▼        ▼ DynamoDB Query
                       ┌─────────┐   ┌───────────────────────────┐
                       │Amazon S3│   │      Amazon DynamoDB      │
                       └────┬────┘   │                           │
                            │        │ - EventFlowFiles          │
                 ┌──────────┴──────┐ │ - EventFlowEvents         │
                 │                 │ │ - EventFlowRules          │
                 ▼                 ▼ │ - EventFlowExperiments    │
          S3 Notification     EventBridge Bus                    │
                 │                 │ │                           │
                 ▼                 ▼ │                           │
             Lambda A        EventBridge Rule                    │
        (Direct Handler)           │ │                           │
                 │                 ▼ │                           │
                 │             Lambda B ─┘                       │
                 │         (EventBridge Handler)                 │
                 └─────────────────┼─────────────────────────────┘
                                   ▼
                           Amazon CloudWatch
                          (Structured JSON Logs)
```

---

## 3. Mathematical Latency Model

All latency metrics are calculated from UTC timestamps persisted during processing:

$$\text{eventDeliveryLatency} = T_{\text{receivedAt}} - T_{\text{objectCreatedAt}}$$
$$\text{processingLatency} = T_{\text{processingCompletedAt}} - T_{\text{processingStartedAt}}$$
$$\text{totalLatency} = T_{\text{processingCompletedAt}} - T_{\text{objectCreatedAt}}$$

### Percentile Calculation Formula
For a sorted array of $N$ measured total latencies:
$$\text{Index}_P = \max\left(0, \min\left(N - 1, \lceil \frac{P}{100} \times N \rceil - 1\right)\right)$$
Where $P \in \{50, 90, 95, 99\}$.

---

## 4. Failure Simulation Flow (Requirement 16)
To ensure reliable, deterministic demonstrations during hackathon presentations:
1. Files containing `failure-test` or `error-test` trigger a simulated payload validation failure in the Lambda processor.
2. The event transitions to status `FAILED` with category `LAMBDA_ERROR`.
3. The operator clicks **Retry Event** in the dashboard.
4. The system executes the recovery path, increments `retryCount`, and transitions the event to `SUCCESS`.

---

## 5. DynamoDB Schema Design
| Table Name | Partition Key | Key Attributes |
|---|---|---|
| `EventFlowFiles` | `fileId` (String) | `fileName`, `s3Key`, `fileSize`, `contentType`, `hash`, `status`, `uploadedAt`, `prefix` |
| `EventFlowEvents` | `eventId` (String) | `fileId`, `mechanism`, `eventType`, `status`, `objectCreatedAt`, `receivedAt`, `processingStartedAt`, `processingCompletedAt`, `eventDeliveryLatency`, `processingLatency`, `totalLatency`, `retryCount`, `errorMessage` |
| `EventFlowRules` | `ruleId` (String) | `name`, `prefix`, `eventType`, `target`, `enabled`, `createdAt`, `description` |
| `EventFlowExperiments` | `experimentId` (String) | `name`, `architecture`, `eventCount`, `successCount`, `failureCount`, `averageLatency`, `p50`, `p90`, `p95`, `p99`, `totalDuration`, `status` |
