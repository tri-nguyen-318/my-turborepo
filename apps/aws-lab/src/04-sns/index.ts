/**
 * ============================================================
 *  AWS SNS (Simple Notification Service) — Learning Lab
 * ============================================================
 *
 * SNS is a pub/sub messaging service.
 * A publisher sends a message to a "topic", and SNS delivers it
 * to all subscribers (SQS queues, Lambda functions, emails, etc).
 *
 * Key concepts:
 *  - Topic: A communication channel for sending messages
 *  - Publisher: Sends messages to a topic
 *  - Subscriber: Receives messages from a topic
 *  - Fan-out: One message → multiple subscribers (e.g., 1 order event
 *    triggers email, inventory update, and analytics)
 *
 * SNS vs SQS:
 *  - SNS: Push-based, one-to-many (pub/sub)
 *  - SQS: Pull-based, one-to-one (queue)
 *  - Often used together: SNS fans out to multiple SQS queues
 *
 * Run: yarn sns
 */

import {
  SNSClient,
  CreateTopicCommand,
  SubscribeCommand,
  PublishCommand,
  ListSubscriptionsByTopicCommand,
  UnsubscribeCommand,
  DeleteTopicCommand,
} from '@aws-sdk/client-sns';
import {
  SQSClient,
  CreateQueueCommand,
  GetQueueAttributesCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  DeleteQueueCommand,
} from '@aws-sdk/client-sqs';
import { awsConfig, section, sleep } from '../config';

const sns = new SNSClient(awsConfig);
const sqs = new SQSClient(awsConfig);

