# ⚡ EventFlow

> **S3 Event Notifications vs Amazon EventBridge — Design, Implementation & Operational Comparison**  
> *AWS Cloud Computing Hackathon Full-Stack Platform*

![Architecture Overview](https://img.shields.io/badge/AWS-S3%20%7C%20EventBridge%20%7C%20Lambda%20%7C%20DynamoDB%20%7C%20CloudWatch-FF9900?logo=amazon-aws)
![Java 21](https://img.shields.io/badge/Backend-Java%2021%20%7C%20Spring%20Boot%203.2-0284c7?logo=java)
![React](https://img.shields.io/badge/Frontend-React%20%7C%20TypeScript%20%7C%20Vite%20%7C%20Tailwind-61DAFB?logo=react)
![Environment](https://img.shields.io/badge/AWS%20Academy-Learner%20Lab%20Compatible-green)

---

## 🌟 Executive Summary

**EventFlow** is an enterprise-grade event-driven file processing and observability platform that implements, benchmarks, and objectively compares two foundational AWS event architectures:

1. **Architecture A — Direct S3 Event Notifications:**  
   `Client` &rarr; `Spring Boot` &rarr; `Amazon S3` &rarr; `S3:ObjectCreated` &rarr; `Lambda A` &rarr; `DynamoDB`
2. **Architecture B — Amazon EventBridge Routing:**  
   `Client` &rarr; `Spring Boot` &rarr; `Amazon S3` &rarr; `EventBridge Bus` &rarr; `Rule Pattern` &rarr; `Lambda B` &rarr; `DynamoDB`

### Critical Architectural Rule
Both **Lambda A** and **Lambda B** execute **identical business workloads** (document classification, SHA-256 integrity verification, metadata indexing, security analysis) so that operational comparisons isolate the event delivery and routing mechanism rather than differing business compute.

---

## 🏛️ System Topology

```
                         ┌───────────────────────────┐
                         │   React + TS Dashboard    │
                         │   (Tailwind CSS + Vite)   │
                         └─────────────┬─────────────┘
                                       │ HTTP / REST (:8085)
                                       ▼
                         ┌───────────────────────────┐
                         │   Spring Boot 3 Backend   │
                         │         (Java 21)         │
                         └─────────────┬─────────────┘
                                       │
                         Upload File   ▼  Query Metrics
                         ┌───────────────────┐     ┌────────────────────────────────┐
                         │     Amazon S3     │     │        Amazon DynamoDB         │
                         │   (us-east-1)     │     │                                │
                         │eventflow-bucket-  │     │  • EventFlowFiles              │
                         │   403799034212    │     │  • EventFlowEvents             │
                         └─────────┬─────────┘     │  • EventFlowRules              │
                                   │               │  • EventFlowExperiments       │
                 ┌─────────────────┴─────────────────┐                              │
                 │                                   │                              │
                 ▼                                   ▼                              │
        S3 Event Notification               Amazon EventBridge Bus                  │
        (Point-to-Point Push)                 (Decoupled Broker)                    │
                 │                                   │                              │
                 ▼                                   ▼                              │
              Lambda A                        EventBridge Rule                      │
        (Direct S3 Handler)             (prefix: uploads/invoices/*, etc.)          │
                 │                                   │                              │
                 │                                   ▼                              │
                 │                                Lambda B                          │
                 │                       (EventBridge Rule Handler)                 │
                 └───────────────────┬───────────────┘                              │
                                     │                                              │
                                     ▼ Persist Timestamps & Latency                 │
                                     └──────────────────────────────────────────────┘
                                     │
                                     ▼ Structured JSON Logs
                             Amazon CloudWatch
```

---

## 📊 Side-by-Side Architectural Comparison

| Dimension | Architecture A: Direct S3 Notification | Architecture B: Amazon EventBridge |
|---|---|---|
| **Topology** | Direct point-to-point push | Decoupled publish-subscribe broker |
| **Coupling** | **Tight:** S3 bucket configuration explicitly names target ARNs | **Loose:** S3 emits to bus; subscribers filter independently |
| **Delivery Latency** | **Fastest:** ~20–50 ms (minimal hop overhead) | **Low:** ~45–90 ms (bus serialization & rule evaluation) |
| **Target Ecosystem** | 3 targets (Lambda, SQS, SNS) | **20+ AWS targets** (Step Functions, Kinesis, ECS, Event Buses) |
| **Filtering Capability**| Simple prefix and suffix matching only | **Advanced JSON pattern matching** (prefixes, numeric ranges, exists) |
| **Fan-Out Model** | 1 target per prefix/suffix pair (requires SNS for fan-out) | **Native fan-out:** up to 5 targets per rule, multi-rule evaluation |
| **Event Replay / Archive**| None natively (requires manual rescan) | **Native Event Archive & Point-in-Time Replay** |
| **Dead-Letter Queue** | At Lambda execution level or SQS queue target | **Configurable directly on EventBridge Rule target** |
| **Cost Profile** | Zero charge for notification events | Free on default bus for AWS service events |

---

## 🧮 Mathematical Latency & Percentile Model

Every event records real UTC timestamps in Amazon DynamoDB:
- **Event Delivery Latency:** $L_{\text{delivery}} = T_{\text{receivedAt}} - T_{\text{objectCreatedAt}}$
- **Business Processing Latency:** $L_{\text{processing}} = T_{\text{processingCompletedAt}} - T_{\text{processingStartedAt}}$
- **Total End-to-End Latency:** $L_{\text{total}} = T_{\text{processingCompletedAt}} - T_{\text{objectCreatedAt}}$

### Real Percentile Calculation (P50, P90, P95, P99)
Percentiles are computed from real recorded events using nearest-rank percentile calculation:
$$\text{Rank}_P = \max\left(0, \min\left(N - 1, \lceil \frac{P}{100} \times N \rceil - 1\right)\right)$$

---

## 🚀 Quick Start Guide

### 1. Active AWS Configuration (`.env`)
The system is pre-configured with your AWS Academy Learner Lab environment:
- **Region:** `us-east-1`
- **S3 Bucket:** `eventflow-bucket-403799034212`
- **IAM Execution Role:** `LabRole`
- **Backend Port:** `8085` *(avoiding port 8080 collision with Oracle TNSLSNR)*

The configuration is saved in [`.env`](file:///.env) and [`backend/.env`](file:///backend/.env).

---

### 2. How to Start the Backend (Port 8085)

Open a terminal and run:
```powershell
cd backend
java -jar target\eventflow-backend-1.0.0.jar
```
*(If you make backend code modifications, rebuild with `mvn clean package -DskipTests` and run the command above).*

Verify backend health:
```powershell
curl http://localhost:8085/api/system/health
```

---

### 3. How to Start the Frontend (Port 5173)

Open a second terminal and run:
```powershell
cd frontend
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🎬 Step-by-Step Hackathon Demonstration Script

Follow this demo sequence during presentations:

1. **Dashboard & Pipeline Visualizer:**
   - Open **[http://localhost:5173](http://localhost:5173)**.
   - Walk judges through the animated dual-architecture pipeline visualizer showing both Path A and Path B.

2. **File Ingestion & Deduplication:**
   - Navigate to **File Management**.
   - Upload a test file (e.g. `invoice-101.pdf`) under prefix `uploads/invoices/`.
   - Show instantaneous SHA-256 hash generation, MIME type check, and automatic categorization.
   - Upload the exact same file again to show **Duplicate Detection Alert** preventing duplicate processing.

3. **Observe Direct S3 Notification (Path A):**
   - View the event in the **Event Explorer** table with mechanism `S3_NOTIFICATION`.
   - Inspect delivery latency (~25–45ms).

4. **Observe EventBridge Routing (Path B):**
   - View the parallel event processed with mechanism `EVENTBRIDGE`.
   - Inspect dynamic rule routing (`uploads/invoices/*` routed to `Invoice Processor`).

5. **Prefix Routing Demonstration:**
   - Upload a file to `uploads/reports/` to show rule routing to `Report Processor`.
   - Upload an image to `uploads/images/` to show rule routing to `Image Processor`.

6. **Deterministic Failure Simulation & Self-Healing:**
   - In File Management, click **Trigger Controlled Failure Test** (`failure-test.pdf`).
   - The event deterministically transitions to `FAILED` with category `LAMBDA_ERROR`.
   - Click on the event to open the **Event Lifecycle Timeline Modal** showing:
     `UPLOADED` &rarr; `EVENT_RECEIVED` &rarr; `PROCESSING` &rarr; `FAILED`.
   - Click **Retry Event** to demonstrate self-healing and recovery to `SUCCESS`.

7. **Controlled Benchmarking Suite:**
   - Go to **Experiments**.
   - Launch a **10, 25, or 50-file Controlled Benchmark**.
   - Watch live execution and explain measured **P50 (median)**, **P95 (SLA tail)**, and total duration.

8. **Architectural Comparison (The Balanced Verdict):**
   - Open the **Comparison** tab.
   - Review side-by-side measured latency vs architectural flexibility.
   - Explain why S3 Direct Notifications win for point-to-point speed, while EventBridge wins for enterprise decoupled multi-consumer ecosystems without declaring an artificial single winner.

---

## 📂 Project Structure

```
AWS_cc-hackathon/
├── frontend/                     # React + TypeScript + Vite + Tailwind CSS + Recharts
│   ├── src/components/
│   │   ├── Navbar.tsx            # Header navigation & AWS health indicator
│   │   ├── ArchitectureVisualizer.tsx # Live dual-path pipeline diagram
│   │   ├── DashboardTab.tsx      # Overview metrics & real-time charts
│   │   ├── FilesTab.tsx          # File upload, deduplication, validation
│   │   ├── EventsTab.tsx         # Event explorer, filters, retry/replay
│   │   ├── EventTimelineModal.tsx # Chronological lifecycle modal
│   │   ├── RulesTab.tsx          # EventBridge rule engine management
│   │   ├── AnalyticsTab.tsx      # P50/P90/P95/P99 latency percentiles & errors
│   │   ├── ComparisonTab.tsx     # Side-by-side architecture comparison
│   │   ├── ExperimentsTab.tsx    # Controlled benchmark suite (10/25/50 files)
│   │   └── SystemHealthTab.tsx   # Live AWS & backend status
│   ├── src/services/api.ts       # Typed Axios API Client
│   └── src/types/index.ts        # TypeScript data types
├── backend/                      # Java 21 + Spring Boot 3 + AWS SDK v2 Monolith
│   ├── controller/               # REST API Endpoints
│   ├── service/                  # Core Business Services & Latency Calculations
│   ├── aws/                      # S3, DynamoDB, EventBridge, CloudWatch SDK Services
│   ├── model/                    # FileRecord, EventRecord, RuleRecord, ExperimentRecord
│   ├── dto/                      # Request & Response Data Transfer Objects
│   └── config/                   # AwsConfig (SessionToken support), CORS, .env loader
├── lambda-s3/                    # Lambda A: Direct S3 Notification Handler
│   └── lambda_function.py
├── lambda-eventbridge/           # Lambda B: EventBridge Rule-based Handler
│   └── lambda_function.py
├── infrastructure/               # Automation Scripts & Setup
│   ├── setup_aws.py              # Automated S3, DynamoDB, EventBridge script
│   ├── cloudformation_template.yml # 1-Click CloudFormation template
│   └── deploy_guide.md           # AWS Academy Learner Lab Guide
├── documentation/
│   ├── ARCHITECTURE.md           # Topological diagrams & latency mathematics
│   ├── API_SPEC.md               # REST API documentation
│   └── COMPARISON_REPORT.md      # Detailed architectural trade-offs
├── .env                          # Local credentials configuration
├── .env.example                  # Configuration template
└── README.md
```

---

## 🛠️ Troubleshooting & Technical Notes

- **Port 8080 collision:** In Windows development environments, Oracle Database Listener (`TNSLSNR`) frequently claims port 8080. EventFlow uses port **8085** to eliminate port collisions.
- **Clock Skew (`RequestTimeTooSkewed`):** AWS Signature Version 4 requires client system time to be within 15 minutes of AWS atomic clocks. Synchronize Windows clock via *Settings* &rarr; *Time & Language* &rarr; *Sync now*.
- **AWS Learner Lab Credentials Expiry:** Learner Lab session tokens refresh every 4 hours. When renewing, update `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_SESSION_TOKEN` in [`.env`](file:///.env).
- **Cost Safety:** All AWS resources use serverless pay-per-request models (DynamoDB On-Demand, Lambda execution, S3 storage), completely avoiding expensive persistent compute (RDS, NAT Gateways, ELBs) to stay within student lab credit limits.
