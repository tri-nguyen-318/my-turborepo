/**
 * ============================================================
 *  AWS S3 (Simple Storage Service) — Learning Lab
 * ============================================================
 *
 * S3 is AWS's object storage service. Think of it as a
 * giant file system in the cloud.
 *
 * Key concepts:
 *  - Bucket: A container for objects (like a top-level folder)
 *  - Object: A file stored in a bucket (identified by a key)
 *  - Key: The "path" to an object within a bucket
 *  - Presigned URL: A temporary URL that grants access to a private object
 *
 * Run: yarn s3
 */

import {
  S3Client,
  CreateBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  DeleteBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { awsConfig, section } from '../config';

const s3 = new S3Client(awsConfig);
const BUCKET = 'my-learning-bucket';

async function main() {
  // ──────────────────────────────────────────────
  //  1. Create a Bucket
  // ──────────────────────────────────────────────
  section('1. Create a Bucket');

  // Every object in S3 lives inside a bucket.
  // Bucket names must be globally unique across all AWS accounts.
  await s3.send(new CreateBucketCommand({ Bucket: BUCKET }));
  console.log(`✅ Bucket "${BUCKET}" created`);

  // Verify the bucket exists using HeadBucket
  await s3.send(new HeadBucketCommand({ Bucket: BUCKET }));
  console.log(`✅ Bucket "${BUCKET}" confirmed to exist`);

  // ──────────────────────────────────────────────
  //  2. Upload Objects (PutObject)
  // ──────────────────────────────────────────────
  section('2. Upload Objects');

  // Upload a text file
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: 'hello.txt', // The "path" in the bucket
      Body: 'Hello from S3! This is my first uploaded file.',
      ContentType: 'text/plain',
    }),
  );
  console.log('✅ Uploaded hello.txt');

  // Upload a JSON file — S3 stores any type of data
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: 'data/users.json', // Keys can have "/" to simulate folders
      Body: JSON.stringify({ users: [{ name: 'Tri', role: 'developer' }] }),
      ContentType: 'application/json',
    }),
  );
  console.log('✅ Uploaded data/users.json');

  // Upload a third file
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: 'data/config.json',
      Body: JSON.stringify({ version: '1.0', env: 'production' }),
      ContentType: 'application/json',
    }),
  );
  console.log('✅ Uploaded data/config.json');

  // ──────────────────────────────────────────────
  //  3. Download an Object (GetObject)
  // ──────────────────────────────────────────────
  section('3. Download an Object');

  // GetObject returns a readable stream in the Body
  const getResult = await s3.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: 'hello.txt',
    }),
  );

  // Convert the stream to a string
  const content = await getResult.Body?.transformToString();
  console.log(`📄 Content of hello.txt: "${content}"`);
  console.log(`📊 Content-Type: ${getResult.ContentType}`);
  console.log(`📊 Content-Length: ${getResult.ContentLength} bytes`);

  // ──────────────────────────────────────────────
  //  4. List Objects in a Bucket
  // ──────────────────────────────────────────────
  section('4. List Objects');

  // List all objects
  const listAll = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET }));
  console.log('All objects:');
  listAll.Contents?.forEach(obj => {
    console.log(`  📁 ${obj.Key} (${obj.Size} bytes, modified: ${obj.LastModified})`);
  });

  // List with a prefix — like filtering by "folder"
  const listData = await s3.send(
    new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: 'data/', // Only objects starting with "data/"
    }),
  );
  console.log('\nObjects with prefix "data/":');
  listData.Contents?.forEach(obj => {
    console.log(`  📁 ${obj.Key}`);
  });

  // ──────────────────────────────────────────────
  //  5. Generate a Presigned URL
  // ──────────────────────────────────────────────
  section('5. Presigned URL');

  // A presigned URL lets anyone download a private object
  // without needing AWS credentials. It expires after a set time.
  // This is how you share private files temporarily (e.g., user avatars, downloads).
  const presignedUrl = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: 'hello.txt' }),
    { expiresIn: 3600 }, // URL valid for 1 hour
  );
  console.log(`🔗 Presigned URL (valid 1 hour):\n   ${presignedUrl}`);

  // // ──────────────────────────────────────────────
  // //  6. Delete Objects and Bucket
  // // ──────────────────────────────────────────────
  // section('6. Cleanup — Delete Everything');

  // // Must delete all objects before deleting the bucket
  // const allObjects = await s3.send(
  //   new ListObjectsV2Command({ Bucket: BUCKET }),
  // );

  // for (const obj of allObjects.Contents || []) {
  //   await s3.send(
  //     new DeleteObjectCommand({ Bucket: BUCKET, Key: obj.Key! }),
  //   );
  //   console.log(`🗑️  Deleted object: ${obj.Key}`);
  // }

  // // Now delete the empty bucket
  // await s3.send(new DeleteBucketCommand({ Bucket: BUCKET }));
  // console.log(`🗑️  Deleted bucket: ${BUCKET}`);

  section('🎉 S3 Lab Complete!');
  console.log('You learned:');
  console.log('  • Creating and verifying buckets');
  console.log('  • Uploading files (PutObject)');
  console.log('  • Downloading files (GetObject)');
  console.log('  • Listing objects with prefix filtering');
  console.log('  • Generating presigned URLs for temporary access');
  console.log('  • Cleaning up (deleting objects and buckets)');
}

main().catch(console.error);