async function main() {
  // ──────────────────────────────────────────────
  //  1. Create an SNS Topic
  // ──────────────────────────────────────────────
  section('1. Create an SNS Topic');

  const topic = await sns.send(new CreateTopicCommand({ Name: 'order-events' }));
  const topicArn = topic.TopicArn!;
  console.log(`✅ Topic created: ${topicArn}`);

  // ──────────────────────────────────────────────
  //  2. Create SQS Queues as Subscribers
  // ──────────────────────────────────────────────
  section('2. Create SQS Subscribers (Fan-out Pattern)');

  // We'll create 2 queues that both subscribe to the same topic.
  // This demonstrates the "fan-out" pattern:
  //   1 order event → email service + inventory service

  const emailQueue = await sqs.send(new CreateQueueCommand({ QueueName: 'email-notifications' }));
  const inventoryQueue = await sqs.send(new CreateQueueCommand({ QueueName: 'inventory-updates' }));

  console.log(`✅ Created queue: email-notifications`);
  console.log(`✅ Created queue: inventory-updates`);

  // Get queue ARNs (needed for SNS subscription)
  const emailQueueArn = (
    await sqs.send(
      new GetQueueAttributesCommand({
        QueueUrl: emailQueue.QueueUrl!,
        AttributeNames: ['QueueArn'],
      }),
    )
  ).Attributes?.QueueArn;

  const inventoryQueueArn = (
    await sqs.send(
      new GetQueueAttributesCommand({
        QueueUrl: inventoryQueue.QueueUrl!,
        AttributeNames: ['QueueArn'],
      }),
    )
  ).Attributes?.QueueArn;

  // ──────────────────────────────────────────────
  //  3. Subscribe Queues to the Topic
  // ──────────────────────────────────────────────
  section('3. Subscribe to Topic');

  // Subscribe the email queue
  const emailSub = await sns.send(
    new SubscribeCommand({
      TopicArn: topicArn,
      Protocol: 'sqs', // Other protocols: email, https, lambda, sms
      Endpoint: emailQueueArn,
    }),
  );
  console.log(`✅ Email queue subscribed: ${emailSub.SubscriptionArn}`);

  // Subscribe the inventory queue
  const inventorySub = await sns.send(
    new SubscribeCommand({
      TopicArn: topicArn,
      Protocol: 'sqs',
      Endpoint: inventoryQueueArn,
    }),
  );
  console.log(`✅ Inventory queue subscribed: ${inventorySub.SubscriptionArn}`);

  // List all subscriptions for the topic
  const subs = await sns.send(new ListSubscriptionsByTopicCommand({ TopicArn: topicArn }));
  console.log(`\n📊 Total subscribers: ${subs.Subscriptions?.length}`);
  subs.Subscriptions?.forEach(sub => {
    console.log(`  • ${sub.Protocol} → ${sub.Endpoint}`);
  });

  // ──────────────────────────────────────────────
  //  4. Publish Messages to the Topic
  // ──────────────────────────────────────────────
  section('4. Publish Messages');

  // When we publish, BOTH queues receive the message
  await sns.send(
    new PublishCommand({
      TopicArn: topicArn,
      Subject: 'New Order', // Optional subject line
      Message: JSON.stringify({
        type: 'ORDER_CREATED',
        orderId: 'ORD-100',
        customer: 'Tri',
        items: ['Laptop', 'Mouse'],
        total: 1299.99,
      }),
      // Message attributes for filtering
      MessageAttributes: {
        eventType: {
          DataType: 'String',
          StringValue: 'ORDER_CREATED',
        },
      },
    }),
  );
  console.log('✅ Published ORDER_CREATED event');

  await sns.send(
    new PublishCommand({
      TopicArn: topicArn,
      Message: JSON.stringify({
        type: 'ORDER_SHIPPED',
        orderId: 'ORD-100',
        trackingNumber: 'TRK-12345',
      }),
    }),
  );
  console.log('✅ Published ORDER_SHIPPED event');

  // Wait for messages to propagate
  await sleep(1000);

  // ──────────────────────────────────────────────
  //  5. Verify Fan-out — Read from Both Queues
  // ──────────────────────────────────────────────
  section('5. Verify Fan-out');

  // Read from email queue
  console.log('📬 Email Notifications Queue:');
  const emailMessages = await sqs.send(
    new ReceiveMessageCommand({
      QueueUrl: emailQueue.QueueUrl!,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 2,
    }),
  );
  for (const msg of emailMessages.Messages || []) {
    const snsMessage = JSON.parse(msg.Body!);
    const payload = JSON.parse(snsMessage.Message);
    console.log(`  📩 ${payload.type}: Order ${payload.orderId}`);
    await sqs.send(
      new DeleteMessageCommand({
        QueueUrl: emailQueue.QueueUrl!,
        ReceiptHandle: msg.ReceiptHandle!,
      }),
    );
  }

  // Read from inventory queue
  console.log('\n📬 Inventory Updates Queue:');
  const inventoryMessages = await sqs.send(
    new ReceiveMessageCommand({
      QueueUrl: inventoryQueue.QueueUrl!,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 2,
    }),
  );
  for (const msg of inventoryMessages.Messages || []) {
    const snsMessage = JSON.parse(msg.Body!);
    const payload = JSON.parse(snsMessage.Message);
    console.log(`  📩 ${payload.type}: Order ${payload.orderId}`);
    await sqs.send(
      new DeleteMessageCommand({
        QueueUrl: inventoryQueue.QueueUrl!,
        ReceiptHandle: msg.ReceiptHandle!,
      }),
    );
  }

  console.log("\n💡 Both queues received the same messages — that's fan-out!");

  // ──────────────────────────────────────────────
  //  6. Cleanup
  // ──────────────────────────────────────────────
  section('6. Cleanup');

  // Unsubscribe
  await sns.send(new UnsubscribeCommand({ SubscriptionArn: emailSub.SubscriptionArn! }));
  await sns.send(new UnsubscribeCommand({ SubscriptionArn: inventorySub.SubscriptionArn! }));
  console.log('🗑️  Unsubscribed all');

  // Delete topic
  await sns.send(new DeleteTopicCommand({ TopicArn: topicArn }));
  console.log('🗑️  Deleted topic');

  // Delete queues
  await sqs.send(new DeleteQueueCommand({ QueueUrl: emailQueue.QueueUrl! }));
  await sqs.send(new DeleteQueueCommand({ QueueUrl: inventoryQueue.QueueUrl! }));
  console.log('🗑️  Deleted queues');

  section('🎉 SNS Lab Complete!');
  console.log('You learned:');
  console.log('  • Creating SNS topics');
  console.log('  • Subscribing SQS queues to topics');
  console.log('  • Publishing messages to topics');
  console.log('  • Fan-out pattern (1 message → N subscribers)');
  console.log('  • SNS + SQS integration');
  console.log('  • The difference between SNS (push) and SQS (pull)');
}

main().catch(console.error);
