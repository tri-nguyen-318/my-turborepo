/**
 * ============================================================
 *  AWS DynamoDB — Learning Lab
 * ============================================================
 *
 * DynamoDB is a fully managed NoSQL key-value & document database.
 * It's designed for high performance at any scale.
 *
 * Key concepts:
 *  - Table: A collection of items (like a MongoDB collection)
 *  - Item: A single record (like a document/row)
 *  - Partition Key (PK): The primary way to identify an item
 *  - Sort Key (SK): Optional secondary key for ordering/querying
 *  - GSI (Global Secondary Index): Alternative query patterns
 *
 * Run: yarn dynamodb
 */

import {
  DynamoDBClient,
  CreateTableCommand,
  DeleteTableCommand,
  DescribeTableCommand,
  waitUntilTableExists,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { awsConfig, section, sleep } from '../config';

// Low-level client for table operations
const dynamodb = new DynamoDBClient(awsConfig);

// Document client wraps the low-level client with easier JS object handling.
// Without it, you'd have to use DynamoDB's verbose attribute format:
//   { name: { S: "Tri" } } vs just { name: "Tri" }
const docClient = DynamoDBDocumentClient.from(dynamodb);

const TABLE = 'Users';

async function main() {
  // ──────────────────────────────────────────────
  //  1. Create a Table
  // ──────────────────────────────────────────────
  section('1. Create a Table');

  // DynamoDB tables need a key schema defined upfront.
  // Here we use "userId" as partition key and "email" as sort key.
  // This means we can query all items for a userId, sorted by email.
  await dynamodb.send(
    new CreateTableCommand({
      TableName: TABLE,
      KeySchema: [
        { AttributeName: 'userId', KeyType: 'HASH' }, // Partition key
        { AttributeName: 'email', KeyType: 'RANGE' }, // Sort key
      ],
      AttributeDefinitions: [
        { AttributeName: 'userId', AttributeType: 'S' }, // S = String
        { AttributeName: 'email', AttributeType: 'S' },
      ],
      BillingMode: 'PAY_PER_REQUEST', // On-demand pricing (no capacity planning)
    }),
  );
  console.log(`✅ Table "${TABLE}" creation initiated`);

  // Wait for table to be active
  await waitUntilTableExists(
    { client: dynamodb, maxWaitTime: 30 },
    { TableName: TABLE },
  );
  console.log(`✅ Table "${TABLE}" is ACTIVE`);

  // Describe the table to see its details
  const desc = await dynamodb.send(
    new DescribeTableCommand({ TableName: TABLE }),
  );
  console.log(`📊 Item count: ${desc.Table?.ItemCount}`);
  console.log(`📊 Status: ${desc.Table?.TableStatus}`);

  // ──────────────────────────────────────────────
  //  2. Put Items (Create/Insert)
  // ──────────────────────────────────────────────
  section('2. Put Items');

  // PutCommand creates or replaces an item entirely
  const users = [
    { userId: 'user-1', email: 'tri@example.com', name: 'Tri', age: 25, role: 'developer' },
    { userId: 'user-1', email: 'tri.work@example.com', name: 'Tri', age: 25, role: 'lead' },
    { userId: 'user-2', email: 'john@example.com', name: 'John', age: 30, role: 'designer' },
    { userId: 'user-3', email: 'alice@example.com', name: 'Alice', age: 28, role: 'developer' },
  ];

  for (const user of users) {
    await docClient.send(
      new PutCommand({ TableName: TABLE, Item: user }),
    );
    console.log(`✅ Inserted: ${user.name} (${user.email})`);
  }

  // ──────────────────────────────────────────────
  //  3. Get a Single Item
  // ──────────────────────────────────────────────
  section('3. Get Item');

  // GetCommand requires the full primary key (partition + sort key)
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE,
      Key: { userId: 'user-1', email: 'tri@example.com' },
    }),
  );
  console.log('📄 Retrieved item:', result.Item);

  // ──────────────────────────────────────────────
  //  4. Update an Item
  // ──────────────────────────────────────────────
  section('4. Update Item');

  // UpdateCommand modifies specific attributes without replacing the whole item
  const updated = await docClient.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { userId: 'user-1', email: 'tri@example.com' },
      // UpdateExpression uses a mini-language to describe changes
      UpdateExpression: 'SET age = :newAge, #r = :newRole',
      ExpressionAttributeNames: {
        '#r': 'role', // "role" is a reserved word, so we alias it
      },
      ExpressionAttributeValues: {
        ':newAge': 26,
        ':newRole': 'senior developer',
      },
      ReturnValues: 'ALL_NEW', // Return the updated item
    }),
  );
  console.log('✅ Updated item:', updated.Attributes);

  // ──────────────────────────────────────────────
  //  5. Query Items (by Partition Key)
  // ──────────────────────────────────────────────
  section('5. Query Items');

  // Query retrieves all items with the same partition key.
  // This is the most efficient way to read from DynamoDB.
  const queryResult = await docClient.send(
    new QueryCommand({
      TableName: TABLE,
      // KeyConditionExpression filters by key attributes
      KeyConditionExpression: 'userId = :uid',
      ExpressionAttributeValues: {
        ':uid': 'user-1',
      },
    }),
  );
  console.log(`📄 All items for user-1 (${queryResult.Count} items):`);
  queryResult.Items?.forEach((item) => {
    console.log(`  • ${item.email} — ${item.role}`);
  });

  // ──────────────────────────────────────────────
  //  6. Scan (Full Table Scan)
  // ──────────────────────────────────────────────
  section('6. Scan Table');

  // Scan reads every item in the table — expensive for large tables!
  // Use Query when possible. Scan is for analytics or small tables.
  const scanResult = await docClient.send(
    new ScanCommand({
      TableName: TABLE,
      // FilterExpression runs AFTER scanning — items are still read and billed
      FilterExpression: '#r = :role',
      ExpressionAttributeNames: { '#r': 'role' },
      ExpressionAttributeValues: { ':role': 'developer' },
    }),
  );
  console.log(`📄 All developers (${scanResult.Count} items):`);
  scanResult.Items?.forEach((item) => {
    console.log(`  • ${item.name} (${item.email})`);
  });

  // ──────────────────────────────────────────────
  //  7. Delete an Item
  // ──────────────────────────────────────────────
  section('7. Delete Item');

  await docClient.send(
    new DeleteCommand({
      TableName: TABLE,
      Key: { userId: 'user-3', email: 'alice@example.com' },
    }),
  );
  console.log('🗑️  Deleted user-3 (alice@example.com)');

  // ──────────────────────────────────────────────
  //  8. Cleanup — Delete Table
  // ──────────────────────────────────────────────
  section('8. Cleanup');

  await dynamodb.send(new DeleteTableCommand({ TableName: TABLE }));
  console.log(`🗑️  Deleted table: ${TABLE}`);

  section('🎉 DynamoDB Lab Complete!');
  console.log('You learned:');
  console.log('  • Creating tables with partition + sort keys');
  console.log('  • Using DocumentClient for easy JS object handling');
  console.log('  • Put (create), Get (read), Update, Delete operations');
  console.log('  • Query (efficient, by partition key)');
  console.log('  • Scan (full table read with filters)');
  console.log('  • UpdateExpression syntax and reserved word aliases');
}

main().catch(console.error);
