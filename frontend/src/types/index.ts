export interface FileRecord {
  fileId: string;
  fileName: string;
  s3Key: string;
  fileSize: number;
  contentType: string;
  hash: string;
  status: 'UPLOADED' | 'PROCESSED' | 'ERROR' | 'DUPLICATE';
  uploadedAt: string;
  prefix: string;
  errorMessage?: string;
}

export interface EventRecord {
  eventId: string;
  fileId: string;
  fileName: string;
  s3Key: string;
  eventType: string;
  mechanism: 'S3_NOTIFICATION' | 'EVENTBRIDGE';
  source: string;
  status: 'EVENT_RECEIVED' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  objectCreatedAt: string;
  receivedAt: string;
  processingStartedAt?: string;
  processingCompletedAt?: string;
  eventDeliveryLatency?: number;
  processingLatency?: number;
  totalLatency?: number;
  retryCount: number;
  errorMessage?: string;
  errorCategory?: string;
  processorName?: string;
  ruleMatched?: string;
}

export interface TimelineItem {
  stage: string;
  timestamp: string;
  durationMs?: number;
  details: string;
  status: 'SUCCESS' | 'FAILED' | 'INFO' | 'WARNING';
}

export interface RuleRecord {
  ruleId: string;
  name: string;
  prefix: string;
  eventType: string;
  target: string;
  enabled: boolean;
  createdAt: string;
  description?: string;
}

export interface ExperimentRecord {
  experimentId: string;
  name: string;
  architecture: 'S3_NOTIFICATION' | 'EVENTBRIDGE' | 'BOTH';
  eventCount: number;
  successCount: number;
  failureCount: number;
  averageLatency?: number;
  p50?: number;
  p90?: number;
  p95?: number;
  p99?: number;
  minLatency?: number;
  maxLatency?: number;
  totalDuration?: number;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  startedAt?: string;
  completedAt?: string;
  notes?: string;
}

export interface AnalyticsSummary {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  inProgressEvents: number;
  successRate: number;
  failureRate: number;
  averageLatency: number;
  averageProcessingTime: number;
  totalFiles: number;
  eventsByMechanism: Record<string, number>;
  eventsByStatus: Record<string, number>;
}

export interface LatencyMetrics {
  architecture: string;
  sampleCount: number;
  averageDeliveryLatency: number;
  averageProcessingLatency: number;
  averageTotalLatency: number;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  minLatency: number;
  maxLatency: number;
}

export interface ErrorAnalytics {
  totalErrors: number;
  errorsByCategory: Record<string, number>;
  errorsByMechanism: Record<string, number>;
}

export interface ArchitectureMetrics {
  architecture: string;
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  successRate: number;
  failureRate: number;
  averageLatency: number;
  averageDeliveryLatency: number;
  averageProcessingLatency: number;
  p50Latency: number;
  p90Latency: number;
  p95Latency: number;
  p99Latency: number;
  minLatency: number;
  maxLatency: number;
  routingFlexibility: string;
  coupling: string;
  targetsSupported: string;
  filteringSupport: string;
}

export interface ComparisonData {
  s3Notification: ArchitectureMetrics;
  eventBridge: ArchitectureMetrics;
  featureComparison: Record<string, Record<string, string>>;
}

export interface SystemHealth {
  status: string;
  version: string;
  timestamp: string;
  services: Record<string, {
    status: string;
    details: string;
    latencyMs: number;
  }>;
  aws: {
    region: string;
    bucket: string;
    credentialsConfigured: boolean;
    sessionTokenPresent: boolean;
    iamRole: string;
  };
}
