# EventFlow — AWS Academy Learner Lab Setup Guide

This guide describes how to configure **EventFlow** in the AWS Academy Learner Lab environment.

---

## 1. Retrieve AWS Credentials from Learner Lab
1. In your **AWS Academy Learner Lab** console, click **AWS Details** (top-right).
2. Click **Show** next to *AWS CLI*.
3. Copy the 3 lines:
   ```
   aws_access_key_id = ASIA...
   aws_secret_access_key = ...
   aws_session_token = IQoJb...
   ```
4. Paste them into your `.env` file in the project root:
   ```env
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=ASIA...
   AWS_SECRET_ACCESS_KEY=...
   AWS_SESSION_TOKEN=IQoJb...
   AWS_S3_BUCKET=eventflow-hackathon-data-<your-unique-suffix>
   ```

---

## 2. Deploy Infrastructure via Script or Console

### Option A: Automated Python Script
Run in terminal:
```bash
python infrastructure/setup_aws.py
```
This automatically:
- Creates the S3 bucket with **Amazon EventBridge notification** enabled
- Provisions the 4 DynamoDB tables: `EventFlowFiles`, `EventFlowEvents`, `EventFlowRules`, `EventFlowExperiments`
- Registers default EventBridge rules

---

## 3. Deploying the Two Lambda Functions

In AWS Academy Learner Lab, all Lambda functions use the pre-created execution role: **`LabRole`**.

### Lambda A — S3 Notification Handler
1. Open **AWS Lambda Console** → Click **Create function**.
2. Select **Author from scratch**:
   - Function name: `EventFlow-Lambda-A-S3`
   - Runtime: `Python 3.12`
   - Architecture: `x86_64`
   - Permissions: Expand *Change default execution role* → Select **Use an existing role** → choose **`LabRole`**.
3. Click **Create function**.
4. In the **Code Source** editor, paste the contents of [`lambda-s3/lambda_function.py`](file:///lambda-s3/lambda_function.py).
5. Click **Deploy**.
6. **Add S3 Trigger**:
   - In the Lambda function overview, click **Add trigger**.
   - Select **S3**.
   - Choose your bucket (`eventflow-hackathon-data-...`).
   - Event type: **All object create events** (`s3:ObjectCreated:*`).
   - Prefix (optional): `uploads/`
   - Acknowledge recursive invocation warning & click **Add**.

---

### Lambda B — EventBridge Handler
1. Open **AWS Lambda Console** → Click **Create function**.
2. Select **Author from scratch**:
   - Function name: `EventFlow-Lambda-B-EventBridge`
   - Runtime: `Python 3.12`
   - Permissions: Select **Use an existing role** → choose **`LabRole`**.
3. Click **Create function**.
4. In the **Code Source** editor, paste the contents of [`lambda-eventbridge/lambda_function.py`](file:///lambda-eventbridge/lambda_function.py).
5. Click **Deploy**.
6. **Add EventBridge Trigger**:
   - In Lambda overview, click **Add trigger**.
   - Select **EventBridge (CloudWatch Events)**.
   - Rule: **Create a new rule**.
   - Rule name: `EventFlow-EventBridge-S3-Rule`.
   - Rule type: **Event pattern**.
   - Event pattern:
     ```json
     {
       "source": ["aws.s3"],
       "detail-type": ["Object Created"],
       "detail": {
         "bucket": {
           "name": ["your-bucket-name"]
         }
       }
     }
     ```
   - Click **Add**.

---

## 4. Verification Checklist
- [x] S3 bucket has **Amazon EventBridge** enabled under *Bucket properties* → *Amazon EventBridge*.
- [x] Lambda A is triggered directly by S3 Notification.
- [x] Lambda B is triggered by EventBridge Rule.
- [x] DynamoDB tables exist and receive events from both paths.
- [x] CloudWatch log groups `/aws/lambda/EventFlow-Lambda-A-S3` and `/aws/lambda/EventFlow-Lambda-B-EventBridge` output structured JSON logs.
