// --- CONFIGURATION ---
// The URL of the Node.js server
export const SERVER_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
// Chunk size: 5MB minimum for S3 standard multipart upload
export const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
// Maximum concurrent uploads to prevent overwhelming the server
export const MAX_CONCURRENT_UPLOADS = 3;
