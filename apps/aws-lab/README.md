# AWS Learning Lab

Learn AWS services hands-on using **LocalStack** — a free local AWS emulator running in Docker. No AWS account needed.

## Prerequisites

- Docker & Docker Compose installed
- Node.js >= 18
- Yarn

## Quick Start

```bash
# 1. Start LocalStack
docker compose up localstack -d

# 2. Verify it's running
curl http://localhost:4566/_localstack/health

# 3. Go to the lab
cd apps/aws-lab

# 4. Run any lab
yarn s3
yarn dynamodb
yarn sqs
yarn sns
yarn lambda
```

## Useful Commands

```bash
# Check LocalStack status
docker compose ps localstack

# View LocalStack logs
docker compose logs localstack -f

# Stop LocalStack
docker compose down localstack

# List S3 buckets (while a lab is running, before cleanup)
aws --endpoint-url http://localhost:4566 --region us-east-1 s3 ls

# List DynamoDB tables
aws --endpoint-url http://localhost:4566 --region us-east-1 dynamodb list-tables

# List SQS queues
aws --endpoint-url http://localhost:4566 --region us-east-1 sqs list-queues
```

---

## Lab 01 — S3 (Simple Storage Service)

**What is S3?** Object storage in the cloud — like a giant file system for any type of data.

**Run:** `yarn s3`

**What it does:**

| Step | Operation | What you'll see |
|------|-----------|-----------------|
| 1 | Create a bucket | `✅ Bucket "my-learning-bucket" created` |
| 2 | Upload 3 files (text + JSON) | `✅ Uploaded hello.txt` |
| 3 | Download and read a file | `📄 Content of hello.txt: "Hello from S3!..."` |
| 4 | List objects with prefix filtering | Files listed with size and timestamp |
| 5 | Generate a presigned URL | A temporary signed URL printed to console |
| 6 | Delete everything | All objects and the bucket removed |

**Key concepts learned:**
- **Bucket** — a container for files (must be globally unique)
- **Key** — the "path" to a file inside a bucket (e.g. `data/users.json`)
- **Presigned URL** — a temporary link to access a private file without credentials
- **Prefix filtering** — simulating folders by filtering keys that start with `data/`

---

## Lab 02 — DynamoDB

**What is DynamoDB?** A fully managed NoSQL key-value database, designed for massive scale.

**Run:** `yarn dynamodb`

**What it does:**

| Step | Operation | What you'll see |
|------|-----------|-----------------|
| 1 | Create a table with partition + sort key | `✅ Table "Users" is ACTIVE` |
| 2 | Insert 4 user items | `✅ Inserted: Tri (tri@example.com)` |
| 3 | Get a single item by key | Full item printed with all attributes |
| 4 | Update an item's attributes | Updated item with new age and role |
| 5 | Query by partition key | All items for `user-1` (2 results) |
| 6 | Scan with filter | All users with role `developer` |
| 7 | Delete an item | `🗑️ Deleted user-3` |
| 8 | Delete the table | Table removed |

**Key concepts learned:**
- **Partition Key (PK)** — the main key to identify items (like a primary key)
- **Sort Key (SK)** — optional second key for ordering and range queries
- **Query vs Scan** — Query is fast (uses PK), Scan reads the whole table (expensive!)
- **UpdateExpression** — a mini-language to modify specific fields without replacing the whole item
- **DocumentClient** — a wrapper that lets you use plain JS objects instead of DynamoDB's verbose format

---

## Lab 03 — SQS (Simple Queue Service)

**What is SQS?** A message queue that decouples producers and consumers. One service sends messages, another processes them later.

**Run:** `yarn sqs`

**What it does:**

| Step | Operation | What you'll see |
|------|-----------|-----------------|
| 1 | Create a queue | `✅ Queue created: http://...` |
| 2 | Send a single message | `✅ Message sent! ID: ...` |
| 3 | Send a batch of 3 messages | `✅ Batch of 3 messages sent` |
| 4 | Receive and inspect messages | Message body, ID, and receipt handle printed |
| 5 | Delete messages after processing | `🗑️ Deleted message: ...` |
| 6 | Consumer loop (poll until empty) | `✅ Processed: ORDER_CREATED (ORD-002)` |
| 7 | Delete the queue | Queue removed |

