/**
 * Shared AWS Configuration for LocalStack
 *
 * LocalStack emulates AWS services locally via Docker.
 * All services are available on a single endpoint: http://localhost:4566
 *
 * These credentials are dummy values — LocalStack accepts anything.
 */

export const awsConfig = {
  region: 'us-east-1',
  endpoint: 'http://localhost:4566',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
  // Required for S3 path-style access with LocalStack
  forcePathStyle: true,
};

/** Helper to pause execution — useful for waiting on async AWS operations */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Helper to print section headers */
export function section(title: string): void {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${'='.repeat(60)}\n`);
}
