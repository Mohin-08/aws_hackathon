"""
EventFlow - Lambda A (Direct S3 Event Notification Handler)
Triggered by Amazon S3 ObjectCreated events.
Executes common processing logic, measures latency, writes to DynamoDB and emits structured CloudWatch logs.
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
        "message": "Lambda A (S3 Notification) triggered",
        "raw_event": event
    }))

    results = []

    # Process all S3 records in the notification
    records = event.get("Records", [])
    if not records:
        print(json.dumps({"level": "WARN", "message": "No Records found in event payload"}))
        return {"statusCode": 400, "body": "No records found"}

    for record in records:
        event_time_str = record.get("eventTime", received_at_iso)
        bucket_name = record.get("s3", {}).get("bucket", {}).get("name", "")
        raw_key = record.get("s3", {}).get("object", {}).get("key", "")
        s3_key = urllib.parse.unquote_plus(raw_key)
        file_size = record.get("s3", {}).get("object", {}).get("size", 0)

        # Parse objectCreated time
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

        # Run Common Business Processing Logic
        proc_start_time = time.time()
        status = "SUCCESS"
        error_message = None
        error_category = None

        if is_failure_test:
            status = "FAILED"
            error_message = "Simulated processing failure: payload validation exception in Lambda A"
            error_category = "LAMBDA_ERROR"
        else:
            # Simulate business workload: metadata extraction, classification, index generation
            time.sleep(0.04) # 40ms CPU workload

        proc_end_time = time.time()
        completed_at_iso = datetime.now(timezone.utc).isoformat()
        proc_latency_ms = max(1, int((proc_end_time - proc_start_time) * 1000))
        total_latency_ms = delivery_latency_ms + proc_latency_ms

        event_record = {
            "eventId": event_id,
            "fileName": file_name,
            "s3Key": s3_key,
            "eventType": "OBJECT_CREATED",
            "mechanism": "S3_NOTIFICATION",
            "source": "aws.s3",
            "status": status,
            "objectCreatedAt": event_time_str,
            "receivedAt": received_at_iso,
            "processingStartedAt": received_at_iso,
            "processingCompletedAt": completed_at_iso,
            "eventDeliveryLatency": delivery_latency_ms,
            "processingLatency": proc_latency_ms,
            "totalLatency": total_latency_ms,
            "retryCount": 0,
            "processorName": "Lambda A (Direct S3 Notification Handler)"
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
            "mechanism": "S3_NOTIFICATION",
            "fileName": file_name,
            "s3Key": s3_key,
            "status": status,
            "eventDeliveryLatencyMs": delivery_latency_ms,
            "processingLatencyMs": proc_latency_ms,
            "totalLatencyMs": total_latency_ms,
            "error": error_message
        }))

        results.append(event_record)

    return {
        "statusCode": 200,
        "body": json.dumps({"processedCount": len(results), "events": results})
    }
