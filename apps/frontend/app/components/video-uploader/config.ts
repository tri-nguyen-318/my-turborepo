// --- CONFIGURATION ---
// The URL of the Node.js server
export const SERVER_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/upload';
// Chunk size: 5MB minimum for S3 standard multipart upload
export const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