**Key concepts learned:**
- **Producer/Consumer pattern** — one service sends, another reads and processes
- **Visibility Timeout** — after reading, a message is hidden from other consumers; if not deleted, it reappears
- **Long Polling** — `WaitTimeSeconds` makes the consumer wait for messages instead of returning empty immediately
- **Delete after processing** — you must explicitly delete messages; this ensures at-least-once delivery
- **Batch operations** — send up to 10 messages in a single API call for efficiency

---

## Lab 04 — SNS (Simple Notification Service)

**What is SNS?** A pub/sub service. A publisher sends one message to a "topic", and SNS delivers copies to all subscribers.

**Run:** `yarn sns`

**What it does:**

| Step | Operation | What you'll see |
|------|-----------|-----------------|
| 1 | Create an SNS topic | `✅ Topic created: arn:aws:sns:...` |
| 2 | Create 2 SQS queues as subscribers | `✅ Created queue: email-notifications` |
| 3 | Subscribe both queues to the topic | `✅ Email queue subscribed` |
| 4 | Publish 2 events to the topic | `✅ Published ORDER_CREATED event` |
| 5 | Read from both queues — same messages! | Both queues show the same order events |
| 6 | Cleanup | Topic, subscriptions, and queues deleted |

**Key concepts learned:**
- **Fan-out pattern** — 1 message → N subscribers (e.g., one order event triggers email + inventory + analytics)
- **SNS vs SQS** — SNS is push-based (one-to-many), SQS is pull-based (one-to-one)
- **SNS + SQS together** — the most common pattern: SNS fans out to multiple SQS queues, each processed independently
- **Topic/Subscription model** — publishers don't know about subscribers; adding a new consumer requires zero code changes to the publisher

---

## Lab 05 — Lambda

**What is Lambda?** Serverless compute — upload your code, AWS runs it on demand. No servers to manage.

**Run:** `yarn lambda`

**What it does:**

| Step | Operation | What you'll see |
|------|-----------|-----------------|
| 1 | Create a function from code | `✅ Function "my-hello-function" created` |
| 2 | Get function details | Runtime, memory, timeout, handler info |
| 3 | Invoke synchronously (wait for result) | `📄 Response: { message: "Hello, Tri!..." }` |
| 4 | Invoke with different payloads | 3 different inputs → 3 different outputs |
| 5 | List all functions | Functions listed with runtime and memory |
| 6 | Invoke asynchronously (fire & forget) | `📊 Status: 202 (accepted)` |
| 7 | Delete the function | Function removed |

**Key concepts learned:**
- **Handler** — the entry point function (`index.handler` = `index.js` file, `handler` export)
- **Synchronous vs Async invocation** — `RequestResponse` waits for result; `Event` returns immediately
- **Cold start** — first invocation is slower because Lambda needs to initialize a container
- **Event-driven** — in real AWS, Lambda is triggered by S3 uploads, SQS messages, API Gateway requests, scheduled cron, etc.
- **Pay-per-use** — you only pay for the time your code runs (no idle server costs)

---

## Learning Path

Run the labs in order — each builds on concepts from the previous one:

```
01-s3        → Storage basics (where your files live)
02-dynamodb  → Database basics (where your data lives)
03-sqs       → Messaging basics (how services talk to each other)
04-sns       → Pub/Sub + Fan-out (one event → many consumers, uses SQS from lab 03)
05-lambda    → Serverless compute (code that runs without servers)
```

## Troubleshooting

**LocalStack won't start:**
```bash
docker compose logs localstack  # Check logs for errors
docker compose down && docker compose up localstack -d  # Restart
```

**"Connection refused" errors:**
- Make sure LocalStack is running: `docker compose ps localstack`
- Check the health endpoint: `curl http://localhost:4566/_localstack/health`

**Port 4566 already in use:**
```bash
lsof -i :4566  # Find what's using the port
```
