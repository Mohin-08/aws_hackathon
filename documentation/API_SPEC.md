# EventFlow — REST API Specification

Base URL: `http://localhost:8080/api`

## 1. File Management APIs
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/files` | Multipart upload with validation, duplicate detection, S3 storage, and event triggering. |
| `GET` | `/files` | Query uploaded files with search, status, and prefix filters. |
| `GET` | `/files/{id}` | Retrieve file details by ID. |
| `DELETE` | `/files/{id}` | Delete file from S3 and remove DynamoDB metadata. |
| `POST` | `/files/validate` | Pre-flight validation of file extension, MIME type, size limit, and security rules. |
| `POST` | `/files/check-duplicate` | Compute SHA-256 hash and check against stored files. |

---

## 2. Event Management & Lifecycle APIs
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/events` | List events with filters (`mechanism`, `status`, `eventType`, `search`). |
| `GET` | `/events/{id}` | Get event details by ID. |
| `GET` | `/events/{id}/timeline` | Retrieve chronological lifecycle stages (`UPLOADED` &rarr; `EVENT_RECEIVED` &rarr; `PROCESSING` &rarr; `SUCCESS` / `FAILED`). |
| `POST` | `/events/{id}/retry` | Retry a failed event and record recovery attempt. |
| `POST` | `/events/{id}/replay` | Replay an existing event as a new execution cycle. |

---

## 3. EventBridge Routing Rules APIs
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/rules` | List all configured EventBridge routing rules. |
| `GET` | `/rules/{id}` | Get rule details. |
| `POST` | `/rules` | Create a new routing rule. |
| `PUT` | `/rules/{id}` | Update or enable/disable a rule. |
| `DELETE` | `/rules/{id}` | Remove a routing rule. |

---

## 4. Operational Analytics APIs
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/analytics/summary` | Overall count, success/failure rate, average latency, and mechanism breakdown. |
| `GET` | `/analytics/latency` | Calculate real P50, P90, P95, and P99 latency percentiles from DynamoDB records. |
| `GET` | `/analytics/errors` | Error categorization (`INVALID_FILE`, `LAMBDA_ERROR`, `TIMEOUT`, etc.). |
| `GET` | `/analytics/success-rate` | Reliability percentage metrics. |

---

## 5. Architectural Comparison APIs
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/comparison` | Complete side-by-side comparison of S3 Notifications vs EventBridge. |
| `GET` | `/comparison/latency` | Delivery vs processing latency decomposition. |
| `GET` | `/comparison/reliability` | Success and failure rates. |
| `GET` | `/comparison/routing` | Architectural trade-offs, coupling, and filtering capabilities. |

---

## 6. Benchmarking Experiments APIs
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/experiments` | List all historical benchmark runs. |
| `GET` | `/experiments/{id}` | Get single benchmark results. |
| `POST` | `/experiments` | Configure a new controlled test (10, 25, 50 files). |
| `POST` | `/experiments/{id}/run` | Execute the benchmark and record real P50, P95, min, max, and duration. |

---

## 7. System Health APIs
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/system/health` | Live connectivity status of Spring Boot, S3, DynamoDB, EventBridge, CloudWatch, and AWS credentials. |
