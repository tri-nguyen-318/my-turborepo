/**
 * ============================================================
 *  AWS Lambda — Learning Lab
 * ============================================================
 *
 * Lambda is AWS's serverless compute service.
 * You upload code, and AWS runs it in response to events.
 * You don't manage servers — AWS handles scaling automatically.
 *
 * Key concepts:
 *  - Function: Your code packaged and deployed to Lambda
 *  - Handler: The entry point function that Lambda calls
 *  - Event: The input data that triggers your function
 *  - Invocation: A single execution of your function
 *  - Cold Start: First invocation takes longer (container initialization)
 *  - Runtime: The language environment (Node.js, Python, etc.)
 *
 * Real-world uses:
 *  - API backends (with API Gateway)
 *  - Processing S3 uploads (image resizing)
 *  - Processing SQS messages
 *  - Scheduled tasks (cron jobs)
 *
 * Run: yarn lambda
 */

import {
  LambdaClient,
  CreateFunctionCommand,
  InvokeCommand,
  GetFunctionCommand,
  ListFunctionsCommand,
  DeleteFunctionCommand,
  waitUntilFunctionActiveV2,
} from '@aws-sdk/client-lambda';
import { awsConfig, section, sleep } from '../config';
import * as fs from 'fs';
import * as path from 'path';

const lambda = new LambdaClient(awsConfig);
const FUNCTION_NAME = 'my-hello-function';

/**
 * Create a ZIP file containing the Lambda handler.
 * In real AWS, you'd use a proper build tool. For LocalStack, we can
 * deploy the raw JS file.
 */
function getHandlerCode(): Buffer {
  const handlerPath = path.join(__dirname, 'handler.js');
  const code = fs.readFileSync(handlerPath);

  // For LocalStack, we need to create a simple ZIP
  // We'll use a minimal ZIP implementation
  return createSimpleZip('index.js', code);
}

