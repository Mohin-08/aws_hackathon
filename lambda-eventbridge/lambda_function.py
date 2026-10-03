"""
EventFlow - Lambda B (Amazon EventBridge Handler)
Triggered by Amazon EventBridge Rule matching S3 Object Created events.
Executes the identical common processing logic, measures latency, writes to DynamoDB, and emits structured CloudWatch logs.
"""

import json
import os
import time
import uuid
import urllib.parse
from datetime import datetime, timezone
import boto3

# Initialize AWS clients
region = os.environ.get("AWS_REGION", "us-east-1")
dynamodb = boto3.resource("dynamodb", region_name=region)
events_table_name = os.environ.get("AWS_DYNAMODB_EVENTS_TABLE", "EventFlowEvents")
table = dynamodb.Table(events_table_name)

def lambda_handler(event, context):
    start_time = time.time()
    now_utc = datetime.now(timezone.utc)
    received_at_iso = now_utc.isoformat()

    print(json.dumps({
        "level": "INFO",
        "message": "Lambda B (EventBridge) triggered",
        "raw_event": event
    }))

    detail = event.get("detail", {})
    bucket_name = detail.get("bucket", {}).get("name", "")
    raw_key = detail.get("object", {}).get("key", "")
    s3_key = urllib.parse.unquote_plus(raw_key) if raw_key else "unknown"
    file_size = detail.get("object", {}).get("size", 0)

    # EventBridge event time
    event_time_str = event.get("time", received_at_iso)
    try:
        object_created_dt = datetime.fromisoformat(event_time_str.replace("Z", "+00:00"))
    except Exception:
        object_created_dt = now_utc

    event_id = str(uuid.uuid4())
    file_name = s3_key.split("/")[-1] if "/" in s3_key else s3_key

    # Calculate Delivery Latency
    delivery_latency_ms = max(1, int((now_utc - object_created_dt).total_seconds() * 1000))

    # Check for deterministic failure simulation (Requirement 16)
    is_failure_test = "failure-test" in file_name.lower() or "error-test" in file_name.lower()

    # Determine processor based on prefix routing (Requirement 9.7)
    if "/invoices/" in s3_key:
        processor_name = "Lambda B - Invoice Processor (EventBridge Rule: invoices/*)"
    elif "/reports/" in s3_key:
        processor_name = "Lambda B - Report Processor (EventBridge Rule: reports/*)"
    elif "/images/" in s3_key:
        processor_name = "Lambda B - Image Processor (EventBridge Rule: images/*)"
    else:
        processor_name = "Lambda B - Default Router (EventBridge Rule: default)"

    # Run Identical Common Business Processing Logic (same duration/workload as Lambda A)
    proc_start_time = time.time()
    status = "SUCCESS"
    error_message = None
    error_category = None

    if is_failure_test:
        status = "FAILED"
        error_message = "Simulated processing failure: payload validation exception in Lambda B"
        error_category = "LAMBDA_ERROR"
    else:
        # Simulate identical business workload
        time.sleep(0.04) # 40ms CPU workload

    proc_end_time = time.time()
    completed_at_iso = datetime.now(timezone.utc).isoformat()
    proc_latency_ms = max(1, int((proc_end_time - proc_start_time) * 1000))
    total_latency_ms = delivery_latency_ms + proc_latency_ms

    event_record = {
        "eventId": event_id,
        "fileName": file_name,
        "s3Key": s3_key,
        "eventType": event.get("detail-type", "OBJECT_CREATED"),
        "mechanism": "EVENTBRIDGE",
        "source": event.get("source", "aws.s3"),
        "status": status,
        "objectCreatedAt": event_time_str,
        "receivedAt": received_at_iso,
        "processingStartedAt": received_at_iso,
        "processingCompletedAt": completed_at_iso,
        "eventDeliveryLatency": delivery_latency_ms,
        "processingLatency": proc_latency_ms,
        "totalLatency": total_latency_ms,
        "retryCount": 0,
        "processorName": processor_name,
        "ruleMatched": event.get("resources", ["default-rule"])[0] if event.get("resources") else "EventBridge S3 Rule"
    }

    if error_message:
        event_record["errorMessage"] = error_message
        event_record["errorCategory"] = error_category

    # Persist to DynamoDB
    try:
        table.put_item(Item=event_record)
    except Exception as e:
        print(json.dumps({"level": "ERROR", "message": f"DynamoDB write error: {str(e)}"}))

    # CloudWatch Structured Log
    print(json.dumps({
        "level": "INFO" if status == "SUCCESS" else "ERROR",
        "eventId": event_id,
        "mechanism": "EVENTBRIDGE",
        "fileName": file_name,
        "s3Key": s3_key,
        "status": status,
        "eventDeliveryLatencyMs": delivery_latency_ms,
        "processingLatencyMs": proc_latency_ms,
        "totalLatencyMs": total_latency_ms,
        "processor": processor_name,
        "error": error_message
    }))

    return {
        "statusCode": 200,
        "body": json.dumps({"event": event_record})
    }
