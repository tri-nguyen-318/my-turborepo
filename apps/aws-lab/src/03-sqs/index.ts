/**
 * ============================================================
 *  AWS SQS (Simple Queue Service) — Learning Lab
 * ============================================================
 *
 * SQS is a fully managed message queue service.
 * It lets you decouple components by sending messages between them.
 *
 * Key concepts:
 *  - Queue: A buffer that stores messages until they're processed
 *  - Producer: Sends messages to the queue
 *  - Consumer: Reads and processes messages from the queue
 *  - Visibility Timeout: After reading, a message is hidden from other
 *    consumers for a period. If not deleted, it reappears.
 *  - Standard Queue: At-least-once delivery, best-effort ordering
 *  - FIFO Queue: Exactly-once delivery, guaranteed ordering
 *
 * Real-world uses:
 *  - Background job processing (email sending, image resizing)
 *  - Decoupling microservices
 *  - Buffering writes to a database
 *
 * Run: yarn sqs
 */

import {
  SQSClient,
  CreateQueueCommand,
  GetQueueAttributesCommand,
  SendMessageCommand,
  SendMessageBatchCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  DeleteQueueCommand,
} from '@aws-sdk/client-sqs';
import { awsConfig, section, sleep } from '../config';

const sqs = new SQSClient(awsConfig);

async function main() {
  // ──────────────────────────────────────────────
  //  1. Create a Queue
  // ──────────────────────────────────────────────
  section('1. Create a Queue');

  // Standard queue: high throughput, at-least-once delivery
  const createResult = await sqs.send(
    new CreateQueueCommand({
      QueueName: 'my-learning-queue',
      Attributes: {
        // How long a message is hidden after being read (seconds)
        VisibilityTimeout: '30',
        // How long messages stay in the queue before being deleted (seconds)
        MessageRetentionPeriod: '86400', // 1 day
      },
    }),
  );

  const queueUrl = createResult.QueueUrl!;
  console.log(`✅ Queue created: ${queueUrl}`);

  // Get queue attributes
  const attrs = await sqs.send(
    new GetQueueAttributesCommand({
      QueueUrl: queueUrl,
      AttributeNames: ['All'],
    }),
  );
  console.log('📊 Queue attributes:', attrs.Attributes);

  // ──────────────────────────────────────────────
  //  2. Send a Single Message
  // ──────────────────────────────────────────────
  section('2. Send a Single Message');

  // Messages are strings. For complex data, use JSON.stringify.
  const sendResult = await sqs.send(
    new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify({
        type: 'ORDER_CREATED',
        orderId: 'ORD-001',
        customer: 'Tri',
        total: 99.99,
      }),
      // MessageAttributes are metadata — useful for filtering
      MessageAttributes: {
        priority: {
          DataType: 'String',
          StringValue: 'high',
        },
      },
    }),
  );
  console.log(`✅ Message sent! ID: ${sendResult.MessageId}`);

  // ──────────────────────────────────────────────
  //  3. Send a Batch of Messages
  // ──────────────────────────────────────────────
  section('3. Send Batch Messages');

  // Batch sending is more efficient — up to 10 messages per call
  await sqs.send(
    new SendMessageBatchCommand({
      QueueUrl: queueUrl,
      Entries: [
        {
          Id: 'msg-1', // Unique ID within the batch
          MessageBody: JSON.stringify({ type: 'ORDER_CREATED', orderId: 'ORD-002' }),
        },
        {
          Id: 'msg-2',
          MessageBody: JSON.stringify({ type: 'ORDER_CREATED', orderId: 'ORD-003' }),
        },
        {
          Id: 'msg-3',
          MessageBody: JSON.stringify({ type: 'PAYMENT_RECEIVED', orderId: 'ORD-001' }),
        },
      ],
    }),
  );
  console.log('✅ Batch of 3 messages sent');

  // ──────────────────────────────────────────────
  //  4. Receive Messages (Consumer)
  // ──────────────────────────────────────────────
  section('4. Receive Messages');

  // ReceiveMessage does NOT automatically delete messages.
  // You must delete them after successful processing.
  // This ensures at-least-once delivery.
  const receiveResult = await sqs.send(
    new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 10, // Max 10 per call
      WaitTimeSeconds: 1, // Long polling — waits up to N seconds for messages
      MessageAttributeNames: ['All'], // Include custom attributes
    }),
  );

  console.log(`📬 Received ${receiveResult.Messages?.length || 0} messages:\n`);

  for (const msg of receiveResult.Messages || []) {
    const body = JSON.parse(msg.Body!);
    console.log(`  📩 Message ID: ${msg.MessageId}`);
    console.log(`     Body: ${JSON.stringify(body)}`);
    console.log(`     Receipt Handle: ${msg.ReceiptHandle?.substring(0, 30)}...`);
    console.log();

    // ──────────────────────────────────────────────
    //  5. Delete a Message (Acknowledge Processing)
    // ──────────────────────────────────────────────
    // After processing, delete the message so it doesn't get re-delivered.
    // If you don't delete it, it becomes visible again after VisibilityTimeout.
    await sqs.send(
      new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: msg.ReceiptHandle!,
      }),
    );
    console.log(`  🗑️  Deleted message: ${msg.MessageId}`);
  }

  // ──────────────────────────────────────────────
  //  6. Consumer Loop Pattern
  // ──────────────────────────────────────────────
  section('6. Consumer Loop (processing remaining messages)');

  // Real consumers run in a loop, continuously polling for messages.
  // Here we poll until the queue is empty.
  let processedCount = 0;
  let emptyPolls = 0;

  while (emptyPolls < 2) {
    const batch = await sqs.send(
      new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 1,
      }),
    );

    if (!batch.Messages || batch.Messages.length === 0) {
      emptyPolls++;
      continue;
    }

    emptyPolls = 0;
    for (const msg of batch.Messages) {
      // Process the message
      const body = JSON.parse(msg.Body!);
      console.log(`  ✅ Processed: ${body.type} (${body.orderId})`);
      processedCount++;

      // Delete after processing
      await sqs.send(
        new DeleteMessageCommand({
          QueueUrl: queueUrl,
          ReceiptHandle: msg.ReceiptHandle!,
        }),
      );
    }
  }

  console.log(`\n📊 Processed ${processedCount} remaining messages`);

  // ──────────────────────────────────────────────
  //  7. Cleanup
  // ──────────────────────────────────────────────
  section('7. Cleanup');

  await sqs.send(new DeleteQueueCommand({ QueueUrl: queueUrl }));
  console.log(`🗑️  Deleted queue`);

  section('🎉 SQS Lab Complete!');
  console.log('You learned:');
  console.log('  • Creating queues with custom attributes');
  console.log('  • Sending single and batch messages');
  console.log('  • Receiving messages with long polling');
  console.log('  • Deleting messages after processing');
  console.log('  • Building a consumer loop pattern');
  console.log('  • Message visibility timeout concept');
}

main().catch(console.error);
