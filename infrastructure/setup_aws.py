"""
EventFlow AWS Infrastructure Provisioning Script
Compatible with AWS Academy Learner Lab (uses existing LabRole).
Provisions:
1. S3 Bucket (with EventBridge notifications enabled)
2. DynamoDB Tables: EventFlowFiles, EventFlowEvents, EventFlowRules, EventFlowExperiments
3. EventBridge Rules and permissions
"""

import os
import sys
import boto3
from botocore.exceptions import ClientError

# Ensure UTF-8 output on Windows
sys.stdout.reconfigure(encoding='utf-8')

# Read .env file from root directory
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
env_vars = {}
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env_vars[k.strip()] = v.strip()

def get_config(key, default=""):
    return os.environ.get(key) or env_vars.get(key, default)

region = get_config("AWS_REGION", "us-east-1")
bucket_name = get_config("AWS_S3_BUCKET", "eventflow-hackathon-data-demo")
access_key = get_config("AWS_ACCESS_KEY_ID")
secret_key = get_config("AWS_SECRET_ACCESS_KEY")
session_token = get_config("AWS_SESSION_TOKEN")

print("=======================================================")
print(f"  EventFlow AWS Setup — Region: {region}")
if access_key and "paste_your" not in access_key:
    print(f"  Access Key: {access_key[:8]}... (Configured)")
    if session_token:
        print("  Learner Lab Session Token: Present")
else:
    print("  Access Key: Not configured in .env")
print("=======================================================")

session_kwargs = {"region_name": region}
if access_key and secret_key and "paste_your" not in access_key:
    session_kwargs["aws_access_key_id"] = access_key
    session_kwargs["aws_secret_access_key"] = secret_key
    if session_token and "paste_your" not in session_token:
        session_kwargs["aws_session_token"] = session_token

session = boto3.Session(**session_kwargs)
s3 = session.client("s3")
dynamodb = session.client("dynamodb")
events = session.client("events")

# 1. Create S3 Bucket
def create_s3_bucket():
    print(f"\n[1/3] Creating/Checking S3 Bucket: {bucket_name}...")
    try:
        if region == "us-east-1":
            s3.create_bucket(Bucket=bucket_name)
        else:
            s3.create_bucket(
                Bucket=bucket_name,
                CreateBucketConfiguration={"LocationConstraint": region}
            )
        print(f"  [OK] S3 Bucket created: {bucket_name}")
    except ClientError as e:
        code = e.response["Error"]["Code"]
        if code in ["BucketAlreadyOwnedByYou", "BucketAlreadyExists"]:
            print(f"  [INFO] S3 Bucket already exists: {bucket_name}")
        else:
            print(f"  [WARN] S3 Bucket creation notice: {e}")

    # Enable EventBridge notification on S3 bucket
    try:
        s3.put_bucket_notification_configuration(
            Bucket=bucket_name,
            NotificationConfiguration={
                "EventBridgeConfiguration": {}
            }
        )
        print(f"  [OK] Amazon EventBridge notifications enabled on bucket: {bucket_name}")
    except Exception as e:
        print(f"  [WARN] Could not enable EventBridge on S3 bucket: {e}")

# 2. Create DynamoDB Tables
def create_dynamodb_tables():
    print("\n[2/3] Provisioning DynamoDB Tables...")
    tables = [
        {"name": "EventFlowFiles", "key": "fileId"},
        {"name": "EventFlowEvents", "key": "eventId"},
        {"name": "EventFlowRules", "key": "ruleId"},
        {"name": "EventFlowExperiments", "key": "experimentId"}
    ]

    for t in tables:
        t_name = t["name"]
        pk = t["key"]
        try:
            dynamodb.create_table(
                TableName=t_name,
                KeySchema=[{"AttributeName": pk, "KeyType": "HASH"}],
                AttributeDefinitions=[{"AttributeName": pk, "AttributeType": "S"}],
                BillingMode="PAY_PER_REQUEST"
            )
            print(f"  [OK] Created DynamoDB table: {t_name} (PK: {pk})")
        except ClientError as e:
            if e.response["Error"]["Code"] == "ResourceInUseException":
                print(f"  [INFO] DynamoDB table already exists: {t_name}")
            else:
                print(f"  [WARN] Notice for table {t_name}: {e}")

# 3. Create EventBridge Default Rules
def setup_eventbridge():
    print("\n[3/3] Setting up EventBridge Rules...")
    rule_name = "EventFlow-S3-ObjectCreated-Rule"
    import json
    pattern = {
        "source": ["aws.s3"],
        "detail-type": ["Object Created"],
        "detail": {
            "bucket": {
                "name": [bucket_name]
            }
        }
    }
    try:
        events.put_rule(
            Name=rule_name,
            EventPattern=json.dumps(pattern),
            State="ENABLED",
            Description="EventFlow: Routes S3 Object Created events to Lambda B"
        )
        print(f"  [OK] EventBridge rule created: {rule_name}")
    except Exception as e:
        print(f"  [WARN] EventBridge rule creation notice: {e}")

if __name__ == "__main__":
    try:
        create_s3_bucket()
        create_dynamodb_tables()
        setup_eventbridge()
        print("\n=======================================================")
        print("  EventFlow AWS Infrastructure setup completed!")
        print("=======================================================\n")
    except Exception as ex:
        print(f"\n[ERROR] Setup encountered an exception: {ex}")