/** Minimal ZIP file creator for a single file */
function createSimpleZip(filename: string, content: Buffer): Buffer {
  const crc32 = crc32buf(content);
  const filenameBytes = Buffer.from(filename);
  const now = new Date();
  const modTime =
    ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xffff;
  const modDate =
    (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xffff;

  // Local file header
  const localHeader = Buffer.alloc(30 + filenameBytes.length);
  localHeader.writeUInt32LE(0x04034b50, 0); // signature
  localHeader.writeUInt16LE(20, 4); // version needed
  localHeader.writeUInt16LE(0, 6); // flags
  localHeader.writeUInt16LE(0, 8); // compression (stored)
  localHeader.writeUInt16LE(modTime, 10);
  localHeader.writeUInt16LE(modDate, 12);
  localHeader.writeUInt32LE(crc32, 14);
  localHeader.writeUInt32LE(content.length, 18); // compressed size
  localHeader.writeUInt32LE(content.length, 22); // uncompressed size
  localHeader.writeUInt16LE(filenameBytes.length, 26);
  localHeader.writeUInt16LE(0, 28); // extra field length
  filenameBytes.copy(localHeader, 30);

  // Central directory header
  const centralDir = Buffer.alloc(46 + filenameBytes.length);
  centralDir.writeUInt32LE(0x02014b50, 0);
  centralDir.writeUInt16LE(20, 4); // version made by
  centralDir.writeUInt16LE(20, 6); // version needed
  centralDir.writeUInt16LE(0, 8);
  centralDir.writeUInt16LE(0, 10); // compression
  centralDir.writeUInt16LE(modTime, 12);
  centralDir.writeUInt16LE(modDate, 14);
  centralDir.writeUInt32LE(crc32, 16);
  centralDir.writeUInt32LE(content.length, 20);
  centralDir.writeUInt32LE(content.length, 24);
  centralDir.writeUInt16LE(filenameBytes.length, 28);
  centralDir.writeUInt16LE(0, 30); // extra
  centralDir.writeUInt16LE(0, 32); // comment
  centralDir.writeUInt16LE(0, 34); // disk
  centralDir.writeUInt16LE(0, 36); // internal attrs
  centralDir.writeUInt32LE(0, 38); // external attrs
  centralDir.writeUInt32LE(0, 42); // local header offset
  filenameBytes.copy(centralDir, 46);

  const centralDirOffset = localHeader.length + content.length;
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(1, 8); // entries on disk
  eocd.writeUInt16LE(1, 10); // total entries
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(centralDirOffset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([localHeader, content, centralDir, eocd]);
}

function crc32buf(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

async function main() {
  // ──────────────────────────────────────────────
  //  1. Create a Lambda Function
  // ──────────────────────────────────────────────
  section('1. Create a Lambda Function');

  const zipCode = getHandlerCode();
  console.log(`📦 Handler code packaged (${zipCode.length} bytes)`);

  await lambda.send(
    new CreateFunctionCommand({
      FunctionName: FUNCTION_NAME,
      Runtime: 'nodejs18.x', // Lambda runtime
      Role: 'arn:aws:iam::000000000000:role/lambda-role', // Dummy for LocalStack
      Handler: 'index.handler', // file.exportedFunction
      Code: {
        ZipFile: zipCode, // The zipped code
      },
      Description: 'My first Lambda function',
      Timeout: 30, // Max execution time in seconds
      MemorySize: 128, // MB of memory allocated
      Environment: {
        Variables: {
          APP_ENV: 'development',
          GREETING: 'Hello from Lambda!',
        },
      },
    }),
  );
  console.log(`✅ Function "${FUNCTION_NAME}" created`);

  await sleep(2000); // Give LocalStack time to set up

  // ──────────────────────────────────────────────
  //  2. Get Function Details
  // ──────────────────────────────────────────────
  section('2. Get Function Details');

  const funcInfo = await lambda.send(new GetFunctionCommand({ FunctionName: FUNCTION_NAME }));
  const config = funcInfo.Configuration!;
  console.log(`📊 Function Name: ${config.FunctionName}`);
  console.log(`📊 Runtime: ${config.Runtime}`);
  console.log(`📊 Handler: ${config.Handler}`);
  console.log(`📊 Memory: ${config.MemorySize} MB`);
  console.log(`📊 Timeout: ${config.Timeout} seconds`);
  console.log(`📊 Last Modified: ${config.LastModified}`);

  // ──────────────────────────────────────────────
  //  3. Invoke the Function (Synchronous)
  // ──────────────────────────────────────────────
  section('3. Invoke (Synchronous)');

  // RequestResponse = wait for the result (synchronous)
  const invokeResult = await lambda.send(
    new InvokeCommand({
      FunctionName: FUNCTION_NAME,
      InvocationType: 'RequestResponse', // Sync — waits for response
      Payload: Buffer.from(JSON.stringify({ name: 'Tri', action: 'learn AWS' })),
    }),
  );

  const responsePayload = JSON.parse(new TextDecoder().decode(invokeResult.Payload));
  console.log(`📊 Status Code: ${invokeResult.StatusCode}`);
  console.log(`📄 Response:`, JSON.stringify(responsePayload, null, 2));

  // ──────────────────────────────────────────────
  //  4. Invoke with Different Payloads
  // ──────────────────────────────────────────────
  section('4. Invoke with Different Payloads');

  const testCases = [
    { name: 'Alice', action: 'deploy' },
    { name: 'Bob', action: 'test' },
    {}, // Test default behavior (no name)
  ];

  for (const testPayload of testCases) {
    const result = await lambda.send(
      new InvokeCommand({
        FunctionName: FUNCTION_NAME,
        Payload: Buffer.from(JSON.stringify(testPayload)),
      }),
    );

    const resp = JSON.parse(new TextDecoder().decode(result.Payload));
    const body = JSON.parse(resp.body);
    console.log(`  📩 Input: ${JSON.stringify(testPayload)} → "${body.message}"`);
  }

  // ──────────────────────────────────────────────
  //  5. List All Functions
  // ──────────────────────────────────────────────
  section('5. List Functions');

  const listResult = await lambda.send(new ListFunctionsCommand({}));
  console.log(`📊 Total functions: ${listResult.Functions?.length}`);
  listResult.Functions?.forEach(fn => {
    console.log(`  • ${fn.FunctionName} (${fn.Runtime}, ${fn.MemorySize}MB)`);
  });

  // ──────────────────────────────────────────────
  //  6. Invoke Asynchronously (Fire & Forget)
  // ──────────────────────────────────────────────
  section('6. Invoke (Asynchronous / Fire & Forget)');

  // Event = fire-and-forget (async) — Lambda queues the invocation
  // Useful for background tasks where you don't need the result immediately
  const asyncResult = await lambda.send(
    new InvokeCommand({
      FunctionName: FUNCTION_NAME,
      InvocationType: 'Event', // Async — returns immediately
      Payload: Buffer.from(JSON.stringify({ name: 'Background Task', action: 'process data' })),
    }),
  );
  console.log(`📊 Async invocation status: ${asyncResult.StatusCode}`);
  console.log('   (202 = accepted, Lambda will process it in the background)');

  // ──────────────────────────────────────────────
  //  7. Cleanup
  // ──────────────────────────────────────────────
  section('7. Cleanup');

  await lambda.send(new DeleteFunctionCommand({ FunctionName: FUNCTION_NAME }));
  console.log(`🗑️  Deleted function: ${FUNCTION_NAME}`);

  section('🎉 Lambda Lab Complete!');
  console.log('You learned:');
  console.log('  • Creating Lambda functions with code, config & env vars');
  console.log('  • Inspecting function details');
  console.log('  • Synchronous invocation (RequestResponse)');
  console.log('  • Asynchronous invocation (Event / fire & forget)');
  console.log('  • Passing different payloads');
  console.log('  • Listing and deleting functions');
}

main().catch(console.error);
